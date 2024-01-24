import {
  addMetaDatoSocket,
  extractDataFromFrame,
  getWebSocketFrame,
} from './utils';
import type { Socket } from 'net';

class SocketService {
  private sockets: Socket[] = [];

  addSocket(socket: Socket) {
    addMetaDatoSocket(socket);
    this.subscribeToListeners(socket);
    this.sockets.push(socket);
  }

  subscribeToListeners(socket: Socket) {
    socket.on('data', (frameBuffer) => {
      const [shouldCloseConnection, data] = extractDataFromFrame(frameBuffer);
      if (shouldCloseConnection) {
        socket.end();
        return;
      }
      if (data) {
        this.broadcast(socket, data);
      }
    });

    socket.on('end', () => {
      this.handleCloseConnection(socket);
    });
  }

  handleCloseConnection(socket: Socket) {
    console.log('WebSocket connection closed');
    this.sockets = this.sockets.filter((_socket) => _socket !== socket);
    socket.end();
    socket.destroy();
  }

  broadcast(socket: Socket, data) {
    const bufferFrame = getWebSocketFrame(data);
    const filteredClients = this.sockets.filter(
      (_socket) => _socket !== socket && !_socket.destroyed && socket.writable
    );
    filteredClients.forEach((client) => {
      client.write(bufferFrame!);
    });
  }
}

export default new SocketService();
