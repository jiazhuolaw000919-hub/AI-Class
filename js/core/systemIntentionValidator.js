/**
 * System Intention Validator
 * Validates intention definitions and state.
 * Warnings only – never stops Boot.
 */

import { INTENTION_TYPES } from './systemIntentionManifest.js';
import { getCurrentIntention, getIntentionHistory } from './systemIntentionCollector.js';

export function validateIntentions() {
  var warnings = [];
  var definedIntentions = INTENTION_TYPES.map(function(i) { return i.id; });

  // Check for duplicate intentions
  var seen = {};
  for (var i = 0; i < definedIntentions.length; i++) {
    if (seen[definedIntentions[i]]) {
      warnings.push('Duplicate Intention: "' + definedIntentions[i] + '"');
    }
    seen[definedIntentions[i]] = true;
  }

  // Check for missing descriptions
  for (var i = 0; i < INTENTION_TYPES.length; i++) {
    var intention = INTENTION_TYPES[i];
    if (!intention.description || intention.description.trim() === '') {
      warnings.push('Missing description for intention: "' + intention.id + '"');
    }
    if (!intention.category || intention.category.trim() === '') {
      warnings.push('Missing category for intention: "' + intention.id + '"');
    }
  }

  // Check current intention validity
  var current = getCurrentIntention();
  if (current && definedIntentions.indexOf(current) === -1) {
    warnings.push('Unknown current intention: "' + current + '"');
  }

  // Check historical intentions validity
  var history = getIntentionHistory();
  for (var i = 0; i < history.length; i++) {
    var h = history[i];
    if (h.intention && definedIntentions.indexOf(h.intention) === -1) {
      warnings.push('Unknown historical intention: "' + h.intention + '"');
    }
  }

  // Check for duplicate history entries (same intention, same timestamp)
  var seenHistory = {};
  for (var i = 0; i < history.length; i++) {
    var key = history[i].intention + '-' + history[i].timestamp;
    if (seenHistory[key]) {
      warnings.push('Duplicate historical entry: "' + history[i].intention + '"');
    }
    seenHistory[key] = true;
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntentionValidator = {
    validateIntentions: validateIntentions,
    init: function() {
      console.log('✅ SystemIntentionValidator ready');
      var warnings = validateIntentions();
      if (warnings.length > 0) {
        console.warn('⚠️ Intention warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All intentions valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntentionValidator = window.systemIntentionValidator;
  }
}
