/**
 * Boot Diagnostics
 * Collects boot information.
 * Developer only.
 */

import { getPipeline, getPipelineStatus, getStageResult } from './bootPipeline.js';
import { getStageRegistry } from './bootStageRegistry.js';

let _bootHistory = [];

export function collectDiagnostics() {
  var pipeline = getPipeline();
  var status = getPipelineStatus();
  var registry = getStageRegistry();

  var result = {
    timestamp: new Date().toISOString(),
    status: status.status,
    currentStage: status.currentStage,
    completedStages: status.completedStages,
    failedStage: status.failedStage,
    totalDuration: status.totalDuration || 0,
    totalStages: registry.length,
    completedCount: status.completedStages.length,
    failedCount: status.failedStage ? 1 : 0,
    warnings: [],
    stageDetails: pipeline.map(function(s) {
      var stageResult = getStageResult(s.name);
      return {
        name: s.name,
        status: s.status,
        duration: s.duration || 0,
        result: stageResult
      };
    })
  };

  // Collect warnings from stage results
  for (var i = 0; i < pipeline.length; i++) {
    var s = pipeline[i];
    if (s.result && s.result.warning) {
      result.warnings.push({
        stage: s.name,
        warning: s.result.warning
      });
    }
  }

  return result;
}

export function getBootHistory() {
  return _bootHistory.slice();
}

export function recordBootSnapshot() {
  var snapshot = collectDiagnostics();
  _bootHistory.push(snapshot);

  if (_bootHistory.length > 50) {
    _bootHistory = _bootHistory.slice(-50);
  }

  return snapshot;
}

export function getBootDuration() {
  var status = getPipelineStatus();
  return status.totalDuration || 0;
}

export function getBootStatus() {
  var status = getPipelineStatus();
  return {
    status: status.status,
    completed: status.completedStages.length,
    failed: status.failedStage ? 1 : 0,
    total: getStageRegistry().length,
    duration: status.totalDuration || 0
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootDiagnostics = {
    collectDiagnostics: collectDiagnostics,
    getBootHistory: getBootHistory,
    recordBootSnapshot: recordBootSnapshot,
    getBootDuration: getBootDuration,
    getBootStatus: getBootStatus,
    init: function() {
      console.log('🔍 Boot Diagnostics Ready');
      recordBootSnapshot();
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootDiagnostics = window.bootDiagnostics;
  }
}
