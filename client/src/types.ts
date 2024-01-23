declare global {
  interface Window {
    structuredClone: <T>(obj: T) => T;
  }

  interface EventTarget {
    addEventListenerBase: typeof EventTarget.prototype.addEventListener;
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

export type TGameObjectsType = 'floor' | 'platform';

export interface IObjectCreationParams {
  minX: number;
  maxX?: number;
  img: HTMLImageElement;
  type: TGameObjectsType;
}

export enum GameSettings {
  VelocityXDiff = 5,
  VelocityYDiff = 22,
  Gravity = 0.6,
  MinXDiffBetweenPlatform = 400,
  MinXDiffBetweenFloor = 250,
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
  InitialFloorMovementXDiff = 4,
  InitialPlatformMovementXDiff = 4,
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
  size: Size;
}
export interface IPlayerImage {
  run: TPlayerImage;
  stand: TPlayerImage;
}

export interface IPlayer {
  position: Position;
  size: Size;
  playerImage: IPlayerImage;
  _id: string;
}
