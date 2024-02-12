import { Socket } from './types';

export class SocketsByEvent {
  socketsEvents: Record<string, Socket[]> = {};

  register(eventName: string, socket: Socket) {
    this.socketsEvents[eventName] ||= [];
    this.socketsEvents[eventName]!.push(socket);

    return () => {
      this.socketsEvents[eventName] = this.socketsEvents[eventName]!.filter(
        (_socket) => _socket !== socket
      );
      socket.unsubscribers[eventName] = undefined;
    };
  }

  getSocketsForEvent(eventName: string) {
    return this.socketsEvents[eventName] || [];
  }
}
