import { EntitiesFactory } from './EntitiesFactory';
import {
  GameSettings,
  IObjectCreationParams,
  Position,
  Size,
  TGameObjectsType,
} from './types';
import { getRandomInt } from './utils';

export class GenericObject {
  position: Position;
  size: Size;
  img: HTMLImageElement;
  static ctx: CanvasRenderingContext2D;
  static canvas: HTMLCanvasElement;
  constructor(position: Position, size: Size, image: HTMLImageElement) {
    this.position = position;
    this.size = size;
    this.img = image;
  }

  draw() {
    const {
      position: { x, y },
      size: { width, height },
      img,
    } = this;
    GenericObject.ctx.drawImage(img, x, y, width, height);
  }

  static getGameObjects({
    minX,
    maxX = 500,
    img,
    type,
  }: IObjectCreationParams) {
    const callbackPerType: {
      [type in TGameObjectsType]: () => GenericObject;
    } = {
      platform() {
        minX = getRandomInt(minX + GameSettings.MinXDiffBetweenPlatform, maxX);
        maxX += 500;
        return EntitiesFactory.createInstance(
          GenericObject,
          {
            x: minX,
            y: getRandomInt(320, GenericObject.canvas.height - 100),
          },
          {
            width: getRandomInt(150, 350),
            height: 20,
          },
          img
        );
      },
      floor() {
        const widthOfFloor =
          minX === 0
            ? GenericObject.canvas.width - 300
            : getRandomInt(450, 700);
        const platform = new GenericObject(
          {
            x: minX,
            y: GenericObject.canvas.height - 40,
          },
          {
            width: widthOfFloor,
            height: 40,
          },
          img
        );
        minX += widthOfFloor + getRandomInt(80, 200);
        return platform;
      },
    };
    return Array(5).fill('').map(callbackPerType[type]);
  }
}
