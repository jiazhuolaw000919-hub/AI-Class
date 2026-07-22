/**
 * System Maturity Analyzer
 * Analyzes architecture, runtime, governance, intelligence, and consistency scores.
 * Observation only.
 */

import { MATURITY_CRITERIA, MATURITY_MILESTONES } from './systemMaturityManifest.js';

export function analyzeMaturity() {
  var result = {
    timestamp: new Date().toISOString(),
    architecture: { score: 0, status: 'unknown' },
    runtime: { score: 0, status: 'unknown' },
    governance: { score: 0, status: 'unknown' },
    intelligence: { score: 0, status: 'unknown' },
    consistency: { score: 0, status: 'unknown' },
    overallScore: 0,
    currentStage: 'foundation',
    completedMilestones: 0,
    totalMilestones: 0
  };

  // Analyze Architecture
  try {
    var archGuard = LawAIApp.ArchitectureGuard || window.architectureGuard;
    if (archGuard) {
      var compliant = typeof archGuard.isCompliant === 'function' ? archGuard.isCompliant() : true;
      result.architecture.score = compliant ? 85 : 60;
      result.architecture.status = compliant ? 'stable' : 'needs_attention';
    }

    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (archValidator) {
      var warnings = archValidator.warnings || [];
      var violations = archValidator.violations || [];
      if (warnings.length === 0 && violations.length === 0) {
        result.architecture.score = Math.max(result.architecture.score, 90);
        result.architecture.status = 'stable';
      } else {
        result.architecture.score = Math.max(50, 85 - (warnings.length + violations.length) * 2);
        result.architecture.status = 'warnings';
      }
    }
  } catch (e) { /* ignore */ }

  // Analyze Runtime
  try {
    var runtimeHealth = LawAIApp.RuntimeHealth || window.runtimeHealth;
    if (runtimeHealth && typeof runtimeHealth.getHealth === 'function') {
      var data = runtimeHealth.getHealth();
      result.runtime.score = data.healthScore || 70;
      result.runtime.status = data.status || 'unknown';
    }

    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
      var status = runtimeStatus.getStatus();
      if (status === 'ready' || status === 'running') {
        result.runtime.score = Math.max(result.runtime.score, 90);
        result.runtime.status = 'ready';
      }
    }
  } catch (e) { /* ignore */ }

  // Analyze Governance
  try {
    var govHealth = LawAIApp.GovernanceHealth || window.governanceHealth;
    if (govHealth && typeof govHealth.getHealth === 'function') {
      var data = govHealth.getHealth();
      result.governance.score = data.governanceScore || 70;
      result.governance.status = data.status || 'unknown';
    }

    var engineHealth = LawAIApp.EngineHealth || window.engineHealth;
    if (engineHealth && typeof engineHealth.getHealth === 'function') {
      var data = engineHealth.getHealth();
      result.governance.score = Math.min(100, (result.governance.score + (data.healthScore || 0)) / 2);
    }
  } catch (e) { /* ignore */ }

  // Analyze Intelligence
  try {
    var intelligenceHealth = LawAIApp.SystemIntelligenceHealth || window.systemIntelligenceHealth;
    if (intelligenceHealth && typeof intelligenceHealth.getHealth === 'function') {
      var data = intelligenceHealth.getHealth();
      result.intelligence.score = data.confidenceScore || 70;
      result.intelligence.status = data.status || 'unknown';
    }

    var awarenessHealth = LawAIApp.SystemAwarenessHealth || window.systemAwarenessHealth;
    if (awarenessHealth && typeof awarenessHealth.getHealth === 'function') {
      var data = awarenessHealth.getHealth();
      result.intelligence.score = Math.min(100, (result.intelligence.score + (data.coverageScore || 0)) / 2);
    }
  } catch (e) { /* ignore */ }

  // Analyze Consistency
  try {
    var coherenceHealth = LawAIApp.SystemCoherenceHealth || window.systemCoherenceHealth;
    if (coherenceHealth && typeof coherenceHealth.getHealth === 'function') {
      var data = coherenceHealth.getHealth();
      result.consistency.score = data.consistencyScore || 70;
      result.consistency.status = data.status || 'unknown';
    }
  } catch (e) { /* ignore */ }

  // Calculate overall score (weighted)
  var weights = {
    architecture: 0.25,
    runtime: 0.20,
    governance: 0.25,
    intelligence: 0.20,
    consistency: 0.10
  };

  result.overallScore = Math.round(
    (result.architecture.score || 0) * weights.architecture +
    (result.runtime.score || 0) * weights.runtime +
    (result.governance.score || 0) * weights.governance +
    (result.intelligence.score || 0) * weights.intelligence +
    (result.consistency.score || 0) * weights.consistency
  );

  // Determine current stage
  var milestones = MATURITY_MILESTONES;
  var completed = milestones.filter(function(m) { return m.completed; });
  result.completedMilestones = completed.length;
  result.totalMilestones = milestones.length;

  if (result.overallScore >= 90) result.currentStage = 'mature';
  else if (result.overallScore >= 75) result.currentStage = 'adaptive';
  else if (result.overallScore >= 60) result.currentStage = 'intelligent';
  else if (result.overallScore >= 45) result.currentStage = 'governed';
  else if (result.overallScore >= 30) result.currentStage = 'structured';
  else result.currentStage = 'foundation';

  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMaturityAnalyzer = {
    analyzeMaturity: analyzeMaturity,
    init: function() {
      console.log('✅ SystemMaturityAnalyzer ready');
      var analysis = analyzeMaturity();
      console.log('🌱 Maturity Analysis:', analysis.currentStage, '(' + analysis.overallScore + '%)');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMaturityAnalyzer = window.systemMaturityAnalyzer;
  }
}
