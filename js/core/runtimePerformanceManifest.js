/**
 * Runtime Performance Manifest
 * Performance Framework Configuration Layer
 * Part 43.3 - Runtime Performance Manifest & Metric Registry Implementation
 */

// ============================================================
// PERFORMANCE MANIFEST DEFINITION
// ============================================================

const PERFORMANCE_MANIFEST = {
  name: 'Runtime Performance Framework',
  version: '1.0.0',
  status: 'active',
  enabled: true,
  
  // Configuration
  config: {
    historyLimit: 1000,
    debugMode: false,
    autoCollect: true
  },
  
  // Supported Metrics (IDs)
  supportedMetrics: [
    'runtime.boot.duration',
    'runtime.module.duration'
  ],
  
  // Registered Modules
  modules: [],
  
  // Framework Metadata
  metadata: {
    created: '2026-07-23',
    updated: '2026-07-23',
    part: '43.3'
  }
};

// ============================================================
// MANIFEST API
// ============================================================

export function getManifest() {
  return JSON.parse(JSON.stringify(PERFORMANCE_MANIFEST));
}

export function getManifestVersion() {
  return PERFORMANCE_MANIFEST.version;
}

export function isEnabled() {
  return PERFORMANCE_MANIFEST.enabled && PERFORMANCE_MANIFEST.status === 'active';
}

export function getSupportedMetrics() {
  return PERFORMANCE_MANIFEST.supportedMetrics.slice();
}

export function addSupportedMetric(metricId) {
  if (!metricId) return false;
  if (PERFORMANCE_MANIFEST.supportedMetrics.indexOf(metricId) !== -1) {
    console.warn('[Performance] Metric already supported:', metricId);
    return false;
  }
  PERFORMANCE_MANIFEST.supportedMetrics.push(metricId);
  return true;
}

export function removeSupportedMetric(metricId) {
  var index = PERFORMANCE_MANIFEST.supportedMetrics.indexOf(metricId);
  if (index === -1) return false;
  PERFORMANCE_MANIFEST.supportedMetrics.splice(index, 1);
  return true;
}

export function getConfig() {
  return JSON.parse(JSON.stringify(PERFORMANCE_MANIFEST.config));
}

export function isDebugMode() {
  return PERFORMANCE_MANIFEST.config.debugMode;
}

export function getHistoryLimit() {
  return PERFORMANCE_MANIFEST.config.historyLimit;
}

export function registerModule(moduleName) {
  if (!moduleName) return false;
  if (PERFORMANCE_MANIFEST.modules.indexOf(moduleName) !== -1) {
    return false;
  }
  PERFORMANCE_MANIFEST.modules.push(moduleName);
  return true;
}

export function getModules() {
  return PERFORMANCE_MANIFEST.modules.slice();
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initPerformanceManifest() {
  if (isDebugMode()) {
    console.log('[Performance] Manifest Loaded');
    console.log('[Performance] Version:', PERFORMANCE_MANIFEST.version);
    console.log('[Performance] Supported Metrics:', PERFORMANCE_MANIFEST.supportedMetrics.join(', '));
  }
  return PERFORMANCE_MANIFEST;
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceManifest = {
    getManifest: getManifest,
    getManifestVersion: getManifestVersion,
    isEnabled: isEnabled,
    getSupportedMetrics: getSupportedMetrics,
    addSupportedMetric: addSupportedMetric,
    removeSupportedMetric: removeSupportedMetric,
    getConfig: getConfig,
    isDebugMode: isDebugMode,
    getHistoryLimit: getHistoryLimit,
    registerModule: registerModule,
    getModules: getModules,
    init: function() {
      initPerformanceManifest();
      console.log('✅ RuntimePerformanceManifest ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceManifest = window.runtimePerformanceManifest;
  }
}
