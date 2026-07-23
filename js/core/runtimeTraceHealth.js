/**
 * Runtime Trace Health
 * Generates trace health reports.
 * Developer only.
 */

import { TRACE_TYPES } from './runtimeTraceManifest.js';
import { getTraces, getActiveTraces, getTraceCount } from './runtimeTraceCollector.js';
import { validateAllTraces } from './runtimeTraceValidator.js';

export function generateHealthReport() {
  var traces = getTraces();
  var activeTraces = getActiveTraces();
  var totalTraces = getTraceCount();
  
  // Count by status
  var statusCounts = {};
  var typeCounts = {};
  
  for (var i = 0; i < traces.length; i++) {
    var t = traces[i];
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    if (t.type) {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    }
  }
  
  var completed = statusCounts['COMPLETED'] || 0;
  var failed = statusCounts['FAILED'] || 0;
  var started = statusCounts['STARTED'] || 0;
  var running = statusCounts['RUNNING'] || 0;
  
  // Count orphan traces (parent not found)
  var orphans = 0;
  var traceIds = traces.map(function(t) { return t.traceId; });
  for (var i = 0; i < traces.length; i++) {
    var t = traces[i];
    if (t.parentTraceId && traceIds.indexOf(t.parentTraceId) === -1) {
      orphans++;
    }
  }
  
  // Calculate coverage
  var totalTypes = TRACE_TYPES.length;
  var observedTypes = Object.keys(typeCounts).length;
  var coverage = totalTypes > 0 ? Math.round((observedTypes / totalTypes) * 100) : 0;
  
  // Calculate health score
  var healthScore = 100;
  if (failed > 0) healthScore -= Math.min(failed * 5, 30);
  if (orphans > 0) healthScore -= Math.min(orphans * 3, 20);
  if (coverage < 50) healthScore -= 20;
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Validation warnings
  var validationWarnings = validateAllTraces();
  
  // Determine status
  var status = 'healthy';
  if (healthScore < 30) status = 'critical';
  else if (healthScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (failed > 0) status = 'warnings';
  
  return {
    totalTraces: totalTraces,
    activeTraces: activeTraces.length,
    completedTraces: completed,
    failedTraces: failed,
    startedTraces: started,
    runningTraces: running,
    orphanTraces: orphans,
    observedTypes: observedTypes,
    totalTypes: totalTypes,
    coverage: coverage + '%',
    coverageScore: coverage,
    healthScore: healthScore,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🛰 Runtime Trace Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Health Score:', report.healthScore + '%');
  console.log('Total Traces:', report.totalTraces);
  console.log('Active Traces:', report.activeTraces);
  console.log('Completed:', report.completedTraces);
  console.log('Failed:', report.failedTraces);
  console.log('Coverage:', report.coverage);
  if (report.orphanTraces > 0) {
    console.warn('⚠️ Orphan Traces:', report.orphanTraces);
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeTraceHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ RuntimeTraceHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeTraceHealth = window.runtimeTraceHealth;
  }
}
