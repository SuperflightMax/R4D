import { Assets, Container, Graphics, Matrix, Sprite } from 'pixi.js';
import { clamp } from './motion.js';
import { FULL_RIG, RIG_PARTS } from './rig.js';

const svgUrls = import.meta.glob('../assets/production-v1/parts/*.svg', { eager: true, query: '?url', import: 'default' });
const { xPerZ, yPerZ } = FULL_RIG.coordinates.projection;
const byId = new Map(RIG_PARTS.map(part => [part.id, part]));
const brass = 0xc6a269;
const edge = 0xf1d4a0;

export async function loadProductionSkins() {
  const needed = new Set();
  for (const part of RIG_PARTS) {
    if (!part.draw) continue;
    needed.add(part.draw.asset);
    if (part.draw.backAsset) needed.add(part.draw.backAsset);
  }
  return new Map(await Promise.all([...needed].map(async name => {
    const art = FULL_RIG.assets[name];
    const url = art && svgUrls['../assets/' + art.path];
    if (!url) throw new Error('Нет детали production-v1: ' + name);
    return [name, await Assets.load(url)];
  })));
}

function sprite(name, offset, textures) {
  const art = FULL_RIG.assets[name];
  const node = new Sprite({ texture: textures.get(name), label: name });
  node.anchor.set(...art.spriteAnchor);
  node.width = art.viewBox[2];
  node.height = art.viewBox[3];
  node.position.set(...offset);
  return node;
}

export class SceneView {
  constructor(app, textures) {
    this.world = new Container();
    app.stage.addChild(this.world);
    this.floor = new Graphics();
    this.beacon = new Graphics();
    this.shadow = new Graphics();
    this.world.addChild(this.floor, this.beacon, this.shadow);
    this.pieces = new Map();
    this.matrix = new Matrix();
    for (const id of FULL_RIG.drawOrder) {
      const { draw } = byId.get(id);
      const node = new Container({ label: id });
      this.world.addChild(node);
      const front = draw && sprite(draw.asset, draw.offset, textures);
      const back = draw?.backAsset ? sprite(draw.backAsset, draw.offset, textures) : null;
      if (front) node.addChild(front);
      if (back) node.addChild(back);
      this.pieces.set(id, { node, front, back });
    }
    this.contact = new Graphics();
    this.world.addChild(this.contact);
    this.camera = { scale: 1, x: 0, y: 0 };
    this.skinInfo = Object.freeze({ id: FULL_RIG.id, nodes: this.pieces.size, textures: textures.size });
  }

  resize(width, height) {
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    const scale = Math.min(width / 460, height / 466, 1.52);
    this.camera = { scale, x: width * .47, y: height * .79 };
    this.world.position.set(this.camera.x, this.camera.y);
    this.world.scale.set(scale);
    const span = width / scale;
    this.floor.clear().moveTo(-span, 4).lineTo(span, 4).stroke({ color: 0x879185, width: 1, alpha: .25 });
    for (let x = -Math.ceil(span / 52) * 52; x <= span; x += 52) {
      this.floor.moveTo(x, 4).lineTo(x - 44, 124).stroke({ color: 0x566362, width: 1, alpha: .1 });
    }
  }

  toWorld(x, y) {
    return { x: (x - this.camera.x) / this.camera.scale, y: (y - this.camera.y) / this.camera.scale };
  }

