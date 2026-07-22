/**
 * Runtime Metrics Validator
 * Validates metric values and format.
 * Warnings only – never stops Boot.
 */

import { METRICS } from './runtimeMetricsManifest.js';
import { getAllMetrics } from './runtimeMetricsCollector.js';

export function validateMetric(id, value) {
  var warnings = [];
  
  // Check for unknown metric
  var metric = METRICS.find(function(m) { return m.id === id; });
  if (!metric) {
    warnings.push('Unknown metric: "' + id + '"');
    return warnings;
  }
  
  // Check for negative durations (if unit is ms)
  if (metric.unit === 'ms' && value < 0) {
    warnings.push('Negative duration: "' + id + '" = ' + value + 'ms');
  }
  
  // Check for invalid percentage values
  if (metric.unit === 'percent' && (value < 0 || value > 100)) {
    warnings.push('Invalid percentage: "' + id + '" = ' + value + '%');
  }
  
  // Check for negative counts
  if (metric.unit === 'count' && value < 0) {
    warnings.push('Negative count: "' + id + '" = ' + value);
  }
  
  return warnings;
}

export function validateAllMetrics() {
  var metrics = getAllMetrics();
  var allWarnings = [];
  
  for (var id in metrics) {
    if (metrics.hasOwnProperty(id)) {
      var value = metrics[id].value;
      var warnings = validateMetric(id, value);
      if (warnings.length > 0) {
        allWarnings.push({
          metric: id,
          warnings: warnings
        });
      }
    }
  }
  
  // Check for duplicate metrics (same ID in different categories)
  var seen = {};
  for (var i = 0; i < METRICS.length; i++) {
    var id = METRICS[i].id;
    if (seen[id]) {
      allWarnings.push({
        metric: id,
        warnings: ['Duplicate metric definition: "' + id + '"']
      });
    }
    seen[id] = true;
  }
  
  return allWarnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeMetricsValidator = {
    validateMetric: validateMetric,
    validateAllMetrics: validateAllMetrics,
    init: function() {
      console.log('✅ RuntimeMetricsValidator ready');
      var warnings = validateAllMetrics();
      if (warnings.length > 0) {
        console.warn('⚠️ Metrics warnings:', warnings.length);
      } else {
        console.log('✅ All metrics valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeMetricsValidator = window.runtimeMetricsValidator;
  }
}
