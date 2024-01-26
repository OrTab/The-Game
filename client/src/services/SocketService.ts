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
  private unsubscribers: ReturnType<EventBus['on']>[] = [];

  constructor() {
    this.eventBus = new EventBus();
  }

  get isSocketOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
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
      this.unsubscribers.forEach((unsubscriber) => unsubscriber());
    });
  }

  private handleSocketNotLoaded(callback: () => void) {
    if (!this.isConnected) {
      if (!this.wasConnected) {
        setTimeout(callback, 100);
      }
    } else if (this.isSocketOpen) {
      callback();
    }
  }

  private send(eventData: SocketEvent) {
    const framePayload = JSON.stringify(eventData);
    this.socket.send(framePayload);
  }

  private getUnsubscriber(unsubscribe: () => void) {
    const unsubscriber = () => {
      unsubscribe();
      this.unsubscribers = this.unsubscribers.filter(
        (_unsubscribe) => _unsubscribe !== unsubscriber
      );
    };
    return unsubscriber;
  }

  on(eventName: string, callback: (...args: any) => void) {
    const action = () => {
      const unsubscribe = this.eventBus.on(eventName, callback);
      this.unsubscribers.push(this.getUnsubscriber(unsubscribe));
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

  terminate() {
    if (this.isSocketOpen) {
      this.socket.close(1000, 'Closing connection intentionally');
    }
  }

  emit(eventName: string, data: EmitEvent['data']) {
    const action = () => {
      this.send({ type: 'emit', eventName, data });
    };
    this.handleSocketNotLoaded(action);
  }
}

export default new SocketService();
