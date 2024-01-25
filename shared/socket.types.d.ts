export type SocketEvent = {
  eventName: string;
  type: 'subscribe' | 'emit';
  data?: Record<string, any> | number | boolean | string | any[];
};
