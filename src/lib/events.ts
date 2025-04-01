import { EventEmitter } from "node:events";

class EventBus {
  private static instance: EventBus | null = null;
  public emitter: EventEmitter; // Changed from emitters to emitter for better naming

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.on(eventName, listener);
  }

  off(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.off(eventName, listener);
  }

  once(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.once(eventName, listener);
  }

  emit(eventName: string | symbol, data: any) {
    this.emitter.emit(eventName, data);
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  removeAllListeners(event?: string) {
    this.emitter.removeAllListeners(event);
  }
}

export default EventBus.getInstance();
