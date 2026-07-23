/**
 * Runtime Event Collector
 * Runtime Event Capture Engine
 * Part 44.3 - Runtime Event Collector Implementation
 */

// ============================================================
// COLLECTOR STATE
// ============================================================

var _collectorCache = [];
var _isInitialized = false;
var _sessionId = null;
var _recordCounter = 0;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getRegistry() {
  return LawAIApp.RuntimeEventRegistry || window.runtimeEventRegistry;
}

function getStore() {
  return LawAIApp.RuntimeEventStore || window.runtimeEventStore;
}

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function generateRecordId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  var random = Math.random().toString(36).substring(2, 6);
  return 'evt_' + timestamp + '_' + random;
}

function generateSessionId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  return 'session_' + timestamp;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Event Collector] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

function isEventRegistered(eventId) {
  var registry = getRegistry();
  if (!registry) return false;
  return safeCall(function() {
    if (typeof registry.isRegistered === 'function') {
      return registry.isRegistered(eventId);
    }
    return false;
  }, false);
}

function getEventDefinition(eventId) {
  var registry = getRegistry();
  if (!registry) return null;
  return safeCall(function() {
    if (typeof registry.get === 'function') {
      return registry.get(eventId);
    }
    return null;
  }, null);
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export function getSessionId() {
  if (!_sessionId) {
    _sessionId = generateSessionId();
  }
  return _sessionId;
}

export function resetSession() {
  _sessionId = generateSessionId();
  _recordCounter = 0;
  if (isDebugMode()) {
    console.log('[Event Collector] Session Reset:', _sessionId);
  }
}

// ============================================================
// RECORD CREATION
// ============================================================

export function createRecord(eventId, payload, metadata) {
  // Validate event is registered
  if (!isEventRegistered(eventId)) {
    if (isDebugMode()) {
      console.warn('[Event Collector] Unknown event:', eventId);
    }
    return null;
  }

  // Get event definition for metadata
  var eventDef = getEventDefinition(eventId);

  var record = {
    id: generateRecordId(),
    eventId: eventId,
    category: eventDef ? eventDef.category : 'UNKNOWN',
    source: eventDef ? eventDef.source : 'unknown',
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    payload: payload || {},
    metadata: metadata || {}
  };

  _recordCounter++;

  return record;
}

// ============================================================
// CORE API
// ============================================================

export function collect(eventId, payload, metadata) {
  if (!eventId) {
    console.warn('[Event Collector] collect() called without eventId');
    return null;
  }

  if (isDebugMode()) {
    console.log('[Event Collector] Collect:', eventId);
  }

  // Create record
  var record = createRecord(eventId, payload, metadata);
  if (!record) {
    if (isDebugMode()) {
      console.warn('[Event Collector] Failed to create record for:', eventId);
    }
    return null;
  }

  // Add to cache
  _collectorCache.push(record);

  // Forward to store if available
  var store = getStore();
  if (store && typeof store.addEvent === 'function') {
    safeCall(function() {
      store.addEvent(record);
    });
  }

  if (isDebugMode()) {
    console.log('[Event Collector] Record Created:', record.id);
  }

  return record;
}

export function collectBatch(events) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.warn('[Event Collector] collectBatch() called with empty events');
    return [];
  }

  var records = [];
  for (var i = 0; i < events.length; i++) {
    var evt = events[i];
    var record = collect(evt.eventId, evt.payload, evt.metadata);
    if (record) {
      records.push(record);
    }
  }

  if (isDebugMode()) {
    console.log('[Event Collector] Batch collected:', records.length + '/' + events.length);
  }

  return records;
}

export function getCache() {
  return _collectorCache.slice();
}

export function getCacheCount() {
  return _collectorCache.length;
}

export function clearCache() {
  _collectorCache = [];
  if (isDebugMode()) {
    console.log('[Event Collector] Cache cleared');
  }
}

// ============================================================
// EVENT EMITTER HELPERS
// ============================================================

export function emitBootStart(payload) {
  return collect('runtime.boot.start', payload || {});
}

export function emitBootComplete(payload) {
  return collect('runtime.boot.complete', payload || {});
}

export function emitModuleLoaded(moduleName, payload) {
  return collect('runtime.module.loaded', payload || { moduleName: moduleName });
}

export function emitModuleFailed(moduleName, error) {
  return collect('runtime.module.failed', payload || { moduleName: moduleName, error: error });
}

export function emitModuleReady(moduleName, payload) {
  return collect('runtime.module.ready', payload || { moduleName: moduleName });
}

export function emitStateChanged(fromState, toState) {
  return collect('runtime.state.changed', { from: fromState, to: toState });
}

export function emitLessonCompleted(lessonId, payload) {
  return collect('learning.lesson.completed', payload || { lessonId: lessonId });
}

// ============================================================
// RESET
// ============================================================

export function reset() {
  _collectorCache = [];
  _recordCounter = 0;
  resetSession();
  if (isDebugMode()) {
    console.log('[Event Collector] Reset complete');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initCollector() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _sessionId = generateSessionId();
  _recordCounter = 0;
  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Event Collector] Initialized');
    console.log('[Event Collector] Session:', _sessionId);
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeEventCollector = {
    collect: collect,
    collectBatch: collectBatch,
    createRecord: createRecord,
    getCache: getCache,
    getCacheCount: getCacheCount,
    clearCache: clearCache,
    getSessionId: getSessionId,
    resetSession: resetSession,
    emitBootStart: emitBootStart,
    emitBootComplete: emitBootComplete,
    emitModuleLoaded: emitModuleLoaded,
    emitModuleFailed: emitModuleFailed,
    emitModuleReady: emitModuleReady,
    emitStateChanged: emitStateChanged,
    emitLessonCompleted: emitLessonCompleted,
    reset: reset,
    init: function() {
      var result = initCollector();
      console.log('✅ RuntimeEventCollector ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventCollector = window.runtimeEventCollector;
  }
}
