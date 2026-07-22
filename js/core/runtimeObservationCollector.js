/**
 * Runtime Observation Collector
 * Collects runtime events with timestamps and metadata.
 * No execution – observation only.
 */

import { OBSERVATION_EVENTS } from './runtimeObservationManifest.js';

// In‑memory observation store
var _observations = [];
var _maxObservations = 1000;

export function collect(event, source, stage, metadata) {
  var timestamp = new Date().toISOString();
  
  var observation = {
    event: event,
    timestamp: timestamp,
    source: source || 'unknown',
    stage: stage || null,
    metadata: metadata || {}
  };
  
  _observations.push(observation);
  
  // Trim if exceeds max
  if (_observations.length > _maxObservations) {
    _observations = _observations.slice(-_maxObservations);
  }
  
  return observation;
}

export function getObservations() {
  return _observations.slice();
}

export function getObservationsByEvent(event) {
  return _observations.filter(function(o) { return o.event === event; });
}

export function getObservationsBySource(source) {
  return _observations.filter(function(o) { return o.source === source; });
}

export function getObservationsByStage(stage) {
  return _observations.filter(function(o) { return o.stage === stage; });
}

export function getObservationCount() {
  return _observations.length;
}

export function getObservationsByTimeRange(startTime, endTime) {
  return _observations.filter(function(o) {
    return o.timestamp >= startTime && o.timestamp <= endTime;
  });
}

export function clearObservations() {
  _observations = [];
}

export function getRecentObservations(limit) {
  limit = limit || 10;
  var recent = _observations.slice(-limit);
  return recent.reverse();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeObservationCollector = {
    collect: collect,
    getObservations: getObservations,
    getObservationsByEvent: getObservationsByEvent,
    getObservationsBySource: getObservationsBySource,
    getObservationsByStage: getObservationsByStage,
    getObservationCount: getObservationCount,
    getObservationsByTimeRange: getObservationsByTimeRange,
    clearObservations: clearObservations,
    getRecentObservations: getRecentObservations,
    init: function() {
      console.log('✅ RuntimeObservationCollector ready');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeObservationCollector = window.runtimeObservationCollector;
  }
}
