/**
 * Runtime Metric Registry
 * Performance Metric Management Layer
 * Part 43.3 - Runtime Performance Manifest & Metric Registry Implementation
 */

// ============================================================
// METRIC REGISTRY STORE
// ============================================================

var _metrics = {};
var _metricIds = [];

// ============================================================
// METRIC STRUCTURE VALIDATION
// ============================================================

function validateMetric(metric) {
  var errors = [];
  
  if (!metric) {
    errors.push('Metric is null or undefined');
    return errors;
  }
  
  // Required: id
  if (!metric.id || typeof metric.id !== 'string' || metric.id.trim() === '') {
    errors.push('Missing or invalid id');
  }
  
  // Required: name
  if (!metric.name || typeof metric.name !== 'string' || metric.name.trim() === '') {
    errors.push('Missing or invalid name');
  }
  
  // Required: type
  var validTypes = ['timing', 'counter', 'gauge', 'histogram'];
  if (!metric.type || validTypes.indexOf(metric.type) === -1) {
    errors.push('Invalid type: "' + metric.type + '" (must be one of: ' + validTypes.join(', ') + ')');
  }
  
  // Required: unit
  if (!metric.unit || typeof metric.unit !== 'string' || metric.unit.trim() === '') {
    errors.push('Missing or invalid unit');
  }
  
  // Optional: description
  if (metric.description && typeof metric.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  // Optional: enabled
  if (metric.enabled !== undefined && typeof metric.enabled !== 'boolean') {
    errors.push('Enabled must be a boolean');
  }
  
  return errors;
}

// ============================================================
// DEFAULT METRICS
// ============================================================

var DEFAULT_METRICS = [
  {
    id: 'runtime.boot.duration',
    name: 'Boot Duration',
    type: 'timing',
    unit: 'ms',
    description: 'Runtime boot execution duration',
    enabled: true
  },
  {
    id: 'runtime.module.duration',
    name: 'Module Duration',
    type: 'timing',
    unit: 'ms',
    description: 'Module execution duration',
    enabled: true
  }
];

// ============================================================
// REGISTRY API
// ============================================================

export function register(metric) {
  var errors = validateMetric(metric);
  if (errors.length > 0) {
    console.warn('[Performance] Metric registration failed:', errors.join('; '));
    return { success: false, errors: errors };
  }
  
  // Check for duplicate
  if (_metrics[metric.id]) {
    console.warn('[Performance] Duplicate metric, registration rejected:', metric.id);
    return { success: false, errors: ['Duplicate metric: ' + metric.id] };
  }
  
  // Store metric
  _metrics[metric.id] = {
    id: metric.id,
    name: metric.name,
    type: metric.type,
    unit: metric.unit,
    description: metric.description || '',
    enabled: metric.enabled !== undefined ? metric.enabled : true,
    registeredAt: new Date().toISOString()
  };
  
  _metricIds.push(metric.id);
  
  if (isDebugMode()) {
    console.log('[Performance] Metric Registered:', metric.id);
  }
  
  return { success: true, metric: _metrics[metric.id] };
}

export function get(id) {
  return _metrics[id] || null;
}

export function getAll() {
  var result = [];
  for (var i = 0; i < _metricIds.length; i++) {
    result.push(_metrics[_metricIds[i]]);
  }
  return result;
}

export function getEnabled() {
  var result = [];
  for (var i = 0; i < _metricIds.length; i++) {
    var m = _metrics[_metricIds[i]];
    if (m.enabled) {
      result.push(m);
    }
  }
  return result;
}

export function remove(id) {
  if (!_metrics[id]) {
    console.warn('[Performance] Metric not found for removal:', id);
    return false;
  }
  
  delete _metrics[id];
  var index = _metricIds.indexOf(id);
  if (index !== -1) {
    _metricIds.splice(index, 1);
  }
  
  if (isDebugMode()) {
    console.log('[Performance] Metric Removed:', id);
  }
  
  return true;
}

export function validate(metric) {
  var errors = validateMetric(metric);
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

export function isRegistered(id) {
  return !!_metrics[id];
}

export function count() {
  return _metricIds.length;
}

export function clear() {
  _metrics = {};
  _metricIds = [];
  if (isDebugMode()) {
    console.log('[Performance] Metric Registry cleared');
  }
}

// ============================================================
// DEBUG HELPERS
// ============================================================

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initMetricRegistry() {
  // Register default metrics
  var registeredCount = 0;
  for (var i = 0; i < DEFAULT_METRICS.length; i++) {
    var result = register(DEFAULT_METRICS[i]);
    if (result.success) {
      registeredCount++;
    }
  }
  
  if (isDebugMode()) {
    console.log('[Performance] Default metrics registered:', registeredCount);
  }
  
  return {
    success: true,
    registered: registeredCount,
    total: DEFAULT_METRICS.length
  };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeMetricRegistry = {
    register: register,
    get: get,
    getAll: getAll,
    getEnabled: getEnabled,
    remove: remove,
    validate: validate,
    isRegistered: isRegistered,
    count: count,
    clear: clear,
    init: function() {
      var result = initMetricRegistry();
      console.log('✅ RuntimeMetricRegistry ready (' + result.registered + ' metrics registered)');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeMetricRegistry = window.runtimeMetricRegistry;
  }
}
