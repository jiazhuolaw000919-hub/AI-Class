/**
 * Runtime Performance Collector
 * Performance Data Collection Engine
 * Part 43.4 - Runtime Performance Collector Implementation
 */

// ============================================================
// COLLECTOR STORE
// ============================================================

var _records = {};
var _recordIds = [];
var _activeRecords = {};
var _historyLimit = 1000;
var _bootRecordId = null;
var _isInitialized = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  var random = Math.random().toString(36).substring(2, 8);
  return 'perf_' + timestamp + '_' + random;
}

function getMetricRegistry() {
  return LawAIApp.RuntimeMetricRegistry || window.runtimeMetricRegistry;
}

function getManifest() {
  return LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
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

function getHistoryLimit() {
  try {
    var manifest = getManifest();
    if (manifest && typeof manifest.getHistoryLimit === 'function') {
      return manifest.getHistoryLimit();
    }
  } catch (e) { /* ignore */ }
  return 1000;
}

function validateMetricId(metricId) {
  try {
    var registry = getMetricRegistry();
    if (registry && typeof registry.isRegistered === 'function') {
      return registry.isRegistered(metricId);
    }
  } catch (e) { /* ignore */ }
  return false;
}

// ============================================================
// RECORD CREATION
// ============================================================

function createRecord(metricId, target, startTime, metadata) {
  var record = {
    id: generateId(),
    metricId: metricId,
    target: target || 'unknown',
    startTime: startTime || new Date().toISOString(),
    endTime: null,
    duration: null,
    timestamp: new Date().toISOString(),
    status: 'started',
    metadata: metadata || {}
  };
  
  return record;
}

function completeRecord(record, endTime) {
  if (!record) return null;
  
  record.endTime = endTime || new Date().toISOString();
  
  var start = new Date(record.startTime);
  var end = new Date(record.endTime);
  record.duration = end - start;
  
  if (record.duration < 0) {
    record.duration = 0;
    record.status = 'invalid';
    if (isDebugMode()) {
      console.warn('[Performance] Invalid duration detected:', record.id);
    }
  } else {
    record.status = 'completed';
  }
  
  record.timestamp = new Date().toISOString();
  
  return record;
}

// ============================================================
// CORE API
// ============================================================

export function start(metricId, target, metadata) {
  if (!metricId) {
    console.warn('[Performance] start() called without metricId');
    return null;
  }
  
  // Validate metric exists
  if (!validateMetricId(metricId)) {
    if (isDebugMode()) {
      console.warn('[Performance] Unknown metric:', metricId);
    }
    return null;
  }
  
  // Check for duplicate active start
  var activeKey = metricId + '_' + target;
  if (_activeRecords[activeKey]) {
    if (isDebugMode()) {
      console.warn('[Performance] Duplicate start for:', metricId, target);
    }
    return _activeRecords[activeKey].id;
  }
  
  var record = createRecord(metricId, target, null, metadata);
  
  _records[record.id] = record;
  _recordIds.push(record.id);
  _activeRecords[activeKey] = record;
  
  if (isDebugMode()) {
    console.log('[Performance] Started:', target || metricId);
  }
  
  // Trim history
  trimHistory();
  
  return record.id;
}

export function end(recordId, metadata) {
  if (!recordId) {
    console.warn('[Performance] end() called without recordId');
    return null;
  }
  
  var record = _records[recordId];
  if (!record) {
    if (isDebugMode()) {
      console.warn('[Performance] Record not found:', recordId);
    }
    return null;
  }
  
  if (record.status === 'completed' || record.status === 'invalid') {
    if (isDebugMode()) {
      console.warn('[Performance] Record already completed:', recordId);
    }
    return record;
  }
  
  // Remove from active records
  var activeKey = record.metricId + '_' + record.target;
  delete _activeRecords[activeKey];
  
  completeRecord(record, null);
  
  if (metadata) {
    for (var key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        record.metadata[key] = metadata[key];
      }
    }
  }
  
  if (isDebugMode()) {
    console.log('[Performance] Completed:', record.target || record.metricId, 'Duration:', record.duration + 'ms');
  }
  
  return record;
}

export function record(metricId, target, duration, metadata) {
  if (!metricId) {
    console.warn('[Performance] record() called without metricId');
    return null;
  }
  
  if (duration === undefined || duration === null || duration < 0) {
    if (isDebugMode()) {
      console.warn('[Performance] Invalid duration for:', metricId);
    }
    return null;
  }
  
  // Validate metric exists
  if (!validateMetricId(metricId)) {
    if (isDebugMode()) {
      console.warn('[Performance] Unknown metric:', metricId);
    }
    return null;
  }
  
  var record = createRecord(metricId, target, null, metadata);
  record.duration = duration;
  record.status = 'completed';
  record.endTime = new Date().toISOString();
  record.timestamp = new Date().toISOString();
  
  _records[record.id] = record;
  _recordIds.push(record.id);
  
  if (isDebugMode()) {
    console.log('[Performance] Recorded:', target || metricId, 'Duration:', duration + 'ms');
  }
  
  trimHistory();
  
  return record;
}

// ============================================================
// BOOT TRACKING
// ============================================================

export function startBoot(metadata) {
  if (_bootRecordId) {
    if (isDebugMode()) {
      console.warn('[Performance] Boot already started');
    }
    return _bootRecordId;
  }
  
  var id = start('runtime.boot.duration', 'Boot', metadata);
  _bootRecordId = id;
  return id;
}

