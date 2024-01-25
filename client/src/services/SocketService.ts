import { SocketEvent } from './../../../shared/socket.types.d';
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
      const { data: eventData, eventName }: SocketEvent = JSON.parse(data);
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

  on(eventName: string, callback: (...args: any) => void) {
    const action = () => {
      this.eventBus.on(eventName, callback);
      this.socket.send(
        JSON.stringify(<SocketEvent>{ eventName, type: 'subscribe' })
      );
    };
    this.handleSocketNotLoaded(action);
  }

  emit(eventName: string, data: SocketEvent['data']) {
    const action = () => {
      this.socket.send(
        JSON.stringify(<SocketEvent>{ type: 'emit', eventName, data })
      );
    };
    this.handleSocketNotLoaded(action);
  }
}

export default new SocketService();