  render(snapshot) {
    const { pose, time, phase } = snapshot;
    const bodyC = Math.cos(pose.body.rotation);
    const bodyS = Math.sin(pose.body.rotation);
    const depthX = bodyC * xPerZ - bodyS * yPerZ;
    const depthY = bodyS * xPerZ + bodyC * yPerZ;
    for (const [id, piece] of this.pieces) {
      const { local, world } = pose.parts[id];
      const c = Math.cos(world.rotation), s = Math.sin(world.rotation);
      const dx = xPerZ * Math.sin(local.roll);
      const dy = Math.cos(local.roll) + yPerZ * Math.sin(local.roll);
      const z = world.z + (world.depth || 0);
      const x = world.x + depthX * z, y = world.y + depthY * z;
      if (world.tilt) {
        const tiltX = depthX * Math.sin(world.tilt);
        const tiltY = Math.cos(world.tilt) + depthY * Math.sin(world.tilt);
        this.matrix.set(c + s * tiltX, s * tiltY, -s + c * tiltX, c * tiltY, x, y);
      } else {
        this.matrix.set(c, s, c * dx - s * dy, s * dx + c * dy, x, y);
      }
      piece.node.setFromMatrix(this.matrix);
      if (piece.back) {
        // The determinant crosses zero at the edge of the same rigid plate.
        // Both physical surfaces are loaded once for the entire sequence.
        piece.front.visible = dy >= 0;
        piece.back.visible = dy < 0;
      }
    }
    this.renderFloorEffects(pose, time, phase, snapshot.active);
  }

  trace(pose) {
    const parts = Object.create(null);
    for (const [id, { node, front, back }] of this.pieces) {
      node.updateLocalTransform();
      const { a, b, c, d, tx, ty } = node.localTransform;
      const { parent, world } = pose.parts[id];
      const cos = Math.cos(world.rotation), sin = Math.sin(world.rotation);
      const vertical = Math.cos(world.tilt || 0);
      // Nodes are direct children of the camera container in depth order.
      // Their local Pixi matrices are the rendered transforms before the camera.
      parts[id] = {
        token: String(node.uid), parent, asset: front?.label ?? `rig:${id}`,
        surface: (back?.visible ? back : front)?.label ?? null,
        matrix: [a, b, c, d, tx, ty],
        physicalMatrix: [cos, sin * vertical, -sin, cos * vertical, world.x, world.y],
      };
    }
    return { camera: { ...this.camera }, parts };
  }

  renderFloorEffects(pose, time, phase, active) {
    const signal = active ? 1 : .25;
    const pulse = .5 + .5 * Math.sin(time * 7);
    this.beacon.clear().ellipse(0, 1, 34, 7).fill(0x172124).stroke({ color: brass, width: 1.5 })
      .roundRect(-12, -7, 24, 8, 3).fill(0x95704a).stroke({ color: edge, width: 1 })
      .ellipse(0, -6, 7, 3).fill({ color: 0xffd582, alpha: .55 + signal * .4 });
    this.beacon.ellipse(0, -5, 23 + 6 * pulse, 9 + pulse * 3).fill({ color: 0xf6bf5e, alpha: .045 + .08 * signal });
    if (phase === 'beacon') {
      this.beacon.ellipse(0, 0, 34 + time * 110, 7 + time * 24).stroke({ color: 0xf6bf5e, width: 2, alpha: 1 - time / .4 });
    }
    const closeness = active ? clamp(1 + pose.body.y / 780) : 0;
    this.shadow.clear().ellipse(pose.body.x, 5, 57 + closeness * 40, 7 + closeness * 6)
      .fill({ color: 0x000000, alpha: .31 * closeness });
    for (const leg of pose.legs) {
      if (!leg.planted) continue;
      const z = leg.world.ankle.z;
      this.shadow.ellipse(leg.world.ankle.x + xPerZ * z, yPerZ * z + 1, 10, 2.7)
        .fill({ color: 0x000000, alpha: .34 });
    }
    this.contact.clear();
    if (phase !== 'impact') return;
    const t = pose.phase.local;
    const opacity = clamp(1 - t / .6);
    this.contact.ellipse(0, 1, 28 + t * 240, 4 + t * 16).stroke({ color: edge, width: 2, alpha: opacity * .6 });
    for (let i = 0; i < 10; i++) {
      const x = (i % 2 ? 1 : -1) * (18 + (40 + i * 15) * t);
      const y = -Math.max(0, (38 + i * 7) * t - 110 * t * t);
      this.contact.circle(x, y, 1.5 + i % 2).fill({ color: brass, alpha: opacity });
    }
  }
}
