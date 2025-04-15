import { EntitiesFactory } from './EntitiesFactory';
import { REFERENCE_HEIGHT, REFERENCE_WIDTH } from './constants';
import {
  GameSettings,
  IObjectCreationParams,
  Position,
  Size,
  TGameObjectsType,
} from './types';
import { fromPercentage, getRandomInt, toPercentage } from './utils';

export class GenericObject {
  position: Position;
  size: Size;
  img: HTMLImageElement;
  static ctx: CanvasRenderingContext2D;
  type: TGameObjectsType;
  static canvas: HTMLCanvasElement;
  constructor(
    position: Position,
    size: Size,
    image: HTMLImageElement,
    type: TGameObjectsType
  ) {
    this.position = position;
    this.size = size;
    this.img = image;
    this.type = type;
  }

  draw() {
    const {
      position: { x, y },
      size: { width, height },
      img,
      type,
    } = this;
    if (type === 'background') {
      GenericObject.ctx.drawImage(img, x, y, width, height);
      return;
    }
    GenericObject.ctx.drawImage(
      img,
      fromPercentage(x, GenericObject.canvas.width),
      fromPercentage(y, GenericObject.canvas.height),
      fromPercentage(width, GenericObject.canvas.width),
      fromPercentage(height, GenericObject.canvas.height)
    );
  }

  static getGameObjects({
    minX,
    maxX = 500,
    img,
    type,
  }: IObjectCreationParams) {
    const callbackPerType: {
      [type in Exclude<TGameObjectsType, 'background'>]: () => GenericObject;
    } = {
      platform() {
        minX = getRandomInt(minX + GameSettings.MinXDiffBetweenPlatform, maxX);
        maxX += 40;
        return EntitiesFactory.createInstance(
          GenericObject,
          {
            x: minX,
            y: getRandomInt(
              GenericObject.canvas.height / 2,
              GenericObject.canvas.height - 100
            ),
          },
          {
            width: getRandomInt(
              GenericObject.canvas.width / 4,
              GenericObject.canvas.width / 2
            ),
            height: 20,
          },
          img,
          type
        );
      },
      floor() {
        const widthOfFloor =
          minX === 0
            ? GenericObject.canvas.width - 300
            : getRandomInt(
                GenericObject.canvas.width / 5,
                GenericObject.canvas.width / 2
              );
        const platform = EntitiesFactory.createInstance(
          GenericObject,
          {
            x: minX,
            y: GenericObject.canvas.height - 40,
          },
          {
            width: widthOfFloor,
            height: 40,
          },
          img,
          type
        );
        minX += widthOfFloor + getRandomInt(80, 200);
        return platform;
      },
    };
    return Array(5).fill('').map(callbackPerType[type]);
  }
}
