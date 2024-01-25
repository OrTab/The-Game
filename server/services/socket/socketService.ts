import { EventBus } from './../../../shared/EventBus';
import { SocketEvent } from '../../../shared/socket.types';
import { Socket } from './types';
import {
  addMetaDatoSocket,
  extractDataFromFrame,
  getWebSocketFrame,
} from './utils';
import { Socket as OriginalSocket } from 'net';
import { SocketsByEvent } from './SocketByEevent';

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
        that.socketsByEvent.getSocketsForEvent(eventName).forEach((socket) => {
          if (this._broadcast && socket === this) {
            return;
          }
          socket.send({ eventName, data });
        });
        this._broadcast = false;
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'sub', {
      value(eventName: string, callback: (...args) => void) {
        const unsbscribe: () => void = this.eventBus.on(eventName, callback);
        this.unsubscribers.push(unsbscribe);
      },
    });

    Object.defineProperty(OriginalSocket.prototype, 'unsubscribeToAll', {
      value() {
        this.unsubscribers.forEach((fn) => fn());
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
          this._unsubscribers = [];
        }
        return this._unsubscribers;
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
      const { data: _data, eventName, type }: SocketEvent = data || {};
      if (type && eventName) {
        if (type === 'subscribe') {
          const unsbscribe = this.socketsByEvent.register(eventName, socket);
          socket.unsubscribers.push(unsbscribe);
        } else if (type === 'emit') {
          socket.eventBus.emit(eventName, _data);
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
