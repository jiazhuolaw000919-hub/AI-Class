/**
 * System Continuity Tracker
 * Tracks architecture milestones and version progression.
 * No modification – observation only.
 */

import { CONTINUITY_RECORDS } from './systemContinuityManifest.js';

// Store additional tracking data
var _trackingHistory = [];

export function trackMilestones() {
  var milestones = CONTINUITY_RECORDS.milestones;
  var completed = milestones.filter(function(m) { return m.completed; });
  var pending = milestones.filter(function(m) { return !m.completed; });

  return {
    total: milestones.length,
    completed: completed.length,
    pending: pending.length,
    completionRate: milestones.length > 0 ? Math.round((completed.length / milestones.length) * 100) : 0,
    completedList: completed,
    pendingList: pending
  };
}

export function trackVersionProgression() {
  var versions = CONTINUITY_RECORDS.versionHistory;
  var progression = [];
  var majorVersions = 0;
  var minorVersions = 0;
  var patchVersions = 0;

  for (var i = 0; i < versions.length; i++) {
    var v = versions[i];
    var parts = v.version.replace('V', '').split('.');
    if (parts.length === 3) {
      if (parseInt(parts[0]) > 0) majorVersions++;
      if (parseInt(parts[1]) > 0) minorVersions++;
      if (parseInt(parts[2]) > 0) patchVersions++;
    }
    progression.push({
      version: v.version,
      date: v.date,
      description: v.description,
      index: i + 1
    });
  }

  return {
    totalVersions: versions.length,
    majorVersions: majorVersions,
    minorVersions: minorVersions,
    patchVersions: patchVersions,
    progression: progression,
    latestVersion: versions[versions.length - 1] || null,
    earliestVersion: versions[0] || null
  };
}

export function trackMajorChanges() {
  var versions = CONTINUITY_RECORDS.versionHistory;
  var majorChanges = [];

  for (var i = 0; i < versions.length - 1; i++) {
    var current = versions[i];
    var next = versions[i + 1];
    var currentParts = current.version.replace('V', '').split('.');
    var nextParts = next.version.replace('V', '').split('.');

    if (currentParts[0] !== nextParts[0]) {
      majorChanges.push({
        from: current.version,
        to: next.version,
        description: next.description,
        date: next.date
      });
    }
  }

  return majorChanges;
}

export function trackSystemIdentity() {
  return {
    systemName: CONTINUITY_RECORDS.systemName,
    architectureEra: CONTINUITY_RECORDS.architectureEra,
    currentVersion: CONTINUITY_RECORDS.currentVersion,
    intelligenceGeneration: CONTINUITY_RECORDS.intelligenceGeneration,
    recoveryStage: CONTINUITY_RECORDS.recoveryStage
  };
}

export function getTrackingHistory() {
  return _trackingHistory.slice();
}

export function recordTrackingSnapshot() {
  var snapshot = {
    timestamp: new Date().toISOString(),
    version: CONTINUITY_RECORDS.currentVersion,
    milestones: trackMilestones(),
    identity: trackSystemIdentity()
  };
  
  _trackingHistory.push(snapshot);
  
  if (_trackingHistory.length > 50) {
    _trackingHistory = _trackingHistory.slice(-50);
  }
  
  return snapshot;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContinuityTracker = {
    trackMilestones: trackMilestones,
    trackVersionProgression: trackVersionProgression,
    trackMajorChanges: trackMajorChanges,
    trackSystemIdentity: trackSystemIdentity,
    getTrackingHistory: getTrackingHistory,
    recordTrackingSnapshot: recordTrackingSnapshot,
    init: function() {
      console.log('✅ SystemContinuityTracker ready');
      recordTrackingSnapshot();
      var identity = trackSystemIdentity();
      console.log('📜 System Identity:', identity.systemName, identity.currentVersion);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContinuityTracker = window.systemContinuityTracker;
  }
}
