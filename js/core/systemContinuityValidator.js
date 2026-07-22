/**
 * System Continuity Validator
 * Validates continuity records.
 * Warnings only – never stops Boot.
 */

import { CONTINUITY_RECORDS } from './systemContinuityManifest.js';

export function validateContinuity() {
  var warnings = [];
  var milestones = CONTINUITY_RECORDS.milestones;
  var versionHistory = CONTINUITY_RECORDS.versionHistory;

  // Check for missing history
  if (milestones.length === 0) {
    warnings.push('Missing history: no milestones found');
  }

  // Check for invalid version chain
  var versionNumbers = versionHistory.map(function(v) { return v.version; });
  for (var i = 0; i < versionNumbers.length - 1; i++) {
    var current = versionNumbers[i].replace('V', '').split('.');
    var next = versionNumbers[i + 1].replace('V', '').split('.');
    
    if (current.length === 3 && next.length === 3) {
      var currentMajor = parseInt(current[0]);
      var nextMajor = parseInt(next[0]);
      var currentMinor = parseInt(current[1]);
      var nextMinor = parseInt(next[1]);
      
      // Check for invalid version progression
      if (nextMajor < currentMajor) {
        warnings.push('Invalid version chain: ' + versionNumbers[i] + ' → ' + versionNumbers[i + 1] + ' (major version decreased)');
      } else if (nextMajor === currentMajor && nextMinor < currentMinor) {
        warnings.push('Invalid version chain: ' + versionNumbers[i] + ' → ' + versionNumbers[i + 1] + ' (minor version decreased)');
      }
    }
  }

  // Check for unknown milestones (id format validation)
  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    if (!m.id || !m.id.startsWith('M')) {
      warnings.push('Unknown milestone format: "' + m.id + '"');
    }
    if (!m.name || m.name.trim() === '') {
      warnings.push('Missing name for milestone: "' + m.id + '"');
    }
    if (!m.version || m.version.trim() === '') {
      warnings.push('Missing version for milestone: "' + m.id + '"');
    }
  }

  // Check for broken continuity (milestone without version history)
  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    var versionExists = versionHistory.some(function(v) { return v.version === m.version; });
    if (!versionExists) {
      warnings.push('Broken continuity: milestone "' + m.id + '" has no version history entry');
    }
  }

  // Check for version history entries without milestones
  for (var i = 0; i < versionHistory.length; i++) {
    var v = versionHistory[i];
    var milestoneExists = milestones.some(function(m) { return m.version === v.version; });
    if (!milestoneExists) {
      warnings.push('Version "' + v.version + '" has no matching milestone');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContinuityValidator = {
    validateContinuity: validateContinuity,
    init: function() {
      console.log('✅ SystemContinuityValidator ready');
      var warnings = validateContinuity();
      if (warnings.length > 0) {
        console.warn('⚠️ Continuity warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Continuity records valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContinuityValidator = window.systemContinuityValidator;
  }
}
