/**
 * System Context Validator
 * Validates context definitions and availability.
 * Warnings only – never stops Boot.
 */

import { CONTEXT_TYPES } from './systemContextManifest.js';
import { getAvailableContexts } from './systemContextCollector.js';

export function validateContexts() {
  var warnings = [];
  var definedContexts = CONTEXT_TYPES.map(function(c) { return c.id; });
  var availableContexts = getAvailableContexts();

  // Check for duplicate contexts
  var seen = {};
  for (var i = 0; i < definedContexts.length; i++) {
    if (seen[definedContexts[i]]) {
      warnings.push('Duplicate Context: "' + definedContexts[i] + '"');
    }
    seen[definedContexts[i]] = true;
  }

  // Check for missing context definitions
  for (var i = 0; i < availableContexts.length; i++) {
    if (definedContexts.indexOf(availableContexts[i]) === -1) {
      warnings.push('Missing Context Definition: "' + availableContexts[i] + '"');
    }
  }

  // Check for defined contexts that are not available
  for (var i = 0; i < definedContexts.length; i++) {
    if (availableContexts.indexOf(definedContexts[i]) === -1) {
      warnings.push('Context Not Available: "' + definedContexts[i] + '"');
    }
  }

  // Check for invalid context owners (ownership field)
  for (var i = 0; i < CONTEXT_TYPES.length; i++) {
    var c = CONTEXT_TYPES[i];
    if (!c.ownership || c.ownership.trim() === '') {
      warnings.push('Invalid Context Owner: "' + c.id + '" has no owner');
    }
    if (!c.description || c.description.trim() === '') {
      warnings.push('Missing Context Description: "' + c.id + '"');
    }
  }

  // Check for duplicate ownership (warn if same owner has multiple contexts)
  var ownershipCount = {};
  for (var i = 0; i < CONTEXT_TYPES.length; i++) {
    var c = CONTEXT_TYPES[i];
    if (c.ownership) {
      ownershipCount[c.ownership] = (ownershipCount[c.ownership] || 0) + 1;
    }
  }
  for (var owner in ownershipCount) {
    if (ownershipCount[owner] > 2) {
      warnings.push('Multiple contexts owned by: "' + owner + '" (' + ownershipCount[owner] + ' contexts)');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContextValidator = {
    validateContexts: validateContexts,
    init: function() {
      console.log('✅ SystemContextValidator ready');
      var warnings = validateContexts();
      if (warnings.length > 0) {
        console.warn('⚠️ Context warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All contexts valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContextValidator = window.systemContextValidator;
  }
}
