/**
 * Runtime Metrics Health
 * Generates metrics health reports.
 * Developer only.
 */

import { METRICS } from './runtimeMetricsManifest.js';
import { getAllMetrics, getMetric, getMetricValue } from './runtimeMetricsCollector.js';
import { validateAllMetrics } from './runtimeMetricsValidator.js';

export function generateHealthReport() {
  var metrics = getAllMetrics();
  var totalMetrics = METRICS.length;
  var collectedMetrics = Object.keys(metrics).filter(function(key) {
    return metrics[key] && metrics[key].value !== 0;
  });
  var collectedCount = collectedMetrics.length;
  
  // Calculate coverage
  var coverage = totalMetrics > 0 ? Math.round((collectedCount / totalMetrics) * 100) : 0;
  
  // Check for missing metrics
  var missingMetrics = [];
  for (var i = 0; i < METRICS.length; i++) {
    var id = METRICS[i].id;
    if (collectedMetrics.indexOf(id) === -1) {
      missingMetrics.push(id);
    }
  }
  
  // Check metric values for health
  var warnings = 0;
  var errors = 0;
  var healthScore = 100;
  
  var runtimeHealth = getMetricValue('RUNTIME_HEALTH');
  if (runtimeHealth !== null && runtimeHealth < 60) {
    warnings++;
    healthScore -= 20;
  }
  
  var errorCount = getMetricValue('ERROR_COUNT');
  if (errorCount !== null && errorCount > 0) {
    errors += errorCount;
    healthScore -= Math.min(errorCount * 5, 30);
  }
  
  var warningCount = getMetricValue('WARNING_COUNT');
  if (warningCount !== null && warningCount > 0) {
    warnings += warningCount;
    healthScore -= Math.min(warningCount * 2, 20);
  }
  
  var bootTime = getMetricValue('BOOT_TIME');
  if (bootTime !== null && bootTime > 5000) {
    warnings++;
    healthScore -= 10;
  }
  
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Validation warnings
  var validationWarnings = validateAllMetrics();
  
  // Determine status
  var status = 'healthy';
  if (healthScore < 30) status = 'critical';
  else if (healthScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (errors > 0) status = 'warnings';
  else if (coverage < 50) status = 'needs_attention';
  
  return {
    totalMetrics: totalMetrics,
    collectedMetrics: collectedCount,
    coverage: coverage + '%',
    coverageScore: coverage,
    missingMetrics: missingMetrics,
    missingCount: missingMetrics.length,
    healthScore: healthScore,
    warnings: warnings,
    errors: errors,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('📈 Runtime Metrics Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Health Score:', report.healthScore + '%');
  console.log('Coverage:', report.coverage);
  console.log('Collected Metrics:', report.collectedMetrics + '/' + report.totalMetrics);
  console.log('Errors:', report.errors);
  console.log('Warnings:', report.warnings);
  if (report.missingCount > 0) {
    console.warn('⚠️ Missing Metrics:', report.missingMetrics.join(', '));
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeMetricsHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ RuntimeMetricsHealth ready (deferred report)');
      return this;
    },
    report: function() {
      var report = generateHealthReport();
      logHealthReport(report);
      return report;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeMetricsHealth = window.runtimeMetricsHealth;
  }
}
