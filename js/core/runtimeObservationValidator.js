/**
 * Runtime Observation Validator
 * Validates observation events and format.
 * Warnings only – never stops Boot.
 */

import { OBSERVATION_EVENTS, OBSERVATION_CATEGORIES } from './runtimeObservationManifest.js';
import { getObservations } from './runtimeObservationCollector.js';

export function validateObservation(observation) {
  var warnings = [];
  
  if (!observation) {
    warnings.push('Observation is null or undefined');
    return warnings;
  }
  
  // Check for duplicate events
  var events = getObservations();
  var duplicates = events.filter(function(o) {
    return o.event === observation.event && o.timestamp === observation.timestamp;
  });
  if (duplicates.length > 1) {
    warnings.push('Duplicate event: "' + observation.event + '" at ' + observation.timestamp);
  }
  
  // Check for invalid event format
  if (!observation.event || observation.event.trim() === '') {
    warnings.push('Invalid event format: missing event name');
  } else {
    var validEvent = OBSERVATION_EVENTS.some(function(e) { return e.id === observation.event; });
    if (!validEvent) {
      warnings.push('Unknown event: "' + observation.event + '"');
    }
  }
  
  // Check for unknown source
  if (!observation.source || observation.source.trim() === '') {
    warnings.push('Missing source for observation');
  }
  
  // Check for missing metadata
  if (!observation.metadata) {
    warnings.push('Missing metadata for observation');
  }
  
  // Check for invalid timestamp
  if (observation.timestamp && isNaN(new Date(observation.timestamp).getTime())) {
    warnings.push('Invalid timestamp: "' + observation.timestamp + '"');
  }
  
  return warnings;
}

export function validateAllObservations() {
  var observations = getObservations();
  var allWarnings = [];
  
  for (var i = 0; i < observations.length; i++) {
    var warnings = validateObservation(observations[i]);
    if (warnings.length > 0) {
      allWarnings.push({
        index: i,
        observation: observations[i],
        warnings: warnings
      });
    }
  }
  
  return allWarnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeObservationValidator = {
    validateObservation: validateObservation,
    validateAllObservations: validateAllObservations,
    init: function() {
      console.log('✅ RuntimeObservationValidator ready');
      var warnings = validateAllObservations();
      if (warnings.length > 0) {
        console.warn('⚠️ Observation warnings:', warnings.length);
      } else {
        console.log('✅ All observations valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeObservationValidator = window.runtimeObservationValidator;
  }
}
