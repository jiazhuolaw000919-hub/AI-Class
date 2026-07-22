/**
 * System Evolution Dashboard
 * Generates evolution timeline and dashboard data.
 * Developer only.
 */

import { EVOLUTION_MANIFEST } from './systemEvolutionManifest.js';
import { analyzeGrowthTrends } from './systemEvolutionAnalyzer.js';
import { generateHealthReport } from './systemEvolutionHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var trends = analyzeGrowthTrends();
  
  return {
    status: health.status,
    architectureVersion: EVOLUTION_MANIFEST.architectureVersion,
    recoveryVersion: EVOLUTION_MANIFEST.recoveryVersion,
    recoveryStage: EVOLUTION_MANIFEST.recoveryStage,
    governanceStage: EVOLUTION_MANIFEST.governanceStage,
    evolutionScore: health.evolutionScore,
    stability: health.architectureStability,
    compatibility: health.compatibility,
    growth: health.growthScore,
    timestamp: new Date().toISOString()
  };
}

export function getTimeline() {
  return EVOLUTION_MANIFEST.timeline.map(function(entry) {
    return {
      date: entry.date,
      event: entry.event,
      version: entry.version
    };
  });
}

export function getRecoveryTimeline() {
  var milestones = EVOLUTION_MANIFEST.milestones;
  return milestones.map(function(m) {
    return {
      id: m.id,
      name: m.name,
      completed: m.completed,
      version: m.version
    };
  });
}

export function getGovernanceTimeline() {
  var milestones = EVOLUTION_MANIFEST.milestones;
  var governanceMilestones = milestones.filter(function(m) {
    return m.id.startsWith('M') && parseInt(m.id.substring(1)) >= 8;
  });
  
  return governanceMilestones.map(function(m) {
    return {
      id: m.id,
      name: m.name,
      completed: m.completed,
      version: m.version
    };
  });
}

export function getMilestones() {
  return EVOLUTION_MANIFEST.milestones;
}

export function getCurrentStage() {
  var health = generateHealthReport();
  var completed = EVOLUTION_MANIFEST.milestones.filter(function(m) { return m.completed; });
  var pending = EVOLUTION_MANIFEST.milestones.filter(function(m) { return !m.completed; });
  
  return {
    stage: EVOLUTION_MANIFEST.governanceStage,
    recoveryStage: EVOLUTION_MANIFEST.recoveryStage,
    completionRate: health.recoveryProgress,
    completedMilestones: completed.length,
    pendingMilestones: pending.length
  };
}

export function getNextStage() {
  var pending = EVOLUTION_MANIFEST.milestones.filter(function(m) { return !m.completed; });
  
  if (pending.length > 0) {
    return {
      next: pending[0].name,
      version: pending[0].version,
      id: pending[0].id
    };
  }
  
  return {
    next: 'All milestones completed',
    version: EVOLUTION_MANIFEST.architectureVersion,
    id: 'Complete'
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemEvolutionDashboard = {
    getOverview: getOverview,
    getTimeline: getTimeline,
    getRecoveryTimeline: getRecoveryTimeline,
    getGovernanceTimeline: getGovernanceTimeline,
    getMilestones: getMilestones,
    getCurrentStage: getCurrentStage,
    getNextStage: getNextStage,
    init: function() {
      console.log('✅ SystemEvolutionDashboard ready');
      var overview = getOverview();
      console.log('📊 Evolution Overview:', overview);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemEvolutionDashboard = window.systemEvolutionDashboard;
  }
}
