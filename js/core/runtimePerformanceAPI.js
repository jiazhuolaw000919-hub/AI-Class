/**
 * Runtime Performance API
 * Unified Performance Access Interface
 * Part 43.9 - Runtime Performance API Layer Implementation
 */

// ============================================================
// INTERNAL HELPERS
// ============================================================

function getCollector() {
  return LawAIApp.RuntimePerformanceCollector || window.runtimePerformanceCollector;
}

function getStore() {
  return LawAIApp.RuntimePerformanceStore || window.runtimePerformanceStore;
}

function getAnalyzer() {
  return LawAIApp.RuntimePerformanceAnalyzer || window.runtimePerformanceAnalyzer;
}

function getHealth() {
  return LawAIApp.RuntimePerformanceHealth || window.runtimePerformanceHealth;
}

function getReport() {
  return LawAIApp.RuntimePerformanceReport || window.runtimePerformanceReport;
}

function getManifest() {
  return LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
}

function isEnabled() {
  try {
    var manifest = getManifest();
    if (manifest && typeof manifest.isEnabled === 'function') {
      return manifest.isEnabled();
    }
  } catch (e) { /* ignore */ }
  return true;
}

function isDebugMode() {
  try {
    var manifest = getManifest();
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Performance API] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

// ============================================================
// CORE API - Tracking
// ============================================================

/**
 * Auto-track execution time of a callback
 * @param {string} metricId - Metric ID from registry
 * @param {string} target - Target name (e.g., module name)
 * @param {Function} callback - Function to execute and track
 * @param {Object} metadata - Optional metadata
 * @returns {*} Result of callback
 */
export function track(metricId, target, callback, metadata) {
  if (!isEnabled()) {
    return typeof callback === 'function' ? callback() : callback;
  }

  if (!metricId) {
    if (isDebugMode()) {
      console.warn('[Performance API] track() called without metricId');
    }
    return typeof callback === 'function' ? callback() : callback;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return typeof callback === 'function' ? callback() : callback;
  }

  if (isDebugMode()) {
    console.log('[Performance API] Tracking Started:', target || metricId);
  }

  // Start tracking
  var recordId = safeCall(function() {
    return collector.start(metricId, target, metadata);
  });

  var result = typeof callback === 'function' ? callback() : callback;

  // End tracking
  safeCall(function() {
    if (recordId) {
      collector.end(recordId);
    }
  });

  if (isDebugMode()) {
    var record = safeCall(function() { return collector.getRecord(recordId); });
    if (record) {
      console.log('[Performance API] Tracking Completed:', target || metricId, record.duration + 'ms');
    }
  }

  return result;
}

/**
 * Start manual tracking
 * @param {string} metricId - Metric ID from registry
 * @param {string} target - Target name
 * @param {Object} metadata - Optional metadata
 * @returns {string|null} Record ID
 */
export function start(metricId, target, metadata) {
  if (!isEnabled()) {
    return null;
  }

  if (!metricId) {
    if (isDebugMode()) {
      console.warn('[Performance API] start() called without metricId');
    }
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  if (isDebugMode()) {
    console.log('[Performance API] Manual Start:', target || metricId);
  }

  return safeCall(function() {
    return collector.start(metricId, target, metadata);
  });
}

/**
 * End manual tracking
 * @param {string} recordId - Record ID from start()
 * @param {Object} metadata - Optional metadata
 * @returns {Object|null} Completed record
 */
export function end(recordId, metadata) {
  if (!isEnabled()) {
    return null;
  }

  if (!recordId) {
    if (isDebugMode()) {
      console.warn('[Performance API] end() called without recordId');
    }
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  var record = safeCall(function() {
    return collector.end(recordId, metadata);
  });

  if (isDebugMode() && record) {
    console.log('[Performance API] Manual End:', record.target || record.metricId, record.duration + 'ms');
  }

  return record;
}

// ============================================================
// CORE API - Boot Tracking
// ============================================================

/**
 * Start boot performance tracking
 * @param {Object} metadata - Optional metadata
 * @returns {string|null} Record ID
 */
export function startBoot(metadata) {
  if (!isEnabled()) {
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  if (isDebugMode()) {
    console.log('[Performance API] Boot Started');
  }

  return safeCall(function() {
    return collector.startBoot(metadata);
  });
}

/**
 * Finish boot performance tracking
 * @param {Object} metadata - Optional metadata
 * @returns {Object|null} Completed record
 */
export function finishBoot(metadata) {
  if (!isEnabled()) {
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  var record = safeCall(function() {
    return collector.finishBoot(metadata);
  });

  if (isDebugMode() && record) {
    console.log('[Performance API] Boot Finished:', record.duration + 'ms');
  }

  return record;
}

// ============================================================
// CORE API - Module Tracking
// ============================================================

/**
 * Start module performance tracking
 * @param {string} moduleName - Name of module
 * @param {Object} metadata - Optional metadata
 * @returns {string|null} Record ID
 */
export function startModule(moduleName, metadata) {
  if (!isEnabled()) {
    return null;
  }

  if (!moduleName) {
    if (isDebugMode()) {
      console.warn('[Performance API] startModule() called without moduleName');
    }
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  if (isDebugMode()) {
    console.log('[Performance API] Module Start:', moduleName);
  }

  return safeCall(function() {
    return collector.startModule(moduleName, metadata);
  });
}

/**
 * Finish module performance tracking
 * @param {string} moduleName - Name of module
 * @param {Object} metadata - Optional metadata
 * @returns {Object|null} Completed record
 */
export function finishModule(moduleName, metadata) {
  if (!isEnabled()) {
    return null;
  }

  if (!moduleName) {
    if (isDebugMode()) {
      console.warn('[Performance API] finishModule() called without moduleName');
    }
    return null;
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return null;
  }

  var record = safeCall(function() {
    return collector.finishModule(moduleName, metadata);
  });

  if (isDebugMode() && record) {
    console.log('[Performance API] Module Finish:', moduleName, record.duration + 'ms');
  }

  return record;
}

// ============================================================
// CORE API - Query
// ============================================================

/**
 * Get performance data for a target
 * @param {string} target - Target name
 * @returns {Array} Performance records
 */
export function measure(target) {
  if (!isEnabled()) {
    return [];
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return [];
  }

  return safeCall(function() {
    return collector.getRecordsByTarget(target);
  }) || [];
}

/**
 * Get all performance records
 * @returns {Array} All performance records
 */
export function getRecords() {
  if (!isEnabled()) {
    return [];
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return [];
  }

  return safeCall(function() {
    return collector.getRecords();
  }) || [];
}

/**
 * Get active performance records
 * @returns {Array} Active records
 */
export function getActive() {
  if (!isEnabled()) {
    return [];
  }

  var collector = getCollector();
  if (!collector) {
    if (isDebugMode()) {
      console.warn('[Performance API] Collector not available');
    }
    return [];
  }

  return safeCall(function() {
    return collector.getActiveRecords();
  }) || [];
}

// ============================================================
// CORE API - Report & Health
// ============================================================

/**
 * Get latest performance report
 * @returns {Object} Performance report
 */
export function report() {
  var reportModule = getReport();
  if (!reportModule) {
    if (isDebugMode()) {
      console.warn('[Performance API] Report not available');
    }
    return null;
  }

  return safeCall(function() {
    if (typeof reportModule.getLatest === 'function') {
      return reportModule.getLatest();
    }
    if (typeof reportModule.generate === 'function') {
      return reportModule.generate();
    }
    return null;
  });
}

/**
 * Get performance health
 * @returns {Object} Performance health
 */
export function health() {
  var healthModule = getHealth();
  if (!healthModule) {
    if (isDebugMode()) {
      console.warn('[Performance API] Health not available');
    }
    return null;
  }

  return safeCall(function() {
    if (typeof healthModule.getHealthReport === 'function') {
      return healthModule.getHealthReport();
    }
    if (typeof healthModule.evaluate === 'function') {
      return healthModule.evaluate();
    }
    return null;
  });
}

/**
 * Get performance score
 * @returns {number} Performance score (0-100)
 */
export function score() {
  var healthModule = getHealth();
  if (!healthModule) {
    return 0;
  }

  return safeCall(function() {
    if (typeof healthModule.getScore === 'function') {
      return healthModule.getScore();
    }
    return 0;
  }) || 0;
}

/**
 * Get performance status
 * @returns {string} Status (EXCELLENT, GOOD, WARNING, CRITICAL)
 */
export function status() {
  var healthModule = getHealth();
  if (!healthModule) {
    return 'UNKNOWN';
  }

  var result = safeCall(function() {
    if (typeof healthModule.getStatus === 'function') {
      return healthModule.getStatus();
    }
    return null;
  });

  return result ? result.status || 'UNKNOWN' : 'UNKNOWN';
}

// ============================================================
// CORE API - Utility
// ============================================================

/**
 * Check if performance system is enabled
 * @returns {boolean}
 */
export function enabled() {
  return isEnabled();
}

/**
 * Reset performance system
 */
export function reset() {
  if (!isEnabled()) {
    return;
  }

  var collector = getCollector();
  var analyzer = getAnalyzer();
  var healthModule = getHealth();
  var reportModule = getReport();

  if (collector && typeof collector.clear === 'function') {
    safeCall(function() { collector.clear(); });
  }
  if (analyzer && typeof analyzer.reset === 'function') {
    safeCall(function() { analyzer.reset(); });
  }
  if (healthModule && typeof healthModule.reset === 'function') {
    safeCall(function() { healthModule.reset(); });
  }
  if (reportModule && typeof reportModule.reset === 'function') {
    safeCall(function() { reportModule.reset(); });
  }

  if (isDebugMode()) {
    console.log('[Performance API] Reset complete');
  }
}

// ============================================================
// CONVENIENCE API
// ============================================================

/**
 * Track a module's execution time
 * @param {string} moduleName - Name of module
 * @param {Function} callback - Function to execute
 * @param {Object} metadata - Optional metadata
 * @returns {*} Result of callback
 */
export function trackModule(moduleName, callback, metadata) {
  return track('runtime.module.duration', moduleName, callback, metadata);
}

/**
 * Track a module with start/end pattern
 * @param {string} moduleName - Name of module
 * @param {Object} metadata - Optional metadata
 * @returns {Object} { start, end, recordId }
 */
export function createModuleTracker(moduleName, metadata) {
  var recordId = null;

  return {
    start: function() {
      recordId = startModule(moduleName, metadata);
      return this;
    },
    end: function() {
      if (recordId) {
        return end(recordId, metadata);
      }
      return null;
    },
    recordId: function() {
      return recordId;
    }
  };
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initAPI() {
  if (isDebugMode()) {
    console.log('[Performance API] Initialized');
  }
  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT - LawAIApp.Performance
// ============================================================

if (typeof window !== 'undefined') {
  // Mount to window.LawAIApp
  if (typeof LawAIApp === 'undefined') {
    window.LawAIApp = {};
  }

  LawAIApp.Performance = {
    track: track,
    trackModule: trackModule,
    start: start,
    end: end,
    startBoot: startBoot,
    finishBoot: finishBoot,
    startModule: startModule,
    finishModule: finishModule,
    measure: measure,
    getRecords: getRecords,
    getActive: getActive,
    report: report,
    health: health,
    score: score,
    status: status,
    enabled: enabled,
    reset: reset,
    createModuleTracker: createModuleTracker,
    init: function() {
      var result = initAPI();
      console.log('✅ Performance API ready (LawAIApp.Performance)');
      return this;
    }
  };

  // Also mount to window for backward compatibility
  window.runtimePerformanceAPI = LawAIApp.Performance;

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceAPI = window.runtimePerformanceAPI;
  }
}
