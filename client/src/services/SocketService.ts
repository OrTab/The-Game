import {
  EmitEvent,
  RoomEvent,
  SocketEvent,
} from './../../../shared/socket.types.d';
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
    this.on(SOCKET_EVENTS.ACKNOWLEDGMENT, () => {
      this.gotAcknowledgment = true;
      clearTimeout(this.acknowledgmentTimeoutId);
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
      this.unsubscribers.forEach((unsubscriber) => unsubscriber());
      this.messageQueue = [];
      clearTimeout(this.acknowledgmentTimeoutId);
    });
  }

  private handleSocketNotLoaded(callback: () => void) {
    if (this.isSocketOpen) {
      callback();
    } else if (!this.wasConnected) {
      setTimeout(() => {
        this.handleSocketNotLoaded(callback);
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
    clearTimeout(this.acknowledgmentTimeoutId);
    this.acknowledgmentTimeoutId = setTimeout(
      this.sendNextMessage.bind(this),
      100
    );
  }

  private send(eventData: SocketEvent) {
    const framePayload = JSON.stringify({
      ...eventData,
      id: crypto.randomUUID(),
    });
    this.messageQueue.push(framePayload);
    this.sendNextMessage();
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
      this.send({
        type: 'emit',
        eventName,
        data,
      });
    };
    this.handleSocketNotLoaded(action);
  }
}

export default new SocketService();
