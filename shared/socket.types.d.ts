export type SocketEvent = RoomEvent | SubscribeEvent | EmitEvent;

export type RoomEvent = {
  type: 'room';
  roomId: string;
  action: 'join' | 'leave';
};

export type SubscribeEvent = {
  type: 'subscribe';
  eventName: string;
};

export type EmitEvent = {
  type: 'emit';
  eventName: string;
  data?: Record<string, any> | number | boolean | string | any[];
};
