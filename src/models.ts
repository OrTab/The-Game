export enum Values {
  DISTANCE_TO_WIN = 1000000,
  X_DIFF = 4,
  Y_DIFF = 15,
  minXDiffBetweenPlatfrom = 400,
  maxJumpsWhileInAir = 5,
  numberOfFramesToMoveImage = 5,
  numOfImages = 3,
  numberOfPictureFrames = 11,
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Velocity {
  x: number;
  y: number;
}

type Pressed = { pressed: boolean };
export interface PressedKeys {
  right: Pressed;
  left: Pressed;
}
export interface PlayerProperties {
  position: Position;
  size: Size;
  color: string;
}

export const InitialPlayerProperties = {
  position: {
    x: 100,
    y: 100,
  },
  size: {
    width: 89,
    height: 103,
  },
  color: "#673ab2",
};
