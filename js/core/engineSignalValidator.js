/**
 * Engine Signal Validator
 * Validates signal definitions.
 * Warnings only – never stops Boot.
 */

import { OFFICIAL_SIGNALS, SIGNAL_TYPES, SEVERITY_LEVELS } from './engineSignalManifest.js';

export function validateSignals() {
  const warnings = [];
  const seen = new Set();
  
  for (let i = 0; i < OFFICIAL_SIGNALS.length; i++) {
    const s = OFFICIAL_SIGNALS[i];
    
    // Duplicate signal
    if (seen.has(s.name)) {
      warnings.push('Duplicate signal: "' + s.name + '"');
    }
    seen.add(s.name);
    
    // Invalid signal type
    if (s.type && !SIGNAL_TYPES.includes(s.type)) {
      warnings.push('Invalid signal type "' + s.type + '" for signal: "' + s.name + '"');
    }
    
    // Invalid severity
    if (s.severity && !SEVERITY_LEVELS.includes(s.severity)) {
      warnings.push('Invalid severity "' + s.severity + '" for signal: "' + s.name + '"');
    }
    
    // Missing description
    if (!s.description || s.description.trim() === '') {
      warnings.push('Missing description for signal: "' + s.name + '"');
    }
    
    // Unknown source
    if (!s.source || s.source.trim() === '') {
      warnings.push('Missing source for signal: "' + s.name + '"');
    }
    
    // Missing version
    if (!s.version || s.version.trim() === '') {
      warnings.push('Missing version for signal: "' + s.name + '"');
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineSignalValidator = {
    validateSignals,
    init: function() {
      console.log('✅ EngineSignalValidator ready');
      const warnings = validateSignals();
      if (warnings.length > 0) {
        console.warn('⚠️ Signal warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All signals valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineSignalValidator = window.engineSignalValidator;
  }
}
