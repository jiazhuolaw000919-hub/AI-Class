/**
 * System Maturity Dashboard
 * Provides presentation data for Developer Panel.
 * Read only.
 */

import { MATURITY_STAGES } from './systemMaturityManifest.js';
import { analyzeMaturity } from './systemMaturityAnalyzer.js';
import { generateHealthReport } from './systemMaturityHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var analysis = analyzeMaturity();

  return {
    status: health.status,
    currentStage: health.currentStage,
    nextStage: health.nextStage,
    overallScore: health.overallScore,
    architectureScore: health.architectureScore,
    runtimeScore: health.runtimeScore,
    governanceScore: health.governanceScore,
    intelligenceScore: health.intelligenceScore,
    consistencyScore: health.consistencyScore,
    progress: health.progress,
    timestamp: new Date().toISOString()
  };
}

export function getMaturityHealth() {
  var health = generateHealthReport();
  return {
    status: health.status,
    currentStage: health.currentStage,
    overallScore: health.overallScore,
    progress: health.progress,
    missingAreas: health.missingAreas,
    validationWarnings: health.validationWarnings
  };
}

export function getStageProgress() {
  var health = generateHealthReport();
  var stages = MATURITY_STAGES;

  return stages.map(function(s) {
    var isCurrent = s.id === health.currentStage;
    var isCompleted = s.order < health.currentStageIndex;
    var isUpcoming = s.order > health.currentStageIndex;

    return {
      id: s.id,
      name: s.name,
      order: s.order,
      status: isCompleted ? 'completed' : (isCurrent ? 'current' : 'upcoming'),
      isCurrent: isCurrent,
      isCompleted: isCompleted,
      isUpcoming: isUpcoming
    };
  });
}

export function getMaturitySummary() {
  var health = generateHealthReport();
  var analysis = analyzeMaturity();

  return {
    overallStatus: health.status,
    currentStage: health.currentStage,
    nextStage: health.nextStage,
    overallScore: health.overallScore,
    progress: health.progress,
    architectureScore: health.architectureScore,
    runtimeScore: health.runtimeScore,
    governanceScore: health.governanceScore,
    intelligenceScore: health.intelligenceScore,
    consistencyScore: health.consistencyScore,
    completedMilestones: health.completedMilestones,
    totalMilestones: health.totalMilestones,
    missingAreas: health.missingAreas,
    validationWarnings: health.validationWarnings,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMaturityDashboard = {
    getOverview: getOverview,
    getMaturityHealth: getMaturityHealth,
    getStageProgress: getStageProgress,
    getMaturitySummary: getMaturitySummary,
    init: function() {
      console.log('✅ SystemMaturityDashboard ready');
      var summary = getMaturitySummary();
      console.log('🌱 Maturity Summary:', summary.currentStage, '(' + summary.overallScore + '%)');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMaturityDashboard = window.systemMaturityDashboard;
  }
}
