/**
 * Runtime Intelligence Validator
 * Validates observation requests.
 * Warnings only – never stops Boot.
 */

import { OBSERVATION_TARGETS, OBSERVATION_SOURCES, OBSERVATION_TYPES } from './runtimeIntelligenceManifest.js';

export function validateObservation(targetId, source, type) {
  const warnings = [];
  
  // Unknown observation target
  if (!OBSERVATION_TARGETS.some(t => t.id === targetId)) {
    warnings.push(`Unknown Observation Target: "${targetId}"`);
  }
  
  // Unknown runtime source
  if (source && !OBSERVATION_SOURCES.includes(source)) {
    warnings.push(`Unknown Runtime Source: "${source}"`);
  }
  
  // Illegal observation type
  if (type && !OBSERVATION_TYPES.includes(type)) {
    warnings.push(`Illegal Observation Type: "${type}"`);
  }
  
  // Permission violation (warn if trying to modify)
  if (type === 'modify' || type === 'control' || type === 'write') {
    warnings.push(`Permission Violation: "${type}" is not allowed (read-only)`);
  }
  
  // Missing metadata
  const target = OBSERVATION_TARGETS.find(t => t.id === targetId);
  if (target && (!target.name || !target.version)) {
    warnings.push(`Missing Metadata: target "${targetId}" has incomplete metadata`);
  }
  
  return warnings;
}

export function validateObservationBatch(observations) {
  const results = {};
  
  for (const obs of observations) {
    const warnings = validateObservation(obs.targetId, obs.source, obs.type);
    results[obs.targetId] = warnings;
  }
  
  return results;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeIntelligenceValidator = {
    validateObservation,
    validateObservationBatch,
    init: function() { console.log('✅ RuntimeIntelligenceValidator ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeIntelligenceValidator = {
      validateObservation,
      validateObservationBatch,
      init: function() { console.log('✅ RuntimeIntelligenceValidator ready'); return this; }
    };
  }
}
