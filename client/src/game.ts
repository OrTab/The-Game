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
  const isMultiPlayerGame = confirm('MultiPlayer match?');
  if (isMultiPlayerGame) {
    initMultiPlayerGame();
    return;
  }

  new SinglePlayerGame();
};

const initGame = () => {
  if (isAllGameImagesLoaded()) {
    startGameFlow();
  } else {
    setTimeout(initGame, 200);
  }
};

initGame();
