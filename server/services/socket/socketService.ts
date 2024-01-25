import { EventBus } from './../../../shared/EventBus';
import { SocketData } from '../../../shared/socket.types';
import { Socket } from './types';
import {
  addMetaDatoSocket,
  extractDataFromFrame,
  getWebSocketFrame,
} from './utils';
import { Socket as OriginalSocket } from 'net';

class SocketService {
  private sockets: Socket[] = [];
  private eventBus: EventBus;
  constructor() {
    this.extendSocket();
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

    Object.defineProperty(OriginalSocket.prototype, 'eventBus', {
      get() {
        if (!this._eventBus) {
          this._eventBus = new EventBus();
        }
        return this._eventBus;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'emitEvent', {
      value(eventName: string, data) {
        this.send({ eventName, data });
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'sub', {
      value(eventName: string, cb: (...args) => void) {
        return this.eventBus.on(eventName, cb);
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'broadcast', {
      value(eventName: string, data) {
        const filteredClients = that.sockets.filter(
          (_socket) =>
            _socket !== this && !_socket.destroyed && _socket.writable
        );

        filteredClients.forEach((_socket) => {
          _socket.emitEvent(eventName, data);
        });
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
      const { data: _data, eventName }: SocketData = data || {};
      if (eventName) {
        socket.eventBus.emit(eventName, _data);
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
  }

  on(eventName: 'connection', cb: (socket: Socket) => void) {
    this.eventBus.on(eventName, cb);
  }
}

export default new SocketService();
