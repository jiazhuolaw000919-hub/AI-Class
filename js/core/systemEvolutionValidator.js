/**
 * System Evolution Validator
 * Validates evolution compatibility and stability.
 * Warnings only – never stops Boot.
 */

import { EVOLUTION_MANIFEST } from './systemEvolutionManifest.js';

export function validateEvolution() {
  var warnings = [];
  
  // Check backward compatibility
  var timeline = EVOLUTION_MANIFEST.timeline;
  var versions = timeline.map(function(t) { return t.version; });
  var uniqueVersions = [];
  
  for (var i = 0; i < versions.length; i++) {
    if (uniqueVersions.indexOf(versions[i]) === -1) {
      uniqueVersions.push(versions[i]);
    }
  }
  
  // Check version ordering
  for (var i = 0; i < uniqueVersions.length - 1; i++) {
    var current = uniqueVersions[i];
    var next = uniqueVersions[i + 1];
    
    // Simple version comparison (assuming semver format)
    var currentParts = current.split('.').map(Number);
    var nextParts = next.split('.').map(Number);
    
    if (currentParts.length === 3 && nextParts.length === 3) {
      if (nextParts[0] < currentParts[0]) {
        warnings.push('Breaking Change: Version ' + next + ' is lower than ' + current);
      }
    }
  }
  
  // Check for deprecated milestones (status check)
  var milestones = EVOLUTION_MANIFEST.milestones;
  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    if (m.status && m.status === 'deprecated') {
      warnings.push('Deprecated Milestone: ' + m.name + ' (' + m.id + ')');
    }
  }
  
  // Check migration requirement (if any milestone is pending)
  var pending = milestones.filter(function(m) { return !m.completed; });
  if (pending.length > 0) {
    warnings.push('Migration Required: ' + pending.length + ' milestones pending');
  }
  
  // Architecture stability (check if architecture version changed significantly)
  var versions_ = timeline.map(function(t) { return t.version; });
  var majorChanges = 0;
  for (var i = 0; i < versions_.length - 1; i++) {
    var v1 = versions_[i].split('.');
    var v2 = versions_[i + 1].split('.');
    if (v1[0] !== v2[0]) {
      majorChanges++;
    }
  }
  
  if (majorChanges > 3) {
    warnings.push('Architecture Stability: ' + majorChanges + ' major version changes detected');
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemEvolutionValidator = {
    validateEvolution: validateEvolution,
    init: function() {
      console.log('✅ SystemEvolutionValidator ready');
      var warnings = validateEvolution();
      if (warnings.length > 0) {
        console.warn('⚠️ Evolution warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Evolution valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemEvolutionValidator = window.systemEvolutionValidator;
  }
}
