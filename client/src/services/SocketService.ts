class SocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  connect() {
    this.socket = new WebSocket('ws://127.0.0.1:4001/socket');
    this.socket.addEventListener('open', (ev) => {
      this.isConnected = true;
      console.log('Socket connected');
      this.socket!.send('Hey server');
    });

    this.socket.addEventListener('message', (ev) => {
      console.log('Received message', ev);
    });
  }
}

export default new SocketService();
