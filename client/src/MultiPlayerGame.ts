import { BaseGame } from './BaseGame';
import SocketService from './services/SocketService';
import { IPlayer } from './types';
import { SOCKET_EVENTS } from '../../shared/socketEvents';
import { INITIAL_PLAYER_PROPERTIES } from './constants';

export class MultiPlayerGame extends BaseGame {
  players: IPlayer[] = [];
  matchId: string;

  constructor({
    currentPlayersMatch,
    matchId,
  }: {
    matchId: string;
    currentPlayersMatch: IPlayer[];
  }) {
    const playerProperties = window.structuredClone<IPlayer>(
      INITIAL_PLAYER_PROPERTIES
    );
    super(playerProperties);
    this.players = currentPlayersMatch;
    this.matchId = matchId;
    SocketService.joinRoom(this.matchId);
    SocketService.on(
      SOCKET_EVENTS.UPDATE_PLAYER,
      this.updatePlayersState.bind(this)
    );
  }

  protected onMount(): void {
    console.log('Mount');
    this.animate();
  }

  protected handleSubclassLogic(): void {
    SocketService.emit(SOCKET_EVENTS.UPDATE_PLAYER, {
      matchId: this.matchId,
      player: this.player,
    });
    this.drawPlayers();
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

  protected handleGameOverLogic(): void {}
}
