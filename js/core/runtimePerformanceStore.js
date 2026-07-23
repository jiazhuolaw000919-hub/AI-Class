/**
 * Runtime Performance Store
 * Performance Data Storage Engine
 * Part 43.5 - Runtime Performance Store & History Management
 */

// ============================================================
// STORE STATE
// ============================================================

var _currentSession = null;
var _history = [];
var _maxSessions = 10;
var _isInitialized = false;
var _sessionCounter = 0;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateSessionId() {
  _sessionCounter++;
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  return 'session_' + timestamp + '_' + _sessionCounter;
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
  return 10;
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export function createSession(metadata) {
  if (_currentSession) {
    if (isDebugMode()) {
      console.warn('[Performance Store] Session already active, ending previous');
    }
    endSession();
  }
  
  var session = {
    id: generateSessionId(),
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    records: [],
    metadata: metadata || {},
    status: 'active'
  };
  
  _currentSession = session;
  
  if (isDebugMode()) {
    console.log('[Performance Store] Session Created:', session.id);
  }
  
  return session;
}

export function endSession(metadata) {
  if (!_currentSession) {
    if (isDebugMode()) {
      console.warn('[Performance Store] No active session to end');
    }
    return null;
  }
  
  _currentSession.endTime = new Date().toISOString();
  var start = new Date(_currentSession.startTime);
  var end = new Date(_currentSession.endTime);
  _currentSession.duration = end - start;
  _currentSession.status = 'completed';
  
  if (metadata) {
    for (var key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        _currentSession.metadata[key] = metadata[key];
      }
    }
  }
  
  // Add to history
  _history.push(_currentSession);
  
  // Trim history
  trimHistory();
  
  var completedSession = _currentSession;
  _currentSession = null;
  
  if (isDebugMode()) {
    console.log('[Performance Store] Session Completed:', completedSession.id, 'Duration:', completedSession.duration + 'ms');
    console.log('[Performance Store] History Size:', _history.length);
  }
  
  return completedSession;
}

export function getCurrentSession() {
  return _currentSession;
}

export function getSession(id) {
  if (_currentSession && _currentSession.id === id) {
    return _currentSession;
  }
  for (var i = 0; i < _history.length; i++) {
    if (_history[i].id === id) {
      return _history[i];
    }
  }
  return null;
}

export function getSessions() {
  var result = _history.slice();
  if (_currentSession) {
    result.push(_currentSession);
  }
  return result;
}

export function getCompletedSessions() {
  return _history.slice();
}

export function getSessionCount() {
  return _history.length + (_currentSession ? 1 : 0);
}

// ============================================================
// RECORD STORAGE
// ============================================================

export function addRecord(record) {
  if (!record) {
    if (isDebugMode()) {
      console.warn('[Performance Store] addRecord called with null record');
    }
    return false;
  }
  
  // Validate record
  if (!record.id || !record.metricId) {
    if (isDebugMode()) {
      console.warn('[Performance Store] Invalid record format:', record);
    }
    return false;
  }
  
  // Ensure session exists
  if (!_currentSession) {
    if (isDebugMode()) {
      console.warn('[Performance Store] No active session, creating one');
    }
    createSession();
  }
  
  _currentSession.records.push(record);
  
  if (isDebugMode()) {
    console.log('[Performance Store] Record Added:', record.target || record.metricId, record.duration + 'ms');
  }
  
  return true;
}

export function addRecords(records) {
  if (!records || !Array.isArray(records)) {
    return false;
  }
  
  var added = 0;
  for (var i = 0; i < records.length; i++) {
    if (addRecord(records[i])) {
      added++;
    }
  }
  
  return added;
}

export function getRecords(sessionId) {
  var session = getSession(sessionId);
  if (!session) return [];
  return session.records.slice();
}

export function getCurrentRecords() {
  if (!_currentSession) return [];
  return _currentSession.records.slice();
}

// ============================================================
// HISTORY MANAGEMENT
// ============================================================

function trimHistory() {
  var limit = getHistoryLimit();
  if (_history.length > limit) {
    var toRemove = _history.length - limit;
    _history.splice(0, toRemove);
    if (isDebugMode()) {
      console.log('[Performance Store] Trimmed history, removed:', toRemove);
    }
  }
}

