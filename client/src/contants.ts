import { IPlayer, IPlayerImage } from './types';

export const INITIAL_PLAYER_PROPERTIES: IPlayer = {
  position: {
    x: 100,
    y: 100,
  },
  size: {
    width: 127.875,
    height: 128,
  },
  playerImage: getInitialPlayerImage(),
  _id: crypto.randomUUID(),
};

export function getInitialPlayerImage(): IPlayerImage {
  return {
    run: {
      image: 'runRight',
      currPlayerImageFrame: 0,
      currPlayerImageFramePosition: 0,
      size: {
        width: 127.875,
        height: 128,
      },
    },
    stand: {
      image: 'runRight',
      currPlayerImageFrame: 0,
      currPlayerImageFramePosition: 0,
      size: {
        width: 127,
        height: 128,
      },
    },
  };
}
