/**
 * Runtime Trace Collector
 * Collects runtime traces with parent/child relationships.
 * No execution – observation only.
 */

import { TRACE_TYPES, TRACE_STATUSES } from './runtimeTraceManifest.js';

// In‑memory trace store
var _traces = [];
var _activeTraces = {};
var _maxTraces = 500;

// Generate unique trace ID
function generateTraceId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  var random = Math.random().toString(36).substring(2, 6);
  return 'trace_' + timestamp + '_' + random;
}

export function startTrace(type, source, parentTraceId, metadata) {
  var traceId = generateTraceId();
  
  var trace = {
    traceId: traceId,
    parentTraceId: parentTraceId || null,
    type: type,
    source: source || 'unknown',
    status: 'STARTED',
    startedAt: new Date().toISOString(),
    completedAt: null,
    duration: null,
    metadata: metadata || {}
  };
  
  _traces.push(trace);
  _activeTraces[traceId] = trace;
  
  // Trim if exceeds max
  if (_traces.length > _maxTraces) {
    _traces = _traces.slice(-_maxTraces);
  }
  
  return trace;
}

export function completeTrace(traceId, status, metadata) {
  var trace = _activeTraces[traceId];
  if (!trace) {
    console.warn('⚠️ Trace not found:', traceId);
    return null;
  }
  
  var validStatuses = TRACE_STATUSES;
  if (status && validStatuses.indexOf(status) !== -1) {
    trace.status = status;
  } else {
    trace.status = 'COMPLETED';
  }
  
  trace.completedAt = new Date().toISOString();
  var start = new Date(trace.startedAt);
  var end = new Date(trace.completedAt);
  trace.duration = end - start;
  
  if (metadata) {
    for (var key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        trace.metadata[key] = metadata[key];
      }
    }
  }
  
  delete _activeTraces[traceId];
  
  return trace;
}

export function failTrace(traceId, error, metadata) {
  var trace = _activeTraces[traceId];
  if (!trace) {
    console.warn('⚠️ Trace not found:', traceId);
    return null;
  }
  
  trace.status = 'FAILED';
  trace.completedAt = new Date().toISOString();
  var start = new Date(trace.startedAt);
  var end = new Date(trace.completedAt);
  trace.duration = end - start;
  trace.metadata.error = error || 'Unknown error';
  
  if (metadata) {
    for (var key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        trace.metadata[key] = metadata[key];
      }
    }
  }
  
  delete _activeTraces[traceId];
  
  return trace;
}

export function getTrace(traceId) {
  return _traces.find(function(t) { return t.traceId === traceId; }) || null;
}

export function getTraces() {
  return _traces.slice();
}

export function getTracesByType(type) {
  return _traces.filter(function(t) { return t.type === type; });
}

export function getTracesByStatus(status) {
  return _traces.filter(function(t) { return t.status === status; });
}

export function getTracesByParent(parentTraceId) {
  return _traces.filter(function(t) { return t.parentTraceId === parentTraceId; });
}

export function getActiveTraces() {
  return Object.values(_activeTraces);
}

export function getActiveTraceCount() {
  return Object.keys(_activeTraces).length;
}

export function getTraceCount() {
  return _traces.length;
}

export function getTraceTree(traceId) {
  var root = getTrace(traceId);
  if (!root) return null;
  
  var children = getTracesByParent(traceId);
  var tree = {
    trace: root,
    children: children.map(function(c) {
      return getTraceTree(c.traceId);
    }).filter(function(c) { return c !== null; })
  };
  
  return tree;
}

export function clearTraces() {
  _traces = [];
  _activeTraces = {};
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeTraceCollector = {
    startTrace: startTrace,
    completeTrace: completeTrace,
    failTrace: failTrace,
    getTrace: getTrace,
    getTraces: getTraces,
    getTracesByType: getTracesByType,
    getTracesByStatus: getTracesByStatus,
    getTracesByParent: getTracesByParent,
    getActiveTraces: getActiveTraces,
    getActiveTraceCount: getActiveTraceCount,
    getTraceCount: getTraceCount,
    getTraceTree: getTraceTree,
    clearTraces: clearTraces,
    init: function() {
      console.log('✅ RuntimeTraceCollector ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeTraceCollector = window.runtimeTraceCollector;
  }
}
