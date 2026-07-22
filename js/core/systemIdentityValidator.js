/**
 * System Identity Validator
 * Validates system identity integrity.
 * Warnings only – never stops Boot.
 */

import { SYSTEM_IDENTITY } from './systemIdentityManifest.js';

export function validateIdentity() {
  var warnings = [];
  var identity = SYSTEM_IDENTITY;

  // Check for missing identity fields
  var requiredFields = ['systemName', 'systemVersion', 'architectureVersion', 'intelligenceEra', 'currentSeason', 'currentPart', 'identitySignature'];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!identity[field] || identity[field].trim() === '') {
      warnings.push('Missing identity field: "' + field + '"');
    }
  }

  // Check for invalid version format
  if (identity.systemVersion && !/^V\d+\.\d+\.\d+$/.test(identity.systemVersion)) {
    warnings.push('Invalid system version format: "' + identity.systemVersion + '"');
  }

  if (identity.architectureVersion && !/^V\d+\.\d+\.\d+$/.test(identity.architectureVersion)) {
    warnings.push('Invalid architecture version format: "' + identity.architectureVersion + '"');
  }

  // Check for unknown architecture layers
  var layers = identity.architectureLayers || [];
  var expectedLayers = ['Architecture', 'Runtime', 'Governance', 'Awareness', 'Intelligence', 'Memory', 'Reflection', 'Decision', 'Evolution', 'State', 'Context', 'Intention', 'Adaptation', 'Coherence', 'Continuity', 'Identity'];
  for (var i = 0; i < layers.length; i++) {
    if (expectedLayers.indexOf(layers[i]) === -1) {
      warnings.push('Unknown architecture layer: "' + layers[i] + '"');
    }
  }

  // Check for missing signature
  if (!identity.identitySignature || identity.identitySignature.trim() === '') {
    warnings.push('Missing identity signature');
  } else {
    // Check if signature matches expected format
    var expectedSignature = 'LAAER-SIE-V' + identity.systemVersion.replace('V', '');
    if (identity.identitySignature !== expectedSignature) {
      warnings.push('Identity signature mismatch: "' + identity.identitySignature + '" vs expected "' + expectedSignature + '"');
    }
  }

  // Check for identity conflicts (version vs signature)
  if (identity.systemVersion && identity.identitySignature) {
    var versionFromSignature = identity.identitySignature.split('-').pop() || '';
    var versionNumber = identity.systemVersion.replace('V', '');
    if (versionFromSignature !== versionNumber) {
      warnings.push('Identity conflict: signature version "' + versionFromSignature + '" does not match system version "' + versionNumber + '"');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIdentityValidator = {
    validateIdentity: validateIdentity,
    init: function() {
      console.log('✅ SystemIdentityValidator ready');
      var warnings = validateIdentity();
      if (warnings.length > 0) {
        console.warn('⚠️ Identity warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ System identity valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIdentityValidator = window.systemIdentityValidator;
  }
}
