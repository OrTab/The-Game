declare global {
  interface Window {
    structuredClone: <T>(obj: T) => T;
  }

  interface EventTarget {
    addEventListenerBase: typeof EventTarget.prototype.addEventListener;
    removeEventListenerBase: typeof EventTarget.prototype.removeEventListener;
    removeEventListeners: ({
      type,
      shouldRemoveAll,
    }: {
      type?: keyof WindowEventMap | null;
      shouldRemoveAll?: boolean;
    }) => void;
  }
}

export type TListenersPerEvent = { [key: string]: EventListener[] };

export type TGameObjectsType = 'floor' | 'platform' | 'background';

export interface IObjectCreationParams {
  minX: number;
  maxX?: number;
  img: HTMLImageElement;
  type: Exclude<TGameObjectsType, 'background'>;
}

export enum GameSettings {
  VelocityXDiff = 0.2,
  VelocityYDiff = 1,
  Gravity = 0.6,
  MinXDiffBetweenPlatform = 30,
  MinXDiffBetweenFloor = 15,
  MaxJumpsWhileInAir = 2,
  NumberOfFramesToMovePlayerImage = 0,
  NumberOfFramesToIncreaseDistance = 4,
  NumberOfTotalImagesInGame = 6,
  NumberOfFramesInPlayerRunImage = 30,
  NumberOfFramesInPlayerStandImage = 60,
  RangeToIncreaseSpeed = 30,
  PlayerRunImageFrameWidth = 341,
  PlayerStandImageFrameWidth = 177,
  PlayerRunImageFrameHeight = 400,
  PlayerStandImageFrameHeight = 400,
  InitialFloorMovementXDiff = 0,
  InitialPlatformMovementXDiff = 0,
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}

type Pressed = { isPressed: boolean };

export interface PressedKeys {
  right: Pressed;
  left: Pressed;
}

export type TLastPressedKeys = 'right' | 'left';

type PlayerImageType = 'runRight' | 'runLeft' | 'standLeft' | 'standRight';
interface TPlayerImage {
  image: PlayerImageType;
  currPlayerImageFrame: number;
  currPlayerImageFramePosition: number;
}
export interface IPlayerImage {
  size: Size;
  run: TPlayerImage;
  stand: TPlayerImage;
}

export interface IPlayer {
  position: Position;
  size: Size;
  playerImage: IPlayerImage;
  _id: string;
  name: string;
}
