class SocketService {
  private socket: WebSocket | null = null;
  connect() {
    // this.socket = new WebSocket('ws:http://127.0.0.1:4000');
    // console.log(this.socket);
  }
}

export default new SocketService();
