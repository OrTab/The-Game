export interface Position {
  x: number;
  y: number;
}

export type Size = {
  width: number;
  height: number;
};

export interface Velocity extends Position {}

type Pressed = { pressed: boolean };

export interface PressedKeys {
  right: Pressed;
  left: Pressed;
}

export const InitialPlayerProperties = {
  position: {
    x: 100,
    y: 100,
  },
  size: {
    width: 40,
    height: 40,
  },
  color: "#673ab2",
};

export interface PlayerProperties {
  position: Position;
  size: Size;
  color: string;
}
