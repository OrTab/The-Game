import { Position, Size } from 'types';

export class GenericObject {
  position: Position;
  size: Size;
  img: HTMLImageElement;
  ctx: CanvasRenderingContext2D;
  constructor(
    position: Position,
    size: Size,
    image: HTMLImageElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.position = position;
    this.size = size;
    this.img = image;
    this.ctx = ctx;
  }

  draw() {
    const {
      position: { x, y },
      size: { width, height },
      img,
    } = this;
    this.ctx.drawImage(img, x, y, width, height);
  }
}
