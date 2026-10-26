import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { rectifyArt } from './rectify-art';
import type { Board03Bundle, GeometryPrimitive, Point, ViewId } from './types';
import type { ViewerState } from './viewer-state';

const IMAGE_PATH = '/assets/03-sun-temple.jpg';
const GEOMETRY_COLOR = 0x4df2ff;
const BALL_COLOR = 0xff4f87;
const CIRCLE_SAMPLES = 96;
const SEGMENT_SAMPLES = 32;

export class Board03Scene {
  readonly app = new Application();
  private readonly artLayer = new Container();
  private readonly geometryLayer = new Container();
  private readonly ballLayer = new Container();
  private perspectiveArt?: Sprite;
  private flatArt?: Sprite;

  constructor(
    private readonly host: HTMLElement,
    private readonly bundle: Board03Bundle,
    private readonly state: ViewerState,
  ) {}

  async init(): Promise<void> {
    const size = this.viewSize(this.state.view);
    await this.app.init({
      width: size.width,
      height: size.height,
      antialias: true,
      background: '#091015',
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });
    this.host.replaceChildren(this.app.canvas);
    this.app.stage.addChild(this.artLayer, this.geometryLayer, this.ballLayer);
    this.perspectiveArt = new Sprite(await Assets.load(IMAGE_PATH));
    this.artLayer.addChild(this.perspectiveArt);
    if (this.bundle.projection.mode === 'perspective') {
      const rectified = await rectifyArt(IMAGE_PATH, this.bundle.projection);
      this.flatArt = new Sprite(Texture.from(rectified));
      this.artLayer.addChild(this.flatArt);
    }
    this.render();
  }

  render(): void {
    const view = this.state.view;
    const size = this.viewSize(view);
    this.app.renderer.resize(size.width, size.height);
    this.artLayer.visible = this.state.visibility.art;
    this.geometryLayer.visible = this.state.visibility.geometry;

    if (this.perspectiveArt) {
      this.perspectiveArt.visible = view === 'perspective';
      this.perspectiveArt.width = this.bundle.projection.imageSize.width;
      this.perspectiveArt.height = this.bundle.projection.imageSize.height;
    }
    if (this.flatArt) {
      this.flatArt.visible = view === 'flat';
      this.flatArt.width = this.bundle.projection.flatSize.width;
      this.flatArt.height = this.bundle.projection.flatSize.height;
    }

    this.geometryLayer.removeChildren().forEach((child) => child.destroy());
    this.ballLayer.removeChildren().forEach((child) => child.destroy());

    for (const primitive of this.bundle.geometry) {
      this.geometryLayer.addChild(this.drawPrimitive(primitive, view));
    }

    const ball = this.state.snapshot.ball;
    const contour = this.drawSampledCircle(ball, ball.radius, view, BALL_COLOR, 4);
    contour.visible = this.state.visibility.geometry;
    this.ballLayer.addChild(contour);
  }

  private drawPrimitive(primitive: GeometryPrimitive, view: ViewId): Graphics {
    const graphics = new Graphics();
    if (primitive.kind === 'circle') {
      return this.drawSampledCircle(primitive.center, primitive.radius, view, GEOMETRY_COLOR, 3);
    }
    for (let index = 0; index <= SEGMENT_SAMPLES; index += 1) {
      const amount = index / SEGMENT_SAMPLES;
      const projected = this.project({
        x: primitive.from.x + (primitive.to.x - primitive.from.x) * amount,
        y: primitive.from.y + (primitive.to.y - primitive.from.y) * amount,
      }, view);
      if (index === 0) graphics.moveTo(projected.x, projected.y);
      else graphics.lineTo(projected.x, projected.y);
    }
    return graphics.stroke({
      color: GEOMETRY_COLOR,
      width: 3,
      alpha: 0.95,
    });
  }

  private drawSampledCircle(
    center: Readonly<Point>,
    radius: number,
    view: ViewId,
    color: number,
    width: number,
  ): Graphics {
    const graphics = new Graphics();
    for (let index = 0; index <= CIRCLE_SAMPLES; index += 1) {
      const angle = (2 * Math.PI * index) / CIRCLE_SAMPLES;
      const projected = this.project({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      }, view);
      if (index === 0) graphics.moveTo(projected.x, projected.y);
      else graphics.lineTo(projected.x, projected.y);
    }
    return graphics.stroke({ color, width, alpha: 0.95 });
  }

  private project(point: Readonly<Point>, view: ViewId): Point {
    return view === 'perspective'
      ? this.bundle.projection.simToImage(point)
      : this.bundle.projection.simToFlat(point);
  }

  private viewSize(view: ViewId): { width: number; height: number } {
    return view === 'perspective'
      ? this.bundle.projection.imageSize
      : this.bundle.projection.flatSize;
  }
}

