/**
 * System Awareness Validator
 * Validates awareness sources.
 * Warnings only – never stops Boot.
 */

import { AWARENESS_SOURCES } from './systemAwarenessManifest.js';

export function validateAwareness() {
  var warnings = [];
  var seen = new Set();
  
  for (var i = 0; i < AWARENESS_SOURCES.length; i++) {
    var s = AWARENESS_SOURCES[i];
    
    // Duplicate source
    if (seen.has(s.id)) {
      warnings.push('Duplicate awareness source: "' + s.id + '"');
    }
    seen.add(s.id);
    
    // Missing description
    if (!s.description || s.description.trim() === '') {
      warnings.push('Missing description for source: "' + s.id + '"');
    }
    
    // Missing name
    if (!s.name || s.name.trim() === '') {
      warnings.push('Missing name for source: "' + s.id + '"');
    }
    
    // Missing version
    if (!s.version || s.version.trim() === '') {
      warnings.push('Missing version for source: "' + s.id + '"');
    }
    
    // Unknown status
    if (s.status && !['active', 'deprecated', 'experimental'].includes(s.status)) {
      warnings.push('Invalid status "' + s.status + '" for source: "' + s.id + '"');
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAwarenessValidator = {
    validateAwareness,
    init: function() {
      console.log('✅ SystemAwarenessValidator ready');
      var warnings = validateAwareness();
      if (warnings.length > 0) {
        console.warn('⚠️ System Awareness warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All awareness sources valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAwarenessValidator = window.systemAwarenessValidator;
  }
}
