/**
 * Boot Validator
 * Validates boot phases and sequence.
 * Warnings only – never stops Boot.
 */

import { BOOT_PHASES } from './bootSequenceManifest.js';

export function validateBootSequence() {
  var warnings = [];
  var seen = new Set();
  var seenOrder = new Set();
  
  for (var i = 0; i < BOOT_PHASES.length; i++) {
    var phase = BOOT_PHASES[i];
    
    // Duplicate phase
    if (seen.has(phase.id)) {
      warnings.push('Duplicate phase: "' + phase.id + '"');
    }
    seen.add(phase.id);
    
    // Duplicate order
    if (seenOrder.has(phase.order)) {
      warnings.push('Duplicate order: "' + phase.order + '" for phase: "' + phase.id + '"');
    }
    seenOrder.add(phase.order);
    
    // Missing description
    if (!phase.description || phase.description.trim() === '') {
      warnings.push('Missing description for phase: "' + phase.id + '"');
    }
    
    // Missing name
    if (!phase.name || phase.name.trim() === '') {
      warnings.push('Missing name for phase: "' + phase.id + '"');
    }
    
    // Missing order
    if (phase.order === undefined || phase.order === null) {
      warnings.push('Missing order for phase: "' + phase.id + '"');
    }
    
    // Invalid status
    if (phase.status && !['active', 'deprecated', 'experimental'].includes(phase.status)) {
      warnings.push('Invalid status "' + phase.status + '" for phase: "' + phase.id + '"');
    }
    
    // Version check
    if (!phase.version || phase.version.trim() === '') {
      warnings.push('Missing version for phase: "' + phase.id + '"');
    }
  }
  
  // Check for order gaps
  var maxOrder = BOOT_PHASES.length > 0 ? Math.max.apply(null, BOOT_PHASES.map(function(p) { return p.order; })) : 0;
  for (var i = 0; i <= maxOrder; i++) {
    var phaseExists = BOOT_PHASES.some(function(p) { return p.order === i; });
    if (!phaseExists) {
      warnings.push('Missing phase at order: "' + i + '"');
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootValidator = {
    validateBootSequence: validateBootSequence,
    init: function() {
      console.log('✅ BootValidator ready');
      var warnings = validateBootSequence();
      if (warnings.length > 0) {
        console.warn('⚠️ Boot validation warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Boot sequence valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootValidator = window.bootValidator;
  }
}
