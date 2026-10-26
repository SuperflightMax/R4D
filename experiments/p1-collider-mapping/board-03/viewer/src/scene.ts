import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { rectifyArt } from './rectify-art';
import type { Board03Bundle, GeometryPrimitive, Point, ViewId } from './types';
import type { ViewerState } from './viewer-state';

const IMAGE_PATH = '/assets/03-sun-temple.jpg';
const GEOMETRY_COLOR = 0x4df2ff;
const BALL_COLOR = 0xff4f87;

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
    const center = this.project({ x: ball.x, y: ball.y }, view);
    const radius = this.bundle.projection.radiusToView(ball.radius, ball, view);
    const contour = new Graphics()
      .circle(center.x, center.y, radius)
      .stroke({ color: BALL_COLOR, width: 4, alpha: 1 });
    contour.visible = this.state.visibility.geometry;
    this.ballLayer.addChild(contour);
  }

  private drawPrimitive(primitive: GeometryPrimitive, view: ViewId): Graphics {
    const graphics = new Graphics();
    if (primitive.kind === 'circle') {
      const center = this.project(primitive.center, view);
      const radius = this.bundle.projection.radiusToView(
        primitive.radius,
        primitive.center,
        view,
      );
      return graphics.circle(center.x, center.y, radius).stroke({
        color: GEOMETRY_COLOR,
        width: 3,
        alpha: 0.95,
      });
    }
    const from = this.project(primitive.from, view);
    const to = this.project(primitive.to, view);
    return graphics.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke({
      color: GEOMETRY_COLOR,
      width: 3,
      alpha: 0.95,
    });
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

