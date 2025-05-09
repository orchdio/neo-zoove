// biome-ignore lint/style/useNodejsImportProtocol: IDK, can't really deal with this, not worth it imo.
import { EventEmitter } from "events";
import type { WebhookEventBase } from "@/lib/blueprint";

/**
 * @description An EventBus that supports client-specific event subscriptions. It provides support for multiple clients and unique message dispatch to them
 * based on task IDs to ensure events are only sent to relevant clients.
 */
class EventBus {
  private static instance: EventBus | null = null;
  public emitter: EventEmitter;

  // map to track client subscriptions by taskId
  private clientSubscriptions: Map<
    string, // taskId
    Set<string> // set of clientIds subscribed to this task
  >;

  // map to track client connections for cleanup
  private activeClients: Map<
    string, // clientId
    Set<string> // set of taskIds this client is subscribed to
  >;

  private constructor() {
    this.emitter = new EventEmitter();
    this.clientSubscriptions = new Map();
    this.activeClients = new Map();
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * register a client's subscription to a specific task
   * @param clientId the unique identifier for the client
   * @param taskId the task ID the client is interested in
   */
  subscribeClientToTask(clientId: string, taskId: string): void {
    // task-to-clients mapping
    if (!this.clientSubscriptions.has(taskId)) {
      this.clientSubscriptions.set(taskId, new Set());
    }
    this.clientSubscriptions.get(taskId)?.add(clientId);

    // client-to-tasks mapping for cleanup
    if (!this.activeClients.has(clientId)) {
      this.activeClients.set(clientId, new Set());
    }
    this.activeClients.get(clientId)?.add(taskId);

    console.log("Subscribed client", clientId, "to task", taskId);
  }

  /**
   * unsubscribe a client from a specific task
   * @param clientId the unique identifier for the client
   * @param taskId the task ID to unsubscribe from (optional - if not provided, unsubscribes from all tasks)
   */
  unsubscribeClient(clientId: string, taskId?: string): void {
    if (taskId) {
      // remove from a specific task subscription
      const clients = this.clientSubscriptions.get(taskId);
      if (clients) {
        clients.delete(clientId);
        if (clients.size === 0) {
          this.clientSubscriptions.delete(taskId);
        }
      }

      // update client's task list
      const clientTasks = this.activeClients.get(clientId);
      if (clientTasks) {
        clientTasks.delete(taskId);
        if (clientTasks.size === 0) {
          this.activeClients.delete(clientId);
        }
      }
    } else {
      // unsubscribe from all tasks
      const clientTasks = this.activeClients.get(clientId);
      if (clientTasks) {
        clientTasks.forEach((tId) => {
          const clients = this.clientSubscriptions.get(tId);
          if (clients) {
            clients.delete(clientId);
            if (clients.size === 0) {
              this.clientSubscriptions.delete(tId);
            }
          }
        });
        this.activeClients.delete(clientId);
      }
    }
  }

  /**
   * check if a client is subscribed to a specific task
   */
  isClientSubscribedToTask(clientId: string, taskId: string): boolean {
    return !!this.clientSubscriptions.get(taskId)?.has(clientId);
  }

  /**
   * get all clients subscribed to a specific task
   */
  getClientsForTask(taskId: string): string[] {
    return Array.from(this.clientSubscriptions.get(taskId) || []);
  }

  /**
   * get all tasks a client is subscribed to
   */
  getTasksForClient(clientId: string): string[] {
    return Array.from(this.activeClients.get(clientId) || []);
  }

  /**
   * register an event listener
   */
  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.on(eventName, listener);
    return this;
  }

  /**
   * remove an event listener
   */
  off(eventName: string | symbol, listener: (...args: any[]) => void) {
    console.log("Removing event listener for event:", eventName);
    this.emitter.off(eventName, listener);
    return this;
  }

  /**
   * register a one-time event listener
   */
  once(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.once(eventName, listener);
    return this;
  }

  /**
   * emit an event to all connected listeners
   */
  emit(eventName: string | symbol, ...args: any[]) {
    // Emit the original event
    this.emitter.emit(eventName, ...args);

    // Handle pattern-based events
    if (typeof eventName === "string" && eventName.includes(":")) {
      this.emitter.emit("*", eventName, ...args);
    }
    return this;
  }

  /**
   * emit an event only to clients subscribed to the specified taskId
   * @param eventName The event name
   * @param taskId The task ID to target
   * @param args Additional event data
   */
  emitToTask(eventName: string, taskId: string, ...args: any[]) {
    // create a client-specific event with the task ID
    const taskEvent = `${eventName}:${taskId}`;
    // emit the task-specific event
    this.emitter.emit(taskEvent, taskId, ...args);
    // also emit the wildcard event for pattern matching
    this.emitter.emit("*", taskEvent, taskId, ...args);
    return this;
  }

  /**
   * extract taskId from webhook payload
   * this method assumes the payload has a taskId field, adjust as needed
   */
  extractTaskIdFromPayload(payload: WebhookEventBase): string | null {
    // You can adjust this based on your actual payload structure
    return payload?.task_id || null;
  }

  /**
   * process a webhook event, routing it only to relevant clients
   * @param eventName The base event name
   * @param payload The webhook payload containing the taskId
   */
  processWebhook(eventName: string, payload: WebhookEventBase) {
    const taskId = this.extractTaskIdFromPayload(payload);

    if (!taskId) {
      console.warn("Received webhook without valid taskId:", payload);
      return this;
    }

    // emit the event specifically for this task (with the corresponding uniqueID)
    return this.emitToTask(eventName, taskId, payload);
  }

  /**
   * listen for events specific to a client and task
   * @param eventName event name
   * @param clientId clientId
   * @param taskId taskId
   * @param listener the listener for the client+task event. this is what actually writes to the SSE client.
   */
  onClientTask(
    eventName: string,
    clientId: string,
    taskId: string,
    listener: (...args: any[]) => void,
  ) {
    this.subscribeClientToTask(clientId, taskId);

    // create a task pattern with event name and the id of the task that owns the event.
    const taskPattern = `${eventName}:${taskId}`;

    // register the listener for this specific task event
    this.on(taskPattern, (...args) => {
      // only call the listener if this client is still subscribed
      if (this.isClientSubscribedToTask(clientId, taskId)) {
        console.log(
          `Client ${clientId} is still subscribed to task ${taskId}. Calling the handler..`,
        );
        listener(...args);
      }
    });

    return this;
  }

  /**
   * get the count of listeners for an event
   */
  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  /**
   * remove all listeners for an event
   */
  removeAllListeners(event?: string) {
    this.emitter.removeAllListeners(event);
    return this;
  }
}

export default EventBus.getInstance();
