import { EventEmitter } from "node:events";

class Events {
  private static instance: Events | null = null;
  public emitter: EventEmitter; // Changed from emitters to emitter for better naming

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): Events {
    if (!Events.instance) {
      Events.instance = new Events();
    }
    return Events.instance;
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(eventName, listener);
    return this;
  }

  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    console.log("Event type %s off", eventName);
    this.emitter.off(eventName, listener);
    return this;
  }

  emit(eventName: string | symbol, data: any): this {
    console.log("Event type %s emit", eventName);
    const em = this.emitter.emit(eventName, data);
    console.log("Emitting event", em);
    return this;
  }
}

export default Events.getInstance();
