import {
  EmitEvent,
  RoomEvent,
  SocketEvent,
} from '../../../shared/socket.types';
import { EventBus } from '../../../shared/EventBus';
import { SOCKET_EVENTS } from '../../../shared/socketEvents';

class SocketService {
  private socket!: WebSocket;
  private isConnected = false;
  private messageQueue: string[] = [];
  private gotAcknowledgment = true;
  private eventBus: EventBus;
  private acknowledgmentTimeoutId: number = 0;
  private wasConnected = false;
  unsubscribers: Record<string, ReturnType<EventBus['on']>> = {};

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
    this.on(SOCKET_EVENTS.ACKNOWLEDGMENT, () => {
      this.gotAcknowledgment = true;
      if (this.messageQueue.length > 0) {
        this.sendNextMessage();
      }
    });
    this.socket.addEventListener('message', (ev) => {
      const { data } = ev;
      const { data: eventData, eventName }: EmitEvent = JSON.parse(data);
      this.eventBus.emit(eventName, eventData);
    });

    this.socket.addEventListener('close', () => {
      console.log('Client connection closed');
      this.isConnected = false;
      Object.values(this.unsubscribers).forEach((unsubscriber) =>
        unsubscriber()
      );
      this.messageQueue = [];
      clearTimeout(this.acknowledgmentTimeoutId);
    });
  }

  private send(callback: () => void) {
    if (this.isSocketOpen) {
      callback();
    } else if (!this.wasConnected) {
      setTimeout(() => {
        this.send(callback);
      }, 100);
    }
  }

  private sendNextMessage() {
    if (this.gotAcknowledgment && this.messageQueue.length > 0) {
      this.gotAcknowledgment = false;
      const framePayload = this.messageQueue.shift();
      if (framePayload) {
        this.socket.send(framePayload);
      }
    }
  }

  private _send(eventData: SocketEvent) {
    const framePayload = JSON.stringify({
      ...eventData,
      id: crypto.randomUUID(),
    });
    this.messageQueue.push(framePayload);
    this.sendNextMessage();
  }

  private getUnsubscriber(eventName: string, unsubscribe: () => void) {
    const unsubscriber = () => {
      unsubscribe();
      delete this.unsubscribers[eventName];
    };
    return unsubscriber;
  }

  on(eventName: string, callback: (...args: any) => void) {
    const action = this.createAction({
      eventData: { type: 'subscribe', eventName },
      callback: () => {
        const unsubscribe = this.eventBus.on(eventName, callback);
        this.unsubscribers[eventName] = this.getUnsubscriber(
          eventName,
          unsubscribe
        );
      },
    });

    this.send(action);
  }

  unsubscribe(eventName: string) {
    const action = this.createAction({
      eventData: { type: 'unsubscribe', eventName },
      callback: () => this.unsubscribers[eventName](),
    });
    this.send(action);
  }

  private createAction({
    eventData,
    callback,
  }: {
    eventData: SocketEvent;
    callback?: () => void;
  }) {
    return () => {
      this._send(eventData);
      callback?.();
    };
  }

  private handleSocketRoom(roomId: string, action: RoomEvent['action']) {
    const _action = this.createAction({
      eventData: { type: 'room', roomId, action },
    });
    this.send(_action);
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
    const action = this.createAction({
      eventData: {
        type: 'emit',
        eventName,
        data,
      },
    });
    this.send(action);
  }
}

export default new SocketService();
