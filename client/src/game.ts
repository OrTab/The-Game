import './styles/style.css';
import { INITIAL_PLAYER_PROPERTIES, getInitialPlayerImage } from './constants';
import { Lobby } from './lobby';
import { IPlayer } from 'types';
import { SinglePlayerGame } from './SinglePlayerGame';

const initMultiPlayerGame = async () => {
  const playerProperties = window.structuredClone<IPlayer>(
    INITIAL_PLAYER_PROPERTIES
  );
  playerProperties.playerImage = getInitialPlayerImage();
  const lobby = new Lobby(playerProperties);
};

export const initGame = () => {
  const isMultiPlayerGame = confirm('MultiPlayer match?');
  if (isMultiPlayerGame) {
    initMultiPlayerGame();
    return;
  }

  new SinglePlayerGame();
};
