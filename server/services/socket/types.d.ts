import type { Socket as OriginalSocket } from 'net';
export interface Socket extends OriginalSocket {
  id: string;
  emitEvent: (eventName: string, data: any) => void;
  send: (data: any) => boolean;
  sub(eventName: string, cb: <T = any>(data: any) => void);
  broadcast(eventName: string, data: any);
}
