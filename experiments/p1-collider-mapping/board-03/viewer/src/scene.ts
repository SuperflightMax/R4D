import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { rectifyArt } from './rectify-art';
import type { BoardBundle, GeometryPrimitive, Point, ViewId } from './types';
import type { ViewerState } from './viewer-state';

const GEOMETRY_COLOR = 0x4df2ff;
const BOUNDARY_COLOR = 0xffc857;
const GOAL_COLOR = 0xb9ff66;
const BALL_COLOR = 0xff4f87;
const CIRCLE_SAMPLES = 96;
const SEGMENT_SAMPLES = 32;

export class BoardScene {
  readonly app = new Application();
  private readonly artLayer = new Container();
  private readonly ballArtLayer = new Container();
  private readonly geometryLayer = new Container();
  private perspectiveArt?: Sprite;
  private flatArt?: Sprite;
  private ballArt?: Sprite;
  private shadowArt?: Sprite;

  constructor(
    private readonly host: HTMLElement,
    private readonly bundle: BoardBundle,
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
    this.app.stage.addChild(this.artLayer, this.ballArtLayer, this.geometryLayer);
    this.perspectiveArt = new Sprite(await Assets.load(this.bundle.art.imageUrl));
    this.artLayer.addChild(this.perspectiveArt);
    if (this.bundle.projection.mode === 'perspective') {
      const rectified = await rectifyArt(this.bundle.art.imageUrl, this.bundle.projection);
      this.flatArt = new Sprite(Texture.from(rectified));
      this.artLayer.addChild(this.flatArt);
    }
    this.shadowArt = new Sprite(await Assets.load(this.bundle.art.shadowUrl));
    this.shadowArt.anchor.set(0.5);
    this.ballArt = new Sprite(await Assets.load(this.bundle.art.ballUrl));
    this.ballArt.anchor.set(0.5);
    this.ballArtLayer.addChild(this.shadowArt, this.ballArt);
    this.render();
  }

  destroy(): void {
    this.app.destroy();
  }

  render(): void {
    const view = this.state.view;
    const size = this.viewSize(view);
    this.app.renderer.resize(size.width, size.height);
    this.artLayer.visible = this.state.visibility.art;
    this.ballArtLayer.visible = this.state.visibility.art;
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

    for (const primitive of this.bundle.geometry) {
      this.geometryLayer.addChild(this.drawPrimitive(primitive, view));
    }

    const ball = this.state.snapshot.ball;
    const ballIsInsideProjection = this.ballIsInsideProjection(ball);
    const ballCenter = ballIsInsideProjection ? this.project(ball, view) : undefined;
    const visibleDiameter = ballIsInsideProjection ? this.visibleBallDiameter(ball, view) : undefined;
    if (this.shadowArt) {
      this.shadowArt.visible = this.state.visibility.art && ballCenter !== undefined && visibleDiameter !== undefined;
      if (ballCenter && visibleDiameter !== undefined) {
        const [offsetX, offsetY] = this.bundle.art.shadowOffsetInBallDiameters;
        this.shadowArt.position.set(
          ballCenter.x + offsetX * visibleDiameter,
          ballCenter.y + offsetY * visibleDiameter,
        );
        this.shadowArt.width = visibleDiameter * 1.5;
        this.shadowArt.height = visibleDiameter * 0.75;
      }
    }
    if (this.ballArt) {
      this.ballArt.visible = this.state.visibility.art && ballCenter !== undefined && visibleDiameter !== undefined;
      if (ballCenter && visibleDiameter !== undefined) {
        this.ballArt.position.set(ballCenter.x, ballCenter.y);
        this.ballArt.width = visibleDiameter;
        this.ballArt.height = visibleDiameter;
      }
    }
    if (ballIsInsideProjection) {
      const contour = this.drawSampledCircle(ball, ball.radius, view, BALL_COLOR, 4);
      contour.visible = this.state.visibility.geometry;
      this.geometryLayer.addChild(contour);
    }
  }

  private drawPrimitive(primitive: GeometryPrimitive, view: ViewId): Graphics {
    const graphics = new Graphics();
    if (primitive.kind === 'circle') {
      const color = primitive.role === 'goal' ? GOAL_COLOR : GEOMETRY_COLOR;
      return this.drawSampledCircle(primitive.center, primitive.radius, view, color, 3);
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
      color: primitive.role === 'boundary' ? BOUNDARY_COLOR : GEOMETRY_COLOR,
      width: 3,
      alpha: 0.95,
    });
  }

  private visibleBallDiameter(ball: Readonly<Point>, view: ViewId): number {
    if (view === 'flat') return this.state.snapshot.ball.radius * 2;
    const radius = this.state.snapshot.ball.radius;
    const top = this.project({ x: ball.x, y: ball.y - radius }, view);
    const bottom = this.project({ x: ball.x, y: ball.y + radius }, view);
    return Math.hypot(bottom.x - top.x, bottom.y - top.y);
  }

  private ballIsInsideProjection(ball: Readonly<Point>): boolean {
    const radius = this.state.snapshot.ball.radius;
    return ball.x - radius >= 0
      && ball.x + radius <= this.bundle.projection.flatSize.width
      && ball.y - radius >= 0
      && ball.y + radius <= this.bundle.projection.flatSize.height;
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