export function clearHistory() {
  _history = [];
  _currentSession = null;
  if (isDebugMode()) {
    console.log('[Performance Store] History cleared');
  }
}

export function getHistory() {
  return _history.slice();
}

export function getHistorySize() {
  return _history.length;
}

// ============================================================
// QUERY SYSTEM
// ============================================================

export function query(filter) {
  var results = [];
  var sessions = getSessions();
  
  for (var i = 0; i < sessions.length; i++) {
    var session = sessions[i];
    var records = session.records;
    
    for (var j = 0; j < records.length; j++) {
      var record = records[j];
      var match = true;
      
      // Filter by metricId
      if (filter.metricId && record.metricId !== filter.metricId) {
        match = false;
      }
      
      // Filter by target
      if (filter.target && record.target !== filter.target) {
        match = false;
      }
      
      // Filter by minDuration
      if (filter.minDuration !== undefined && (record.duration || 0) < filter.minDuration) {
        match = false;
      }
      
      // Filter by maxDuration
      if (filter.maxDuration !== undefined && (record.duration || 0) > filter.maxDuration) {
        match = false;
      }
      
      // Filter by status
      if (filter.status && record.status !== filter.status) {
        match = false;
      }
      
      if (match) {
        results.push(record);
      }
    }
  }
  
  return results;
}

export function queryByMetric(metricId) {
  return query({ metricId: metricId });
}

export function queryByTarget(target) {
  return query({ target: target });
}

export function querySlowModules(threshold) {
  threshold = threshold || 100;
  var results = [];
  var records = query({ status: 'completed' });
  
  for (var i = 0; i < records.length; i++) {
    if ((records[i].duration || 0) > threshold) {
      results.push(records[i]);
    }
  }
  
  return results;
}

// ============================================================
// STATISTICS HELPERS
// ============================================================

export function getSessionAverageDuration() {
  var completed = getCompletedSessions();
  if (completed.length === 0) return null;
  
  var sum = 0;
  for (var i = 0; i < completed.length; i++) {
    sum += completed[i].duration || 0;
  }
  return Math.round(sum / completed.length);
}

export function getSessionTotalDuration() {
  var completed = getCompletedSessions();
  if (completed.length === 0) return 0;
  
  var sum = 0;
  for (var i = 0; i < completed.length; i++) {
    sum += completed[i].duration || 0;
  }
  return sum;
}

export function getSlowestSession() {
  var completed = getCompletedSessions();
  if (completed.length === 0) return null;
  
  var slowest = completed[0];
  for (var i = 1; i < completed.length; i++) {
    if ((completed[i].duration || 0) > (slowest.duration || 0)) {
      slowest = completed[i];
    }
  }
  return slowest;
}

export function getFastestSession() {
  var completed = getCompletedSessions();
  if (completed.length === 0) return null;
  
  var fastest = completed[0];
  for (var i = 1; i < completed.length; i++) {
    if ((completed[i].duration || 0) < (fastest.duration || 0)) {
      fastest = completed[i];
    }
  }
  return fastest;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initStore() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }
  
  _maxSessions = getHistoryLimit();
  _isInitialized = true;
  
  // Create initial session
  createSession({ initialized: new Date().toISOString() });
  
  if (isDebugMode()) {
    console.log('[Performance Store] Initialized, Max Sessions:', _maxSessions);
  }
  
  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceStore = {
    createSession: createSession,
    endSession: endSession,
    getCurrentSession: getCurrentSession,
    getSession: getSession,
    getSessions: getSessions,
    getCompletedSessions: getCompletedSessions,
    getSessionCount: getSessionCount,
    addRecord: addRecord,
    addRecords: addRecords,
    getRecords: getRecords,
    getCurrentRecords: getCurrentRecords,
    clearHistory: clearHistory,
    getHistory: getHistory,
    getHistorySize: getHistorySize,
    query: query,
    queryByMetric: queryByMetric,
    queryByTarget: queryByTarget,
    querySlowModules: querySlowModules,
    getSessionAverageDuration: getSessionAverageDuration,
    getSessionTotalDuration: getSessionTotalDuration,
    getSlowestSession: getSlowestSession,
    getFastestSession: getFastestSession,
    init: function() {
      var result = initStore();
      console.log('✅ RuntimePerformanceStore ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceStore = window.runtimePerformanceStore;
  }
}
