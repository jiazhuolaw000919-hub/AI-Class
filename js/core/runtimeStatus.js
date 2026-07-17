/**
 * Runtime Status Manager
 * 
 * Tracks and manages runtime status states.
 */

class RuntimeStatus {
  constructor() {
    this.states = {
      IDLE: 'idle',
      INITIALIZING: 'initializing',
      BOOTING: 'booting',
      LOADING: 'loading',
      READY: 'ready',
      REFRESHING: 'refreshing',
      DESTROYED: 'destroyed',
      ERROR: 'error'
    };
    this._currentStatus = this.states.IDLE;
    this._history = [];
    this._maxHistory = 50;
  }

  /**
   * Get current status
   * @returns {string} Current status
   */
  getStatus() {
    return this._currentStatus;
  }

  /**
   * Set current status
   * @param {string} status - Status value
   * @param {Object} metadata - Additional info
   */
  setStatus(status, metadata = {}) {
    // Validate status
    if (!Object.values(this.states).includes(status)) {
      console.warn(`[RuntimeStatus] Unknown status: ${status}`);
      return;
    }
    const previous = this._currentStatus;
    this._currentStatus = status;
    // Record history
    this._history.push({
      status,
      previous,
      timestamp: Date.now(),
      ...metadata
    });
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }
    console.log(`[RuntimeStatus] Status changed: ${previous} -> ${status}`);
  }

  /**
   * Check if runtime is ready
   * @returns {boolean}
   */
  isReady() {
    return this._currentStatus === this.states.READY;
  }

  /**
   * Check if runtime is booting
   * @returns {boolean}
   */
  isBooting() {
    return this._currentStatus === this.states.BOOTING;
  }

  /**
   * Check if runtime is loading
   * @returns {boolean}
   */
  isLoading() {
    return this._currentStatus === this.states.LOADING;
  }

  /**
   * Check if runtime is destroyed
   * @returns {boolean}
   */
  isDestroyed() {
    return this._currentStatus === this.states.DESTROYED;
  }

  /**
   * Check if runtime is in error state
   * @returns {boolean}
   */
  isError() {
    return this._currentStatus === this.states.ERROR;
  }

  /**
   * Get status history
   * @param {number} limit - Number of entries to return
   * @returns {Array} History entries
   */
  getHistory(limit = 10) {
    const start = Math.max(0, this._history.length - limit);
    return this._history.slice(start);
  }

  /**
   * Reset status to idle
   */
  reset() {
    this._currentStatus = this.states.IDLE;
    this._history = [];
    console.log('[RuntimeStatus] Reset to idle.');
  }

  /**
   * Get all available states
   * @returns {Object} States map
   */
  getStates() {
    return { ...this.states };
  }
}

// Singleton instance
const runtimeStatus = new RuntimeStatus();
export default runtimeStatus;
