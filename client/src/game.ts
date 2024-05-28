import './styles/style.css';
import { INITIAL_PLAYER_PROPERTIES, getInitialPlayerImage } from './constants';
import { Lobby } from './lobby';
import { SinglePlayerGame } from './SinglePlayerGame';
import { IPlayer } from './types';
import { isAllGameImagesLoaded } from './images.utils';

const initMultiPlayerGame = async () => {
  const playerProperties = window.structuredClone<IPlayer>(
    INITIAL_PLAYER_PROPERTIES
  );
  playerProperties.playerImage = getInitialPlayerImage();
  new Lobby(playerProperties);
};

export const startGameFlow = () => {
  const isMultiPlayerGame = false;
  if (isMultiPlayerGame) {
    initMultiPlayerGame();
    return;
  }

  const game = new SinglePlayerGame();
  game.start();
};

const initGame = () => {
  if (isAllGameImagesLoaded()) {
    startGameFlow();
  } else {
    setTimeout(initGame, 200);
  }
};

initGame();
