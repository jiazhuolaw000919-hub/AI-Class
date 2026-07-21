/**
 * Boot Health
 * Generates boot health reports.
 * Developer only.
 */

import { BOOT_PHASES } from './bootSequenceManifest.js';
import { validateBootSequence } from './bootValidator.js';
import { getOverallStatus } from './bootCoordinator.js';

export function generateHealthReport() {
  var phases = BOOT_PHASES;
  var activePhases = phases.filter(function(p) { return p.status === 'active'; });
  
  // Get current status from coordinator
  var status = getOverallStatus();
  
  // Validation warnings
  var validationWarnings = validateBootSequence();
  
  // Calculate stability score
  var total = status.total || 1;
  var completed = status.completed || 0;
  var failed = status.failed || 0;
  
  var stabilityScore = 100;
  if (total > 0) {
    stabilityScore = Math.round(((total - failed) / total) * 100);
  }
  
  // Coverage of active phases
  var coverage = total > 0 ? Math.round((activePhases.length / total) * 100) : 0;
  
  // Determine status
  var healthStatus = 'healthy';
  if (status.status === 'failed') healthStatus = 'failed';
  else if (stabilityScore < 60) healthStatus = 'critical';
  else if (stabilityScore < 80) healthStatus = 'needs_attention';
  else if (validationWarnings.length > 0) healthStatus = 'warnings';
  
  return {
    totalPhases: total,
    activePhases: activePhases.length,
    completedPhases: status.completed,
    failedPhases: status.failed,
    remainingPhases: status.remaining,
    currentPhase: status.currentPhase,
    bootStatus: status.status,
    stabilityScore: stabilityScore,
    coverage: coverage + '%',
    coverageScore: coverage,
    validationWarnings: validationWarnings.length,
    status: healthStatus,
    phaseDetails: status.phases,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🚀 Boot Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Boot Status:', report.bootStatus);
  console.log('Stability Score:', report.stabilityScore + '%');
  console.log('Coverage:', report.coverage);
  console.log('Phases:', report.completedPhases + '/' + report.totalPhases);
  if (report.failedPhases > 0) {
    console.warn('⚠️ Failed Phases:', report.failedPhases);
  }
  if (report.currentPhase) {
    console.log('Current Phase:', report.currentPhase);
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ BootHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootHealth = window.bootHealth;
  }
}
