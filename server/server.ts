import { SOCKET_EVENTS, SOCKET_ROOMS } from './../shared/socketEvents';
const hostname = '127.0.0.1';
const port = 4001;
import { noDep } from '@or-tab/my-server';
import { Request } from '@or-tab/my-server/lib/dist/types/types';
import { handleWebSocketUpgrade } from './services/socket/utils';
import { Socket } from './services/socket/types';
import socketService from './services/socket/socketService';

const { app, server } = noDep();

let lobbyPlayers: any[] = [];

app.enableCorsForOrigins({ 'http://localhost:4000': ['*'] });

server.on('upgrade', (req: Request, socket: Socket) => {
  handleWebSocketUpgrade(req, socket);
});

socketService.on('connection', (socket) => {
  console.log('New socket');

  socket.sub(SOCKET_EVENTS.JOIN_LOBBY, (player) => {
    socket['playerId'] = player._id;
    lobbyPlayers.push(player);
    // console.log(lobbyPlayers);

    socket
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayers);
  });

  socket.sub(SOCKET_EVENTS.LEAVE_LOBBY, (player) => {
    lobbyPlayers = lobbyPlayers.filter((_player) => _player._id !== player._id);
    socket.broadcast
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayers);
  });

  socket.sub('updatePlayer', (data) => {
    socket.broadcast
      .to(data.gameId)
      .emitEvent(SOCKET_EVENTS.UPDATE_PLAYER, data);
  });

  socket.on('end', () => {
    if (!socket.rooms['lobby']) {
      return;
    }
    lobbyPlayers = lobbyPlayers.filter(
      (_player) => _player._id !== socket['playerId']
    );

    socket.broadcast
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayers);
  });
});

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
