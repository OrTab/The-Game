import { IPlayer, IPlayerImage } from './types';

const playerImage = getInitialPlayerImage();
export const INITIAL_PLAYER_PROPERTIES: IPlayer = {
  position: {
    x: 100,
    y: 100,
  },
  size: playerImage.size,
  playerImage: playerImage,
  _id: crypto.randomUUID(),
  name: 'player' + crypto.randomUUID().slice(0, 5),
};

export function getInitialPlayerImage(): IPlayerImage {
  return {
    size: {
      width: 100.875,
      height: 100,
    },
    run: {
      image: 'runRight',
      currPlayerImageFrame: 0,
      currPlayerImageFramePosition: 0,
    },
    stand: {
      image: 'runRight',
      currPlayerImageFrame: 0,
      currPlayerImageFramePosition: 0,
    },
  };
}
