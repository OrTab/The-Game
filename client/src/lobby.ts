import SocketService from './services/SocketService';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../shared/socketEvents';
import { IPlayer } from './types';
import { Modal, ModalArguments } from './components/Modal';
import { MultiPlayerGame } from './MultiPlayerGame';

export class Lobby {
  private modal: Modal | undefined;
  private lobbyPlayers: IPlayer[] = [];
  private player: IPlayer;
  constructor(player: IPlayer) {
    this.player = player;
    SocketService.connect();
    SocketService.joinRoom(SOCKET_ROOMS.LOBBY);

    SocketService.on(SOCKET_EVENTS.MATCH_START, this.onMatchStart.bind(this));
    SocketService.on(
      SOCKET_EVENTS.LOBBY_PLAYERS,
      this.onLobbyPlayers.bind(this)
    );
    SocketService.emit(SOCKET_EVENTS.JOIN_LOBBY, this.player);
  }

  private get lobbyPlayersForPreview() {
    return this.lobbyPlayers.filter((player) => player._id !== this.player._id);
  }

  private onMatchStart(matchData: {
    matchId: string;
    currentPlayersMatch: IPlayer[];
  }) {
    SocketService.leaveRoom(SOCKET_ROOMS.LOBBY);
    SocketService.unsubscribe(SOCKET_EVENTS.LOBBY_PLAYERS);
    SocketService.unsubscribe(SOCKET_EVENTS.MATCH_START);
    this.modal?.hide();

    new MultiPlayerGame(matchData);
  }

  private getLobbyPlayersForPreview(): ModalArguments['buttons'] {
    return this.lobbyPlayersForPreview.map(({ name }) => {
      return {
        onClick: () => {
          console.log(name);
        },
        content: name,
      };
    });
  }

  private onLobbyPlayers(lobbyPlayers: IPlayer[]) {
    this.lobbyPlayers = lobbyPlayers;
    if (!this.modal) {
      this.modal = new Modal({
        title: 'Lobby players',
        buttons: this.getLobbyPlayersForPreview(),
      });
    } else {
      this.modal.updateButtons(this.getLobbyPlayersForPreview());
    }
  }
}
