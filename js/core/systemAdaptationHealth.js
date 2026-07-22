/**
 * System Adaptation Health
 * Generates adaptation health reports.
 * Developer only.
 */

import { ADAPTATION_TYPES, ADAPTATION_SIGNALS } from './systemAdaptationManifest.js';
import { getRecommendations, getSignalCount } from './systemAdaptationCollector.js';
import { validateAdaptations } from './systemAdaptationValidator.js';

export function generateHealthReport() {
  var definedTypes = ADAPTATION_TYPES;
  var signals = ADAPTATION_SIGNALS;
  var recommendations = getRecommendations();
  var signalCount = getSignalCount();

  // Count active adaptations
  var active = definedTypes.filter(function(a) { return a.status === 'active'; });
  var healthy = active.filter(function(a) { return a.status === 'active'; });
  
  // Count blocked (if any adaptation has status 'blocked')
  var blocked = definedTypes.filter(function(a) { return a.status === 'blocked'; });
  var warning = definedTypes.filter(function(a) { return a.status === 'warning'; });

  // Count signals
  var totalSignals = signals.length;
  var activeSignals = 0;
  try {
    var collector = LawAIApp.SystemAdaptationCollector || window.systemAdaptationCollector;
    if (collector && typeof collector.getSignalCount === 'function') {
      activeSignals = collector.getSignalCount();
    }
  } catch (e) { /* ignore */ }

  // Calculate coverage
  var total = definedTypes.length;
  var covered = active.length;
  var coverage = total > 0 ? Math.round((covered / total) * 100) : 0;

  // Validation warnings
  var validationWarnings = validateAdaptations();

  // Determine status
  var status = 'healthy';
  if (blocked.length > 0) status = 'blocked';
  else if (warning.length > 0) status = 'warnings';
  else if (coverage < 50) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';

  return {
    totalAdaptations: total,
    activeAdaptations: active.length,
    healthyAdaptations: healthy.length,
    warningAdaptations: warning.length,
    blockedAdaptations: blocked.length,
    totalSignals: totalSignals,
    activeSignals: activeSignals,
    recommendations: recommendations.length,
    coverage: coverage + '%',
    coverageScore: coverage,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧬 System Adaptation Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Adaptations:', report.totalAdaptations);
  console.log('Active:', report.activeAdaptations);
  console.log('Healthy:', report.healthyAdaptations);
  console.log('Warnings:', report.warningAdaptations);
  if (report.blockedAdaptations > 0) {
    console.warn('🚫 Blocked:', report.blockedAdaptations);
  }
  console.log('Signals:', report.activeSignals + '/' + report.totalSignals);
  console.log('Recommendations:', report.recommendations);
  console.log('Coverage:', report.coverage);
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAdaptationHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemAdaptationHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAdaptationHealth = window.systemAdaptationHealth;
  }
}
