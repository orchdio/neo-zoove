// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { EventEmitter } from "events";

class EventBus {
  private static instance: EventBus | null = null;
  public emitter: EventEmitter;
  public patternListeners: Map<
    string,
    {
      pattern: RegExp | string;
      handler: (...args: any[]) => void;
    }
  >;

  private constructor() {
    this.emitter = new EventEmitter();
    this.patternListeners = new Map();

    this.emitter.on("*", (eventName: string, ...data: any[]) => {
      this.patternListeners.forEach((listenerInfo, key) => {
        if (this.matchesPattern(listenerInfo.pattern, eventName)) {
          listenerInfo.handler(eventName, ...data);
        }
      });
    });
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.on(eventName, listener);
    return this;
  }

  off(eventName: string | symbol, listener: (...args: any[]) => void) {
    console.log("Manually removing event listener for event..", eventName);
    this.emitter.off(eventName, listener);
    return this;
  }

  once(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.once(eventName, listener);
    return this;
  }

  emit(eventName: string | symbol, ...args: any[]) {
    // emit the original event
    this.emitter.emit(eventName, ...args);

    if (eventName.toString()?.includes(":")) {
      // emit the wildcard event. this is where we check if the custom/wildcard event (playlist_metadata:<playlist_webhook_conversion_uuid>) is valid and then
      // trigger the listener for the event. if we dont emit this alongside the original event, we wont be able to actually
      // listen for the original event. when handling wildcard, we'll optionally call the listener for the original event, which would be undefined if both arent emitted
      // therefore our custom/wildcard event wont (properly) work
      this.emitter.emit("*", eventName, ...args);
    }
    return this;
  }

  onPattern(pattern: RegExp | string, listener: (...args: any[]) => void) {
    // create a unique key for this listener
    const key =
      typeof listener === "function"
        ? listener.toString()
        : Date.now().toString(); // perhaps another default would be ok? lgtm

    // store the pattern and the handler in the map structure.
    this.patternListeners.set(key, {
      pattern,
      handler: listener,
    });

    return this;
  }

  offPattern(pattern: RegExp | string, listener: (...args: any[]) => void) {
    // find and remove the pattern listener
    const key = typeof listener === "function" ? listener.toString() : "";
    if (key && this.patternListeners.has(key)) {
      this.patternListeners.delete(key);
    } else {
      // key not found, try to find by pattern
      this.patternListeners.forEach((info, k) => {
        const patternStr = pattern.toString();
        const infoPatternStr = info.pattern.toString();

        if (patternStr === infoPatternStr) {
          this.patternListeners.delete(k);
        }
      });
    }

    return this;
  }

  matchesPattern(pattern: RegExp | string, actual: string): boolean {
    if (!actual) return false;

    if (pattern instanceof RegExp) {
      return pattern.test(actual);
    }

    return pattern === actual;
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  removeAllListeners(event?: string) {
    this.emitter.removeAllListeners(event);

    // also clear pattern listeners if no specific event provided
    if (!event) {
      this.patternListeners.clear();
    }

    return this;
  }
}

// export default EventBus.getInstance();

// class EventBus {
//   private static instance: EventBus | null = null;
//   public emitter: EventEmitter; // Changed from emitters to emitter for better naming
//   public patternListeners: Map<string, (...args: any[]) => void>;
//
//   private constructor() {
//     this.emitter = new EventEmitter();
//     this.patternListeners = new Map();
//   }
//
//   public static getInstance(): EventBus {
//     if (!EventBus.instance) {
//       EventBus.instance = new EventBus();
//     }
//     return EventBus.instance;
//   }
//
//   on(eventName: string | symbol, listener: (...args: any[]) => void) {
//     console.log("-===============================≠=======≠≠≠≠=");
//     console.log("DEBUG: listening to event... ", eventName);
//     console.log("-===============================≠=======≠≠≠≠=");
//     this.emitter.on(eventName, listener);
//     return this;
//   }
//
//   off(eventName: string | symbol, listener: (...args: any[]) => void) {
//     console.log("Manually removing event listener for event..", eventName);
//     this.emitter.off(eventName, listener);
//     return this;
//   }
//
//   once(eventName: string | symbol, listener: (...args: any[]) => void) {
//     this.emitter.once(eventName, listener);
//     return this;
//   }
//
//   emit(eventName: string | symbol, ...args: any[]) {
//     // if the eventname contains something like :, then its most likely a wildcard type event
//     // and we want to handle some things around that.
//
//     if (eventName?.toString()?.includes(":")) {
//       console.log("INFO: wildcard based event... Emitting wildcard event....");
//       console.log(
//         "-----========================================================================\n\n",
//       );
//       console.log("WILDCARD ARGS ARE....");
//       console.log(...args);
//       console.log(
//         "-----========================================================================\n\n",
//       );
//       this.emitter.emit("*", ...args);
//       return this;
//     }
//     this.emitter.emit(eventName, ...args);
//     return this;
//   }
//
//   // support for pattern based stuff.
//
//   onPattern(pattern: RegExp | string, listener: (...args: any[]) => void) {
//     console.log("listeners are::: ", listener.toString());
//     console.log("calling onPattern... ");
//     const patternInfo = {
//       pattern,
//       listener,
//       handler: (args: any) => {
//         console.log("Handler running....");
//         console.log(args);
//
//         const actualName = `${args?.data?.event_type}:${args?.data?.task_id}`;
//         // console.log(
//         //   "-----------________________----------________________---------",
//         // );
//         // console.log("PASSED PATTERN AND ACTUAL ARE::", pattern, actualName);
//         // console.log(
//         //   "-----------________________----------________________---------",
//         // );
//         const isMatch = this.matchesPattern(pattern, actualName);
//         console.log("PATTERN MATCHES...", isMatch);
//         if (isMatch) {
//           console.log(
//             "INFO:: seems to match pattern... running onPattern emitter method...",
//           );
//           // console.log(listener.toString());
//           listener(actualName, args);
//         }
//       },
//     };
//     //
//     // console.log("--------------------------------------------------------");
//     // console.log(
//     //   "custom onPattern triggered now, emitting special wildcard event....",
//     // );
//     // console.log("--------------------------------------------------------");
//     this.emitter.on("*", patternInfo.handler);
//     return this;
//   }
//
//   offPattern(actualName: string, listener: (...args: any[]) => void) {
//     console.log("WILDCARE OFFF....");
//     // this.emitter.off("*", listener);
//     return this;
//   }
//
//   matchesPattern(pattern: RegExp | string, actual: string) {
//     if (pattern instanceof RegExp) {
//       console.log("pattern is a regex...");
//       console.log(pattern, actual);
//       console.log("matchesPattern.test(actual);");
//       return pattern.test(actual);
//     }
//
//     return pattern === actual;
//   }
//
//   listenerCount(event: string): number {
//     return this.emitter.listenerCount(event);
//   }
//
//   removeAllListeners(event?: string) {
//     console.log("Remove listeners...");
//     this.emitter.removeAllListeners(event);
//     return this;
//   }
// }

export default EventBus.getInstance();
