/**
 * System Reflection Validator
 * Validates reflection data and comparisons.
 * Warnings only – never stops Boot.
 */

import { REFLECTION_CATEGORIES } from './systemReflectionManifest.js';
import { getSnapshots, analyzeTrends } from './systemReflectionAnalyzer.js';

export function validateReflection() {
  var warnings = [];
  var categories = REFLECTION_CATEGORIES.map(function(c) { return c.id; });
  var snapshots = getSnapshots();
  var trends = analyzeTrends();
  
  // Check for missing history (less than 2 snapshots)
  if (snapshots.length < 2) {
    warnings.push('Missing history: only ' + snapshots.length + ' snapshots available (need at least 2)');
  }
  
  // Check for unknown categories in trends
  if (trends && trends.trends) {
    var trendCategories = Object.keys(trends.trends);
    for (var i = 0; i < trendCategories.length; i++) {
      if (categories.indexOf(trendCategories[i]) === -1) {
        warnings.push('Unknown category in reflection: "' + trendCategories[i] + '"');
      }
    }
  }
  
  // Check for duplicate reflections (same timestamp)
  var timestamps = {};
  for (var i = 0; i < snapshots.length; i++) {
    var ts = snapshots[i].timestamp;
    if (timestamps[ts]) {
      warnings.push('Duplicate reflection timestamp: ' + ts);
    }
    timestamps[ts] = true;
  }
  
  // Check for invalid comparisons
  if (snapshots.length >= 2) {
    var first = snapshots[0];
    var last = snapshots[snapshots.length - 1];
    
    // Compare timestamps
    if (new Date(last.timestamp) < new Date(first.timestamp)) {
      warnings.push('Invalid comparison: snapshots out of chronological order');
    }
    
    // Check for missing required fields in snapshots
    var requiredFields = ['boot', 'runtime', 'health'];
    for (var i = 0; i < snapshots.length; i++) {
      var s = snapshots[i];
      for (var j = 0; j < requiredFields.length; j++) {
        if (!s[requiredFields[j]]) {
          warnings.push('Invalid comparison: snapshot missing "' + requiredFields[j] + '" data');
        }
      }
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemReflectionValidator = {
    validateReflection: validateReflection,
    init: function() {
      console.log('✅ SystemReflectionValidator ready');
      var warnings = validateReflection();
      if (warnings.length > 0) {
        console.warn('⚠️ Reflection warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All reflection data valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemReflectionValidator = window.systemReflectionValidator;
  }
}
