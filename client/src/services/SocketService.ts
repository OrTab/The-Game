class SocketService {
  private socket!: WebSocket;
  private isConnected = false;
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
      console.log('Data from server', ev.data);
    });

    this.socket.addEventListener('close', () => {
      console.log('Client connection closed');
      this.isConnected = false;
    });
  }

  test(data: any) {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

export default new SocketService();
