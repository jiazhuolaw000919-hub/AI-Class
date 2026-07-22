/**
 * System Decision Validator
 * Validates decisions and rules.
 * Warnings only – never stops Boot.
 */

import { DECISION_CATEGORIES, DECISION_RULES, DECISION_TYPES } from './systemDecisionManifest.js';
import { getDecisions } from './systemDecisionEngine.js';

export function validateDecisions() {
  var warnings = [];
  var categories = DECISION_CATEGORIES.map(function(c) { return c.id; });
  var decisionTypes = DECISION_TYPES;
  var decisions = getDecisions();
  
  // Check for unknown decision types
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    if (d.decision && decisionTypes.indexOf(d.decision) === -1) {
      warnings.push('Unknown decision type: "' + d.decision + '"');
    }
  }
  
  // Check for duplicate decisions (same ruleId and timestamp)
  var seen = {};
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    var key = d.ruleId + '-' + d.timestamp;
    if (seen[key]) {
      warnings.push('Duplicate decision for rule: "' + d.ruleId + '"');
    }
    seen[key] = true;
  }
  
  // Check for invalid rules
  var ruleIds = DECISION_RULES.map(function(r) { return r.id; });
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    if (d.ruleId && ruleIds.indexOf(d.ruleId) === -1) {
      warnings.push('Invalid rule: "' + d.ruleId + '"');
    }
  }
  
  // Check for conflicting recommendations (same category, different severity)
  var categoryDecisions = {};
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    if (!categoryDecisions[d.category]) {
      categoryDecisions[d.category] = [];
    }
    categoryDecisions[d.category].push(d);
  }
  
  for (var category in categoryDecisions) {
    if (categoryDecisions.hasOwnProperty(category)) {
      var items = categoryDecisions[category];
      var severities = items.map(function(d) { return d.severity; });
      if (severities.indexOf('error') !== -1 && severities.indexOf('warning') !== -1) {
        warnings.push('Conflicting recommendations in category: "' + category + '"');
      }
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemDecisionValidator = {
    validateDecisions: validateDecisions,
    init: function() {
      console.log('✅ SystemDecisionValidator ready');
      var warnings = validateDecisions();
      if (warnings.length > 0) {
        console.warn('⚠️ Decision warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All decisions valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemDecisionValidator = window.systemDecisionValidator;
  }
}
