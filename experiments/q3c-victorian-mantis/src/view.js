import { Container, Graphics } from 'pixi.js';
import { clamp } from './model.js';

const C = { brass: 0xc6a269, edge: 0xf1d4a0, dark: 0x172124, blue: 0x263e43, copper: 0x95704a, glass: 0xf6bf5e, ink: 0x0e171b };
const line = { color: C.brass, width: 2 };

function segment(length, width, color) {
  const g = new Graphics();
  g.poly([0, -width * .46, length * .65, -width * .35, length, -width * .15, length, width * .15, length * .65, width * .35, 0, width * .46])
    .fill(color).stroke(line);
  g.moveTo(7, -width * .15).lineTo(length - 9, -width * .09).stroke({ color: C.edge, width: 1, alpha: .55 });
  g.circle(0, 0, width * .53).fill(C.copper).stroke(line);
  g.circle(0, 0, width * .22).fill(C.dark).stroke({ color: C.edge, width: 1 });
  return g;
}

function pivot(parent, x = 0, y = 0) {
  const node = new Container();
  node.position.set(x, y);
  parent.addChild(node);
  return node;
}

export class SceneView {
  constructor(app, specs) {
    this.app = app;
    this.world = new Container();
    app.stage.addChild(this.world);
    this.floor = new Graphics();
    this.world.addChild(this.floor);
    this.beacon = new Graphics();
    this.world.addChild(this.beacon);
    this.shadow = new Graphics();
    this.world.addChild(this.shadow);
    this.body = new Container();
    this.body.label = 'capsule-chassis';
    this.world.addChild(this.body);
    // This graph is never swapped by state: Artist will skin these fixed parts.
    const recess = new Graphics().ellipse(0, 0, 115, 82).fill(C.ink).stroke({ color: C.copper, width: 3 });
    this.body.addChild(recess);
    this.legs = new Map();
    for (const spec of specs) {
      const mount = pivot(this.body, spec.side * spec.mount, 8);
      mount.label = spec.id;
      mount.scale.x = spec.side;
      const upper = pivot(mount);
      upper.addChild(segment(spec.upper, spec.id.startsWith('front') ? 21 : 15, C.blue));
      const knee = pivot(upper, spec.upper, 0);
      knee.addChild(segment(spec.lower, spec.id.startsWith('front') ? 16 : 12, C.copper));
      const foot = pivot(knee, spec.lower, 0);
      foot.addChild(new Graphics().poly([-9, -5, 11, -5, 15, 3, -13, 3]).fill(C.brass).stroke({ color: C.edge, width: 1 }));
      this.legs.set(spec.id, { mount, upper, knee, foot });
    }
    this.rail = new Graphics().roundRect(62, -44, 28, 54, 6).fill(C.copper).stroke(line);
    this.body.addChild(this.rail);
    this.carriage = pivot(this.body, 76, -18);
    this.carriage.label = 'head-carriage';
    this.carriage.addChild(new Graphics().roundRect(-8, 10, 16, 70, 4).fill(0xcbb88c).stroke({ color: C.copper, width: 2 }));
    this.head = pivot(this.carriage);
    this.head.label = 'optical-head';
    this.head.addChild(new Graphics().ellipse(0, 0, 28, 25).fill(C.copper).stroke({ color: C.edge, width: 3 })
      .ellipse(0, 0, 21, 21).fill(C.dark).stroke({ color: C.brass, width: 2 })
      .ellipse(0, 0, 16, 17).fill(C.glass).stroke({ color: 0xf4e0a7, width: 1 }));
    this.pupil = new Graphics().ellipse(0, 0, 5, 11).fill(C.ink)
      .ellipse(-4, -6, 4, 6).fill({ color: 0xffedb6, alpha: .85 });
    this.head.addChild(this.pupil);
    // Armor is assembled around physical bays, rather than clipping the entire rig.
    const armor = new Graphics();
    armor.moveTo(-111, 17).bezierCurveTo(-122, -45, -27, -102, 48, -68)
      .lineTo(48, -40).lineTo(105, -40).quadraticCurveTo(117, -17, 108, 17)
      .closePath().fill(C.blue).stroke(line);
    armor.moveTo(-94, -5).bezierCurveTo(-91, -42, -33, -75, 27, -65).stroke({ color: C.edge, width: 1, alpha: .6 });
    for (const [x, y] of [[-87, -9], [-57, -43], [-8, -63], [31, -57], [98, -22]]) armor.circle(x, y, 2.4).fill(C.brass);
    this.body.addChild(armor);
    const keel = new Graphics().roundRect(-23, -46, 46, 122, 12).fill(C.blue).stroke(line)
      .roundRect(-14, -28, 28, 62, 6).fill(C.dark).stroke({ color: C.copper, width: 1 });
    keel.circle(0, 48, 12).fill(C.copper).stroke(line).circle(0, 48, 5).fill(C.dark);
    this.body.addChild(keel);
    this.doors = new Map();
    for (const side of [-1, 1]) {
      const hinge = pivot(this.body, side * 63, 16);
      const plate = new Graphics().poly([-38, 0, 34, 0, 28, 32, 10, 55, -14, 64, -38, 58])
        .fill(C.blue).stroke({ color: C.brass, width: 3 });
      plate.moveTo(-29, 12).lineTo(20, 12).lineTo(5, 45).lineTo(-26, 49).stroke({ color: C.edge, width: 1, alpha: .65 });
      plate.circle(0, 1, 8).fill(C.copper).stroke(line).circle(0, 1, 3).fill(C.dark);
      plate.scale.x = side;
      hinge.addChild(plate);
      this.doors.set(side, hinge);
    }
    this.lid = pivot(this.body, 48, -68);
    this.lid.addChild(new Graphics().poly([0, 0, 25, -5, 49, 16, 59, 28, 0, 28]).fill(C.blue).stroke(line));
    this.contact = new Graphics();
    this.world.addChild(this.contact);
    this.camera = { scale: 1, x: 0, y: 0 };
  }

