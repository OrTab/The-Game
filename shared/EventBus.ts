export class EventBus {
  events: Record<string, ((...args: any) => void)[]> = {};

  emit(eventName: string, data?: unknown) {
    this.events[eventName]?.forEach((fn) => fn(data));
  }

  on(eventName: string, subscriber: (...args: any) => void) {
    this.events[eventName] ||= [];
    this.events[eventName]!.push(subscriber);
    return () => {
      this.events[eventName] = this.events[eventName]!.filter(
        (fn) => fn !== subscriber
      );
    };
  }
}
