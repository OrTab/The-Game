import { EventBus } from './../../../shared/EventBus';
import { SocketEvent } from '../../../shared/socket.types';
import { Socket } from './types';
import {
  addMetaDatoSocket,
  extractDataFromFrame,
  getWebSocketFrame,
} from './utils';
import { Socket as OriginalSocket } from 'net';
import { SocketsByEvent } from './SocketByEvent';
import { SOCKET_EVENTS } from '../../../shared/socketEvents';

class SocketService {
  private sockets: Socket[] = [];
  private eventBus: EventBus;
  private socketsByEvent: SocketsByEvent;

  constructor() {
    this.extendSocket();
    this.socketsByEvent = new SocketsByEvent();
    this.eventBus = new EventBus();
  }

  addSocket(socket: Socket) {
    addMetaDatoSocket(socket);
    this.emitConnectionEvent(socket);
    this.subscribeToListeners(socket);
    this.sockets.push(socket);
  }

  emitConnectionEvent(socket: Socket) {
    this.eventBus.emit('connection', socket);
  }

  extendSocket() {
    const that = this;
    Object.defineProperty(OriginalSocket.prototype, 'send', {
      value(data: any) {
        const bufferFrame = getWebSocketFrame(data);
        return this.write(bufferFrame);
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'emitToMyself', {
      value(eventName: string, data: any) {
        this.send({ eventName, data });
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'eventBus', {
      get() {
        if (!this._eventBus) {
          this._eventBus = new EventBus();
        }
        return this._eventBus;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'emitEvent', {
      value(
        eventName: string,
        dataOrCallback: any | ((socket: Socket) => any)
      ) {
        that.socketsByEvent.getSocketsForEvent(eventName).forEach((socket) => {
          if (
            socket.closed ||
            socket.destroyed ||
            !socket.writable ||
            (this._broadcast && socket === this) ||
            (this.currentRoomId && !this.rooms[this.currentRoomId]) ||
            !socket.rooms[this.currentRoomId]
          ) {
            return;
          }
          const _data =
            typeof dataOrCallback === 'function'
              ? dataOrCallback(this)
              : dataOrCallback;
          socket.send({ eventName, data: _data });
        });
        this._broadcast = false;
        this.currentRoomId = undefined;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'to', {
      value(roomId: string) {
        this.currentRoomId = roomId;
        return this;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'sub', {
      value(eventName: string, callback: (...args: any[]) => void) {
        this.eventBus.on(eventName, callback);
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'unsubscribeToAll', {
      value() {
        Object.keys(this.unsubscribers).forEach((type) => {
          this.unsubscribers[type]?.();
        });
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'broadcast', {
      get() {
        this._broadcast = true;
        return this;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'unsubscribers', {
      get() {
        if (!this._unsubscribers) {
          this._unsubscribers = {};
        }
        return this._unsubscribers;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'rooms', {
      get() {
        if (!this._rooms) {
          this._rooms = {};
        }
        return this._rooms;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'joinRoom', {
      value(roomId: string) {
        this.rooms[roomId] = true;
        return () => {
          this.rooms[roomId] = undefined;
          this.unsubscribers[roomId] = undefined;
        };
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'leaveRoom', {
      value(roomId: string) {
        console.log('leaving room - ', roomId);

        this.unsubscribers[roomId]?.();
        this.unsubscribers[roomId] = undefined;
      },
    });
  }

  subscribeToListeners(socket: Socket) {
    socket.on('data', (frameBuffer) => {
      const [shouldCloseConnection, data] = extractDataFromFrame(frameBuffer);
      if (shouldCloseConnection) {
        socket.end();
        return;
      }
      const event: SocketEvent = data;
      if (!event) {
        return;
      }
      if (event.id) {
        socket.emitToMyself(SOCKET_EVENTS.ACKNOWLEDGMENT, event.id);
      }
      if (event.type === 'subscribe') {
        const unsubscribe = this.socketsByEvent.register(
          event.eventName,
          socket
        );
        socket.unsubscribers[event.eventName] = unsubscribe;
      } else if (event.type === 'unsubscribe') {
        socket.unsubscribers[event.eventName]?.();
      } else if (event.type === 'emit') {
        const { data, eventName } = event;
        socket.eventBus.emit(eventName, data);
      } else if (event.type === 'room') {
        const { action, roomId } = event;
        if (action === 'join') {
          if (socket.rooms[event.roomId]) {
            return;
          }
          console.log('Join room - ', roomId);
          const leaveRoom = socket.joinRoom(roomId);
          socket.unsubscribers[roomId] = leaveRoom;
        } else {
          socket.leaveRoom(roomId);
        }
      }
    });

    socket.on('end', () => {
      this.handleCloseConnection(socket);
    });
  }

  handleCloseConnection(socket: Socket) {
    console.log('WebSocket connection closed');
    this.sockets = this.sockets.filter((_socket) => _socket !== socket);
    socket.end();
    socket.destroy();
    socket.unsubscribeToAll();
  }

  on(eventName: 'connection', callback: (socket: Socket) => void) {
    this.eventBus.on(eventName, callback);
  }
}

export default new SocketService();
