import type { Socket as OriginalSocket } from 'net';
import type { EventBus } from '../../../shared/EventBus';
export interface Socket extends OriginalSocket {
  id: string;
  emitEvent: (eventName: string, data: any) => void;
  send: (data: any) => boolean;
  sub: (
    eventName: string,
    cb: <T = any>(data: any) => void
  ) => ReturnType<EventBus['on']>;
  broadcast: (eventName: string, data: any) => void;
  eventBus: EventBus;
}
