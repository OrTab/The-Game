import './styles/style.css';
import { INITIAL_PLAYER_PROPERTIES, getInitialPlayerImage } from './constants';
import { Lobby } from './lobby';
import { SinglePlayerGame } from './SinglePlayerGame';
import { IPlayer } from './types';

const initMultiPlayerGame = async () => {
  const playerProperties = window.structuredClone<IPlayer>(
    INITIAL_PLAYER_PROPERTIES
  );
  playerProperties.playerImage = getInitialPlayerImage();
  new Lobby(playerProperties);
};

export const initGame = () => {
  const isMultiPlayerGame = confirm('MultiPlayer match?');
  if (isMultiPlayerGame) {
    initMultiPlayerGame();
    return;
  }

  new SinglePlayerGame();
};
