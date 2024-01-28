import SocketService from './services/SocketService';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../shared/socketEvents';
import { IPlayer } from './types';
import { Modal, ModalArguments } from './components/Modal';

export class Lobby {
  private modal: Modal | undefined;
  private lobbyPlayers: IPlayer[] = [];
  private player: IPlayer;
  constructor(player: IPlayer) {
    this.player = player;
    SocketService.connect();
    SocketService.joinRoom(SOCKET_ROOMS.LOBBY);
    SocketService.on(
      SOCKET_EVENTS.LOBBY_PLAYERS,
      this.onLobbyPlayers.bind(this)
    );
    SocketService.emit(SOCKET_EVENTS.JOIN_LOBBY, this.player);
  }

  private get lobbyPlayersForPreview() {
    return this.lobbyPlayers.filter((player) => player._id !== this.player._id);
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
