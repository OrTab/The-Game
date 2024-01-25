import type { Socket as OriginalSocket } from 'net';
import type { EventBus } from '../../../shared/EventBus';
export interface Socket extends OriginalSocket {
  id: string;
  emitEvent: (eventName: string, data: any) => void;
  send: (data: any) => boolean;
  sub: (eventName: string, callback: <T = any>(data: any) => void) => void;
  broadcast: Socket;
  eventBus: EventBus;
  _broadcast: boolean;
  unsubscribers: Record<string, (() => void) | undefined>;
  unsubscribeToAll: () => void;
  to: (roomId: string) => Socket;
  joinRoom: (roomId: string) => () => void;
  leaveRoom: (roomId: string) => void;
  rooms: Record<string, boolean | undefined>;
}
