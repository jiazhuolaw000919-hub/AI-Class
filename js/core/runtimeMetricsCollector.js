/**
 * Runtime Metrics Collector
 * Collects runtime performance metrics.
 * No execution – observation only.
 */

import { METRICS } from './runtimeMetricsManifest.js';

// In‑memory metrics store
var _metrics = {};
var _metricHistory = [];
var _maxHistory = 100;

// Initialize metrics with default values
export function initializeMetrics() {
  for (var i = 0; i < METRICS.length; i++) {
    var id = METRICS[i].id;
    _metrics[id] = {
      value: 0,
      updated: null,
      unit: METRICS[i].unit
    };
  }
}

export function setMetric(id, value) {
  var metric = METRICS.find(function(m) { return m.id === id; });
  if (!metric) {
    console.warn('⚠️ Unknown metric:', id);
    return false;
  }
  
  _metrics[id] = {
    value: value,
    updated: new Date().toISOString(),
    unit: metric.unit
  };
  
  // Record history
  _metricHistory.push({
    metric: id,
    value: value,
    timestamp: new Date().toISOString()
  });
  
  if (_metricHistory.length > _maxHistory) {
    _metricHistory = _metricHistory.slice(-_maxHistory);
  }
  
  return true;
}

export function getMetric(id) {
  return _metrics[id] || null;
}

export function getMetricValue(id) {
  return _metrics[id] ? _metrics[id].value : null;
}

export function getAllMetrics() {
  return JSON.parse(JSON.stringify(_metrics));
}

export function getMetricHistory(id) {
  return _metricHistory.filter(function(h) { return h.metric === id; });
}

export function getMetricHistoryValue(id) {
  var history = getMetricHistory(id);
  return history.map(function(h) { return h.value; });
}

export function getLatestHistory(id, limit) {
  var history = getMetricHistory(id);
  limit = limit || 10;
  return history.slice(-limit);
}

export function getAverageMetric(id) {
  var history = getMetricHistory(id);
  if (history.length === 0) return null;
  var sum = history.reduce(function(a, b) { return a + b.value; }, 0);
  return Math.round(sum / history.length);
}

export function clearMetrics() {
  _metrics = {};
  _metricHistory = [];
  initializeMetrics();
}

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    metrics: getAllMetrics(),
    history: _metricHistory.slice(-20)
  };
  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeMetricsCollector = {
    initializeMetrics: initializeMetrics,
    setMetric: setMetric,
    getMetric: getMetric,
    getMetricValue: getMetricValue,
    getAllMetrics: getAllMetrics,
    getMetricHistory: getMetricHistory,
    getMetricHistoryValue: getMetricHistoryValue,
    getLatestHistory: getLatestHistory,
    getAverageMetric: getAverageMetric,
    clearMetrics: clearMetrics,
    collectAll: collectAll,
    init: function() {
      initializeMetrics();
      console.log('✅ RuntimeMetricsCollector ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeMetricsCollector = window.runtimeMetricsCollector;
  }
}
