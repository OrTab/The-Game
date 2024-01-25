import {
  EmitEvent,
  RoomEvent,
  SocketEvent,
} from './../../../shared/socket.types.d';
import { EventBus } from '../../../shared/EventBus';

class SocketService {
  private socket!: WebSocket;
  private isConnected = false;
  private wasConnected = false;
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }
  connect() {
    if (this.isConnected) {
      return;
    }
    this.socket = new WebSocket('ws://127.0.0.1:4001/socket');
    this.socket.addEventListener('open', () => {
      this.isConnected = true;
      this.wasConnected = true;
      console.log('Socket connected');
    });

    this.socket.addEventListener('message', (ev) => {
      const { data } = ev;
      const { data: eventData, eventName }: EmitEvent = JSON.parse(data);
      this.eventBus.emit(eventName, eventData);
    });

    this.socket.addEventListener('close', () => {
      console.log('Client connection closed');
      this.isConnected = false;
    });
  }

  private handleSocketNotLoaded(callback: () => void) {
    if (!this.isConnected && !this.wasConnected) {
      setTimeout(callback, 100);
    } else {
      callback();
    }
  }

  private send(eventData: SocketEvent) {
    const framePayload = JSON.stringify(eventData);
    this.socket.send(framePayload);
  }

  on(eventName: string, callback: (...args: any) => void) {
    const action = () => {
      this.eventBus.on(eventName, callback);
      this.send({ type: 'subscribe', eventName });
    };
    this.handleSocketNotLoaded(action);
  }

  private handleSocketRoom(roomId: string, action: RoomEvent['action']) {
    const _action = () => {
      this.send({ type: 'room', roomId, action });
    };
    this.handleSocketNotLoaded(_action);
  }

  joinRoom(roomId: string) {
    this.handleSocketRoom(roomId, 'join');
  }

  leaveRoom(roomId: string) {
    this.handleSocketRoom(roomId, 'leave');
  }

  emit(eventName: string, data: EmitEvent['data']) {
    const action = () => {
      this.send({ type: 'emit', eventName, data });
    };
    this.handleSocketNotLoaded(action);
  }
}

export default new SocketService();