export function finishBoot(metadata) {
  if (!_bootRecordId) {
    if (isDebugMode()) {
      console.warn('[Performance] Boot not started');
    }
    return null;
  }
  
  var record = end(_bootRecordId, metadata);
  _bootRecordId = null;
  return record;
}

// ============================================================
// MODULE TRACKING
// ============================================================

export function startModule(moduleName, metadata) {
  if (!moduleName) {
    console.warn('[Performance] startModule() called without moduleName');
    return null;
  }
  
  return start('runtime.module.duration', moduleName, metadata);
}

export function finishModule(moduleName, metadata) {
  if (!moduleName) {
    console.warn('[Performance] finishModule() called without moduleName');
    return null;
  }
  
  // Find active record for this module
  var activeKey = 'runtime.module.duration' + '_' + moduleName;
  var active = _activeRecords[activeKey];
  if (!active) {
    if (isDebugMode()) {
      console.warn('[Performance] No active record for module:', moduleName);
    }
    return null;
  }
  
  return end(active.id, metadata);
}

// ============================================================
// RECORD MANAGEMENT
// ============================================================

export function getRecords() {
  var result = [];
  for (var i = 0; i < _recordIds.length; i++) {
    result.push(_records[_recordIds[i]]);
  }
  return result;
}

export function getCompletedRecords() {
  var result = [];
  for (var i = 0; i < _recordIds.length; i++) {
    var record = _records[_recordIds[i]];
    if (record.status === 'completed') {
      result.push(record);
    }
  }
  return result;
}

export function getActiveRecords() {
  var result = [];
  for (var key in _activeRecords) {
    if (_activeRecords.hasOwnProperty(key)) {
      result.push(_activeRecords[key]);
    }
  }
  return result;
}

export function getRecordsByMetric(metricId) {
  var result = [];
  for (var i = 0; i < _recordIds.length; i++) {
    var record = _records[_recordIds[i]];
    if (record.metricId === metricId) {
      result.push(record);
    }
  }
  return result;
}

export function getRecordsByTarget(target) {
  var result = [];
  for (var i = 0; i < _recordIds.length; i++) {
    var record = _records[_recordIds[i]];
    if (record.target === target) {
      result.push(record);
    }
  }
  return result;
}

export function getRecord(id) {
  return _records[id] || null;
}

export function clear() {
  _records = {};
  _recordIds = [];
  _activeRecords = {};
  _bootRecordId = null;
  if (isDebugMode()) {
    console.log('[Performance] Collector cleared');
  }
}

function trimHistory() {
  var limit = getHistoryLimit();
  if (_recordIds.length > limit) {
    var toRemove = _recordIds.length - limit;
    for (var i = 0; i < toRemove; i++) {
      var id = _recordIds[i];
      if (_activeRecords[id]) continue;
      delete _records[id];
    }
    _recordIds = _recordIds.slice(toRemove);
  }
}

export function getRecordCount() {
  return _recordIds.length;
}

export function getActiveCount() {
  return Object.keys(_activeRecords).length;
}

// ============================================================
// STATISTICS HELPERS
// ============================================================

export function getAverageDuration(metricId) {
  var records = getRecordsByMetric(metricId);
  var completed = records.filter(function(r) { return r.status === 'completed'; });
  if (completed.length === 0) return null;
  
  var sum = 0;
  for (var i = 0; i < completed.length; i++) {
    sum += completed[i].duration || 0;
  }
  return Math.round(sum / completed.length);
}

export function getTotalDuration(metricId) {
  var records = getRecordsByMetric(metricId);
  var completed = records.filter(function(r) { return r.status === 'completed'; });
  if (completed.length === 0) return 0;
  
  var sum = 0;
  for (var i = 0; i < completed.length; i++) {
    sum += completed[i].duration || 0;
  }
  return sum;
}

export function getSlowest(metricId, limit) {
  limit = limit || 5;
  var records = getRecordsByMetric(metricId);
  var completed = records.filter(function(r) { return r.status === 'completed'; });
  completed.sort(function(a, b) {
    return (b.duration || 0) - (a.duration || 0);
  });
  return completed.slice(0, limit);
}

export function getFastest(metricId, limit) {
  limit = limit || 5;
  var records = getRecordsByMetric(metricId);
  var completed = records.filter(function(r) { return r.status === 'completed'; });
  completed.sort(function(a, b) {
    return (a.duration || 0) - (b.duration || 0);
  });
  return completed.slice(0, limit);
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initCollector() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }
  
  _historyLimit = getHistoryLimit();
  _isInitialized = true;
  
  if (isDebugMode()) {
    console.log('[Performance] Collector initialized');
    console.log('[Performance] History Limit:', _historyLimit);
  }
  
  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceCollector = {
    start: start,
    end: end,
    record: record,
    startBoot: startBoot,
    finishBoot: finishBoot,
    startModule: startModule,
    finishModule: finishModule,
    getRecords: getRecords,
    getCompletedRecords: getCompletedRecords,
    getActiveRecords: getActiveRecords,
    getRecordsByMetric: getRecordsByMetric,
    getRecordsByTarget: getRecordsByTarget,
    getRecord: getRecord,
    clear: clear,
    getRecordCount: getRecordCount,
    getActiveCount: getActiveCount,
    getAverageDuration: getAverageDuration,
    getTotalDuration: getTotalDuration,
    getSlowest: getSlowest,
    getFastest: getFastest,
    init: function() {
      var result = initCollector();
      console.log('✅ RuntimePerformanceCollector ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceCollector = window.runtimePerformanceCollector;
  }
}
