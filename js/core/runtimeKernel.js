/**
 * Runtime Kernel
 * 
 * Centralized Runtime Controller for the entire application.
 * Coordinates boot, shutdown, restart, and health monitoring.
 * Does NOT execute business logic - only runtime coordination.
 */

import runtimeRegistry from './runtimeRegistry.js';
import runtimeStatus from './runtimeStatus.js';
import runtimeLifecycle from './runtimeLifecycle.js';
import eventBus from '../eventBus.js';

class RuntimeKernel {
  constructor() {
    this.name = 'RuntimeKernel';
    this.version = '1.0.0';
    this.bootTime = null;
    this.shutdownTime = null;
    this.initialized = false;
    this._shutdownFlag = false;
  }

  /**
   * Initialize the Runtime Kernel
   */
  initialize() {
    if (this.initialized) {
      console.warn('[RuntimeKernel] Already initialized.');
      return;
    }
    console.log('[RuntimeKernel] Initializing...');
    runtimeStatus.setStatus('initializing');
    this.initialized = true;
    console.log('[RuntimeKernel] Initialized.');
  }

  /**
   * Boot the runtime system
   * @param {Object} options - Boot options
   * @param {Function} callback - Optional callback after boot
   */
  boot(options = {}, callback = null) {
    if (this._shutdownFlag) {
      console.error('[RuntimeKernel] Cannot boot: system is shutdown.');
      return;
    }
    if (runtimeStatus.getStatus() === 'ready') {
      console.warn('[RuntimeKernel] Already booted.');
      if (callback) callback();
      return;
    }

    console.log('[RuntimeKernel] Booting...');
    this.bootTime = Date.now();
    runtimeStatus.setStatus('booting');

    // Emit lifecycle event
    runtimeLifecycle.emit('beforeBoot', { timestamp: this.bootTime, options });

    // Register core runtime modules
    this._registerCoreModules();

    // Set status to loading
    runtimeStatus.setStatus('loading');

    // Emit after boot event
    runtimeLifecycle.emit('afterBoot', { timestamp: Date.now() });

    // Set status to ready
    runtimeStatus.setStatus('ready');
    runtimeLifecycle.emit('afterReady', { timestamp: Date.now() });

    console.log(`[RuntimeKernel] Boot complete in ${Date.now() - this.bootTime}ms.`);
    if (callback) callback();
  }

  /**
   * Register core runtime modules
   */
  _registerCoreModules() {
    const coreModules = [
      'domainRegistry',
      'layerRegistry',
      'architectureValidator',
      'runtimeHealth',
      'systemComposer',
      'eventBus'
    ];
    for (const mod of coreModules) {
      if (!runtimeRegistry.isLoaded(mod)) {
        runtimeRegistry.register(mod, { core: true, autoLoad: true });
      }
    }
    console.log('[RuntimeKernel] Core modules registered.');
  }

  /**
   * Shutdown the runtime system
   * @param {Object} options - Shutdown options
   */
  shutdown(options = {}) {
    if (this._shutdownFlag) {
      console.warn('[RuntimeKernel] Already shutdown.');
      return;
    }
    console.log('[RuntimeKernel] Shutting down...');
    this.shutdownTime = Date.now();
    this._shutdownFlag = true;
    runtimeStatus.setStatus('destroyed');
    runtimeLifecycle.emit('beforeShutdown', { timestamp: this.shutdownTime });
    console.log(`[RuntimeKernel] Shutdown complete.`);
  }

  /**
   * Restart the runtime system
   */
  restart() {
    console.log('[RuntimeKernel] Restarting...');
    this.shutdown();
    // Reset shutdown flag for restart
    this._shutdownFlag = false;
    this.bootTime = null;
    this.shutdownTime = null;
    runtimeStatus.setStatus('booting');
    this.boot();
    console.log('[RuntimeKernel] Restart complete.');
  }

  /**
   * Get health status of the runtime
   * @returns {Object} Health report
   */
  health() {
    const elapsed = this.bootTime ? Date.now() - this.bootTime : 0;
    return {
      name: this.name,
      version: this.version,
      status: runtimeStatus.getStatus(),
      bootTime: this.bootTime,
      uptime: elapsed,
      initialized: this.initialized,
      shutdown: this._shutdownFlag,
      modules: runtimeRegistry.list().map(r => r.name)
    };
  }

  /**
   * Get current runtime status
   * @returns {string} Current status
   */
  status() {
    return runtimeStatus.getStatus();
  }

  /**
   * Check if runtime is ready
   * @returns {boolean}
   */
  isReady() {
    return runtimeStatus.isReady();
  }
}

// Singleton instance
const runtimeKernel = new RuntimeKernel();
export default runtimeKernel;
