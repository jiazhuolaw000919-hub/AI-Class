/**
 * Engine State Validator
 * Validates engine states and transitions.
 * Warnings only – never modifies engines.
 */

import { ENGINE_STATES, getTransitions, isValidTransition } from './engineStateManifest.js';

export function validateState(stateId) {
  var warnings = [];
  
  // Unknown state
  var state = ENGINE_STATES.find(function(s) { return s.id === stateId; });
  if (!state) {
    warnings.push('Unknown State: "' + stateId + '"');
    return warnings;
  }
  
  // Reserved state (check if it starts with underscore or is reserved)
  if (stateId.startsWith('_') || stateId.startsWith('INTERNAL_')) {
    warnings.push('Reserved State: "' + stateId + '"');
  }
  
  return warnings;
}

export function validateTransition(fromState, toState) {
  var warnings = [];
  
  // Check if both states exist
  var from = ENGINE_STATES.find(function(s) { return s.id === fromState; });
  var to = ENGINE_STATES.find(function(s) { return s.id === toState; });
  
  if (!from) {
    warnings.push('Unknown from state: "' + fromState + '"');
  }
  if (!to) {
    warnings.push('Unknown to state: "' + toState + '"');
  }
  
  if (!from || !to) {
    return warnings;
  }
  
  // Check if transition is valid
  if (!isValidTransition(fromState, toState)) {
    warnings.push('Illegal Transition: "' + fromState + '" → "' + toState + '"');
  }
  
  // Check for duplicate states (if same state appears twice)
  var allStates = ENGINE_STATES.map(function(s) { return s.id; });
  var seen = {};
  for (var i = 0; i < allStates.length; i++) {
    if (seen[allStates[i]]) {
      warnings.push('Duplicate State: "' + allStates[i] + '"');
    }
    seen[allStates[i]] = true;
  }
  
  return warnings;
}

export function validateAllTransitions() {
  var warnings = [];
  var stateIds = ENGINE_STATES.map(function(s) { return s.id; });
  
  for (var i = 0; i < stateIds.length; i++) {
    var fromState = stateIds[i];
    var transitions = getTransitions(fromState);
    
    for (var j = 0; j < transitions.to.length; j++) {
      var toState = transitions.to[j];
      var w = validateTransition(fromState, toState);
      warnings = warnings.concat(w);
    }
  }
  
  // Remove duplicates
  var uniqueWarnings = [];
  var seen = {};
  for (var i = 0; i < warnings.length; i++) {
    if (!seen[warnings[i]]) {
      uniqueWarnings.push(warnings[i]);
      seen[warnings[i]] = true;
    }
  }
  
  return uniqueWarnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineStateValidator = {
    validateState: validateState,
    validateTransition: validateTransition,
    validateAllTransitions: validateAllTransitions,
    init: function() {
      console.log('✅ EngineStateValidator ready');
      var warnings = validateAllTransitions();
      if (warnings.length > 0) {
        console.warn('⚠️ State warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All states and transitions valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineStateValidator = window.engineStateValidator;
  }
}