  resize(width, height) {
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    const scale = Math.min(width / 580, height / 520, 1.35);
    this.camera = { scale, x: width * .5, y: height * .75 };
    this.world.position.set(this.camera.x, this.camera.y);
    this.world.scale.set(scale);
    const span = width / scale;
    this.floor.clear().moveTo(-span, 4).lineTo(span, 4).stroke({ color: 0x879185, width: 1, alpha: .35 });
    for (let x = -Math.ceil(span / 50) * 50; x <= span; x += 50) {
      this.floor.moveTo(x, 7).lineTo(x - 50, 130).stroke({ color: 0x566362, width: 1, alpha: .08 });
    }
  }

  toWorld(x, y) {
    return { x: (x - this.camera.x) / this.camera.scale, y: (y - this.camera.y) / this.camera.scale };
  }

  render(snapshot) {
    const { pose, time, phase } = snapshot;
    const { body, legs, hatches, lid, eye } = pose;
    this.body.position.set(body.x, body.y);
    this.body.rotation = body.rotation;
    for (const leg of legs) {
      const nodes = this.legs.get(leg.id);
      nodes.upper.rotation = leg.upperAngle;
      nodes.knee.rotation = leg.kneeAngle;
      nodes.foot.rotation = -leg.upperAngle - leg.kneeAngle - leg.side * body.rotation;
    }
    for (const hatch of hatches) this.doors.get(hatch.side).rotation = hatch.angle;
    this.lid.rotation = lid.angle;
    this.carriage.position.set(eye.x, eye.y);
    this.head.rotation = eye.rotation;
    this.pupil.position.set(eye.gazeX * 5, eye.gazeY * 3);
    const signal = snapshot.active ? 1 : .25;
    const pulse = .5 + .5 * Math.sin(time * 7);
    this.beacon.clear().ellipse(0, 1, 34, 7).fill(C.dark).stroke({ color: C.brass, width: 1.5 })
      .roundRect(-12, -7, 24, 8, 3).fill(C.copper).stroke({ color: C.edge, width: 1 })
      .ellipse(0, -6, 7, 3).fill({ color: 0xffd582, alpha: .55 + signal * .4 });
    this.beacon.ellipse(0, -5, 23 + 6 * pulse, 9 + pulse * 3).fill({ color: C.glass, alpha: .045 + .08 * signal });
    if (snapshot.active && time < .4) {
      this.beacon.ellipse(0, 0, 34 + time * 110, 7 + time * 24).stroke({ color: C.glass, width: 2, alpha: 1 - time / .4 });
    }
    const closeness = clamp(1 + body.y / 780);
    this.shadow.clear().ellipse(0, 5, 60 + closeness * 50, 6 + closeness * 5).fill({ color: 0x000000, alpha: .32 * closeness });
    this.contact.clear();
    if (phase === 'impact') {
      const t = pose.phase.local;
      const opacity = clamp(1 - t / .6);
      this.contact.ellipse(0, 1, 28 + t * 240, 4 + t * 16).stroke({ color: C.edge, width: 2, alpha: opacity * .6 });
      for (let i = 0; i < 10; i++) {
        const side = i % 2 ? 1 : -1;
        const speed = 40 + i * 15;
        const x = side * (18 + speed * t);
        const y = -Math.max(0, (38 + i * 7) * t - 110 * t * t);
        this.contact.circle(x, y, 1.5 + i % 2).fill({ color: C.brass, alpha: opacity });
      }
    }
  }
}
