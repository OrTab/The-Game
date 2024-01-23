import { EventBus } from './EventBus';

class SocketService {
  private socket!: WebSocket;
  private isConnected = false;
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }
  connect(updatePlayerPosition: (x: any) => void) {
    if (this.isConnected) {
      return;
    }
    this.socket = new WebSocket('ws://127.0.0.1:4001/socket');
    this.socket.addEventListener('open', () => {
      this.isConnected = true;
      console.log('Socket connected');
    });

    this.socket.addEventListener('message', (ev) => {
      const playerPosition = JSON.parse(ev.data);
      this.eventBus.emit('playerPosition', playerPosition);
    });

    this.socket.addEventListener('close', () => {
      console.log('Client connection closed');
      this.isConnected = false;
    });
    this.eventBus.on('playerPosition', updatePlayerPosition);
  }

  test(data: any) {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

export default new SocketService();
