/**
 * Runtime Lifecycle
 * 
 * Provides lifecycle events for the runtime system.
 * Events are emitted through EventBus only.
 */

import eventBus from '../eventBus.js';

class RuntimeLifecycle {
  constructor() {
    this.events = {
      beforeBoot: 'RUNTIME_BEFORE_BOOT',
      afterBoot: 'RUNTIME_AFTER_BOOT',
      beforeCompose: 'RUNTIME_BEFORE_COMPOSE',
      afterCompose: 'RUNTIME_AFTER_COMPOSE',
      beforeReady: 'RUNTIME_BEFORE_READY',
      afterReady: 'RUNTIME_AFTER_READY',
      beforeShutdown: 'RUNTIME_BEFORE_SHUTDOWN',
      afterShutdown: 'RUNTIME_AFTER_SHUTDOWN',
      error: 'RUNTIME_ERROR'
    };
    this.initialized = false;
  }

  /**
   * Initialize lifecycle system
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[RuntimeLifecycle] Initialized.');
  }

  /**
   * Emit a lifecycle event
   * @param {string} eventName - Event name (without prefix)
   * @param {Object} data - Event data
   */
  emit(eventName, data = {}) {
    const fullEvent = this.events[eventName];
    if (!fullEvent) {
      console.warn(`[RuntimeLifecycle] Unknown event: ${eventName}`);
      return;
    }
    if (typeof eventBus !== 'undefined' && eventBus.publish) {
      eventBus.publish(fullEvent, {
        ...data,
        timestamp: Date.now()
      });
    } else {
      // Fallback if EventBus not yet initialized
      console.log(`[RuntimeLifecycle] ${fullEvent}`, data);
    }
  }

  /**
   * Subscribe to a lifecycle event
   * @param {string} eventName - Event name (without prefix)
   * @param {Function} handler - Event handler
   */
  on(eventName, handler) {
    const fullEvent = this.events[eventName];
    if (!fullEvent) {
      console.warn(`[RuntimeLifecycle] Unknown event: ${eventName}`);
      return;
    }
    if (typeof eventBus !== 'undefined' && eventBus.subscribe) {
      eventBus.subscribe(fullEvent, handler);
    } else {
      console.warn('[RuntimeLifecycle] EventBus not available for subscription.');
    }
  }

  /**
   * Get all lifecycle event names
   * @returns {Object} Events map
   */
  getEvents() {
    return { ...this.events };
  }
}

// Singleton instance
const runtimeLifecycle = new RuntimeLifecycle();
export default runtimeLifecycle;
