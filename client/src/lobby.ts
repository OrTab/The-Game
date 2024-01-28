import SocketService from './services/SocketService';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../shared/socketEvents';
import { IPlayer } from 'types';

export class Lobby {
  constructor(playerProperties: IPlayer) {
    SocketService.connect();
    SocketService.joinRoom(SOCKET_ROOMS.LOBBY);
    SocketService.on(
      SOCKET_EVENTS.JOIN_LOBBY,
      this.onPlayerLobbyJoined.bind(this)
    );
    SocketService.on(
      SOCKET_EVENTS.LOBBY_PLAYERS,
      this.onLobbyPlayers.bind(this)
    );
    SocketService.emit(SOCKET_EVENTS.JOIN_LOBBY, playerProperties);
  }

  onPlayerLobbyJoined(player: IPlayer) {
    console.log('joined', player);
  }

  onLobbyPlayers(lobbyPlayers: IPlayer[]) {
    console.log('lobbyPlayers', lobbyPlayers);
  }
}
