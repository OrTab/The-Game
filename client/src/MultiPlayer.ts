import { BaseGame } from './BaseGame';
import SocketService from 'services/SocketService';
import { IPlayer } from 'types';
import { SOCKET_EVENTS } from '../../shared/socketEvents';
import { INITIAL_PLAYER_PROPERTIES } from './constants';

export class MultiPlayerGame extends BaseGame {
  players: IPlayer[] = [];
  constructor() {
    const playerProperties = window.structuredClone<IPlayer>(
      INITIAL_PLAYER_PROPERTIES
    );
    super(playerProperties, () => {});
    SocketService.on(
      SOCKET_EVENTS.UPDATE_PLAYER,
      this.updatePlayersState.bind(this)
    );
  }

  updatePlayersState(player: IPlayer) {
    this.players = this.players.map((_player) =>
      _player._id === player._id ? player : _player
    );
  }

  drawPlayers() {
    this.players.forEach((player) => {
      this.drawPlayer(player);
    });
  }
}
