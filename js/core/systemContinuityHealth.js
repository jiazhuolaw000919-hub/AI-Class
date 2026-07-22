/**
 * System Continuity Health
 * Generates continuity health reports.
 * Developer only.
 */

import { CONTINUITY_RECORDS } from './systemContinuityManifest.js';
import { trackMilestones, trackVersionProgression } from './systemContinuityTracker.js';
import { validateContinuity } from './systemContinuityValidator.js';

export function generateHealthReport() {
  var milestones = CONTINUITY_RECORDS.milestones;
  var versionHistory = CONTINUITY_RECORDS.versionHistory;

  var milestoneData = trackMilestones();
  var versionData = trackVersionProgression();

  var totalMilestones = milestoneData.total;
  var completedMilestones = milestoneData.completed;
  var completionRate = milestoneData.completionRate;

  var totalVersions = versionData.totalVersions;

  // Calculate continuity score
  var continuityScore = 100;
  
  // Penalty for incomplete milestones
  var pendingPenalty = (totalMilestones - completedMilestones) * 5;
  continuityScore -= pendingPenalty;

  // Penalty for gaps in version history
  var expectedVersions = 17; // Based on current manifest
  var versionGap = Math.max(0, expectedVersions - totalVersions);
  continuityScore -= versionGap * 2;

  // Penalty for major version inconsistencies
  var majorChanges = versionData.majorVersions;
  if (majorChanges < 3) {
    continuityScore -= 10;
  }

  continuityScore = Math.max(0, Math.min(100, continuityScore));

  // Validation warnings
  var validationWarnings = validateContinuity();

  // Determine status
  var status = 'healthy';
  if (completionRate < 50) status = 'critical';
  else if (completionRate < 70) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (continuityScore < 50) status = 'warnings';

  return {
    totalVersions: totalVersions,
    totalMilestones: totalMilestones,
    completedMilestones: completedMilestones,
    completionRate: completionRate + '%',
    completionScore: completionRate,
    continuityScore: continuityScore,
    currentVersion: CONTINUITY_RECORDS.currentVersion,
    architectureEra: CONTINUITY_RECORDS.architectureEra,
    recoveryStage: CONTINUITY_RECORDS.recoveryStage,
    majorVersions: versionData.majorVersions,
    minorVersions: versionData.minorVersions,
    patchVersions: versionData.patchVersions,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('📜 System Continuity Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Current Version:', report.currentVersion);
  console.log('Architecture Era:', report.architectureEra);
  console.log('Recovery Stage:', report.recoveryStage);
  console.log('Continuity Score:', report.continuityScore + '%');
  console.log('Completion Rate:', report.completionRate);
  console.log('Versions:', report.totalVersions + ' (' + report.majorVersions + ' major)');
  console.log('Milestones:', report.completedMilestones + '/' + report.totalMilestones);
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContinuityHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemContinuityHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContinuityHealth = window.systemContinuityHealth;
  }
}
