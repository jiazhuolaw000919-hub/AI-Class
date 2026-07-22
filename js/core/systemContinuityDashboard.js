/**
 * System Continuity Dashboard
 * Provides presentation data for Developer Panel.
 * Read only.
 */

import { CONTINUITY_RECORDS } from './systemContinuityManifest.js';
import { trackMilestones, trackVersionProgression, trackSystemIdentity } from './systemContinuityTracker.js';
import { generateHealthReport } from './systemContinuityHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var identity = trackSystemIdentity();
  var milestoneData = trackMilestones();

  return {
    status: health.status,
    continuityScore: health.continuityScore,
    currentVersion: health.currentVersion,
    architectureEra: health.architectureEra,
    totalVersions: health.totalVersions,
    milestones: milestoneData.completed + '/' + milestoneData.total,
    completionRate: health.completionRate,
    recoveryStage: health.recoveryStage,
    timestamp: new Date().toISOString()
  };
}

export function getContinuityHealth() {
  var health = generateHealthReport();
  return {
    status: health.status,
    continuityScore: health.continuityScore,
    completionRate: health.completionRate,
    completionScore: health.completionScore,
    totalVersions: health.totalVersions,
    totalMilestones: health.totalMilestones,
    completedMilestones: health.completedMilestones,
    majorVersions: health.majorVersions
  };
}

export function getMilestoneHistory() {
  var milestones = CONTINUITY_RECORDS.milestones;
  return milestones.map(function(m) {
    return {
      id: m.id,
      name: m.name,
      version: m.version,
      completed: m.completed,
      status: m.completed ? '✅ Complete' : '⏳ Pending'
    };
  });
}

export function getVersionTimeline() {
  var versionData = trackVersionProgression();
  return versionData.progression.map(function(v) {
    return {
      version: v.version,
      date: v.date,
      description: v.description,
      index: v.index
    };
  });
}

export function getContinuitySummary() {
  var health = generateHealthReport();
  var identity = trackSystemIdentity();
  var milestoneData = trackMilestones();

  return {
    overallStatus: health.status,
    continuityScore: health.continuityScore,
    currentVersion: health.currentVersion,
    architectureEra: health.architectureEra,
    recoveryStage: health.recoveryStage,
    totalVersions: health.totalVersions,
    milestones: milestoneData.completed + '/' + milestoneData.total,
    completionRate: health.completionRate,
    validationWarnings: health.validationWarnings,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContinuityDashboard = {
    getOverview: getOverview,
    getContinuityHealth: getContinuityHealth,
    getMilestoneHistory: getMilestoneHistory,
    getVersionTimeline: getVersionTimeline,
    getContinuitySummary: getContinuitySummary,
    init: function() {
      console.log('✅ SystemContinuityDashboard ready');
      var summary = getContinuitySummary();
      console.log('📜 Continuity Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContinuityDashboard = window.systemContinuityDashboard;
  }
}
