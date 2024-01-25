import { SocketData } from './../../../shared/socket.types.d';
import { EventBus } from '../../../shared/EventBus';

class SocketService {
  private socket!: WebSocket;
  private isConnected = false;
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
      console.log('Socket connected');
    });

    this.socket.addEventListener('message', (ev) => {
      const { data } = ev;
      const { data: eventData, eventName }: SocketData = JSON.parse(data);
      this.eventBus.emit(eventName, eventData);
    });

    this.socket.addEventListener('close', () => {
      console.log('Client connection closed');
      this.isConnected = false;
    });
  }

  on(eventName: string, cb: (...args: any) => void) {
    this.eventBus.on(eventName, cb);
  }

  emit(eventName: string, data: SocketData['data']) {
    if (!this.isConnected) {
      return;
    }
    this.socket.send(JSON.stringify({ eventName, data }));
  }
}

export default new SocketService();
