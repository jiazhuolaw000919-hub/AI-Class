/**
 * System Adaptation Validator
 * Validates adaptation definitions and rules.
 * Warnings only – never stops Boot.
 */

import { ADAPTATION_TYPES, ADAPTATION_SIGNALS, ADAPTATION_CATEGORIES } from './systemAdaptationManifest.js';
import { getRecommendations } from './systemAdaptationCollector.js';

export function validateAdaptations() {
  var warnings = [];
  var definedTypes = ADAPTATION_TYPES.map(function(a) { return a.id; });

  // Check for duplicate adaptation types
  var seen = {};
  for (var i = 0; i < definedTypes.length; i++) {
    if (seen[definedTypes[i]]) {
      warnings.push('Duplicate adaptation type: "' + definedTypes[i] + '"');
    }
    seen[definedTypes[i]] = true;
  }

  // Check for missing descriptions
  for (var i = 0; i < ADAPTATION_TYPES.length; i++) {
    var a = ADAPTATION_TYPES[i];
    if (!a.description || a.description.trim() === '') {
      warnings.push('Missing description for adaptation: "' + a.id + '"');
    }
    if (!a.category || ADAPTATION_CATEGORIES.indexOf(a.category) === -1) {
      warnings.push('Invalid category "' + a.category + '" for adaptation: "' + a.id + '"');
    }
  }

  // Check for invalid signal sources
  var signalIds = ADAPTATION_SIGNALS.map(function(s) { return s.id; });
  for (var i = 0; i < ADAPTATION_SIGNALS.length; i++) {
    var s = ADAPTATION_SIGNALS[i];
    if (!s.source || s.source.trim() === '') {
      warnings.push('Missing source for signal: "' + s.id + '"');
    }
    if (!s.description || s.description.trim() === '') {
      warnings.push('Missing description for signal: "' + s.id + '"');
    }
  }

  // Check for unsafe adaptation requests in recommendations
  var recommendations = getRecommendations();
  var unsafeKeywords = ['delete', 'remove', 'destroy', 'rewrite', 'replace'];
  for (var i = 0; i < recommendations.length; i++) {
    var r = recommendations[i];
    if (r.description) {
      var lower = r.description.toLowerCase();
      for (var j = 0; j < unsafeKeywords.length; j++) {
        if (lower.indexOf(unsafeKeywords[j]) !== -1) {
          warnings.push('Unsafe adaptation request: "' + r.id + '" contains "' + unsafeKeywords[j] + '"');
        }
      }
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAdaptationValidator = {
    validateAdaptations: validateAdaptations,
    init: function() {
      console.log('✅ SystemAdaptationValidator ready');
      var warnings = validateAdaptations();
      if (warnings.length > 0) {
        console.warn('⚠️ Adaptation warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All adaptations valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAdaptationValidator = window.systemAdaptationValidator;
  }
}
