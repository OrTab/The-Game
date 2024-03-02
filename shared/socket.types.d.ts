export type SocketEvent = (
  | RoomEvent
  | SubscribeEvent
  | EmitEvent
  | UnSubscribeEvent
) & {
  id?: string;
};

export type RoomEvent = {
  type: 'room';
  roomId: string;
  action: 'join' | 'leave';
};

export type SubscribeEvent = {
  type: 'subscribe';
  eventName: string;
};

export type UnSubscribeEvent = {
  type: 'unsubscribe';
  eventName: string;
};

export type EmitEvent = {
  type: 'emit';
  eventName: string;
  data?: Record<string, any> | number | boolean | string | any[];
};
