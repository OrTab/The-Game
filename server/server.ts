import { SOCKET_EVENTS, SOCKET_ROOMS } from './../shared/socketEvents';
const hostname = '127.0.0.1';
const port = 4001;
import { noDep } from '@or-tab/my-server';
import { Request } from '@or-tab/my-server/lib/dist/types/types';
import { handleWebSocketUpgrade } from './services/socket/utils';
import { Socket } from './services/socket/types';
import socketService from './services/socket/socketService';
import { randomUUID } from 'crypto';

const { app, server } = noDep();

let lobbyPlayers: Record<string, { player: any; socket: Socket }> = {};

const getLobbyPlayersData = () => {
  return Object.values(lobbyPlayers).reduce(
    (lobbyPlayersData: any[], playerData) => {
      lobbyPlayersData.push(playerData.player);
      return lobbyPlayersData;
    },
    []
  );
};
app.enableCorsForOrigins({
  'http://localhost:4000': ['*'],
  'http://127.0.0.1:4000': ['*'],
});

server.on('upgrade', (req: Request, socket: Socket) => {
  handleWebSocketUpgrade(req, socket);
});

socketService.on('connection', (socket) => {
  console.log('New socket');

  socket.sub(SOCKET_EVENTS.JOIN_LOBBY, (player) => {
    socket['playerId'] = player._id;
    lobbyPlayers[player._id] = {
      socket,
      player,
    };
    const lobbyPlayersData = getLobbyPlayersData();
    socket
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayersData);

    const lobbyPlayersIds = Object.keys(lobbyPlayers);

    if (lobbyPlayersIds.length >= 2) {
      setTimeout(() => {
        const matchId = randomUUID();
        const playersMatchIds = lobbyPlayersIds.slice(0, 3);
        playersMatchIds.forEach((playerId) => {
          const currentPlayersMatch = playersMatchIds
            .filter((_playerId) => _playerId !== playerId)
            .reduce((playersMatch: any[], playerId) => {
              playersMatch.push(lobbyPlayers[playerId].player);
              return playersMatch;
            }, []);

          const matchData = {
            matchId,
            currentPlayersMatch,
          };
          lobbyPlayers[playerId].socket.emitToMyself(
            SOCKET_EVENTS.MATCH_START,
            matchData
          );
        });
        playersMatchIds.forEach((playerId) => delete lobbyPlayers[playerId]);
      }, 1000);
    }
  });

  socket.sub(SOCKET_EVENTS.LEAVE_LOBBY, (player) => {
    delete lobbyPlayers[player._id];
    const lobbyPlayersData = getLobbyPlayersData();
    socket.broadcast
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayersData);
  });

  socket.sub(SOCKET_EVENTS.UPDATE_PLAYER, (data) => {
    socket.broadcast
      .to(data.matchId)
      .emitEvent(SOCKET_EVENTS.UPDATE_PLAYER, data.player);
  });

  socket.on('end', () => {
    if (!socket.rooms['lobby']) {
      return;
    }
    delete lobbyPlayers[socket['playerId']];
    const lobbyPlayersData = getLobbyPlayersData();
    socket.broadcast
      .to(SOCKET_ROOMS.LOBBY)
      .emitEvent(SOCKET_EVENTS.LOBBY_PLAYERS, lobbyPlayersData);
  });
});

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
