/**
 * System Maturity Health
 * Generates maturity health reports.
 * Developer only.
 */

import { MATURITY_STAGES, MATURITY_MILESTONES } from './systemMaturityManifest.js';
import { analyzeMaturity } from './systemMaturityAnalyzer.js';
import { validateMaturity } from './systemMaturityValidator.js';

export function generateHealthReport() {
  var stages = MATURITY_STAGES;
  var milestones = MATURITY_MILESTONES;
  var analysis = analyzeMaturity();

  var completedMilestones = milestones.filter(function(m) { return m.completed; });
  var totalMilestones = milestones.length;
  var progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;

  // Calculate stage index
  var currentStageIndex = 0;
  for (var i = 0; i < stages.length; i++) {
    if (stages[i].id === analysis.currentStage) {
      currentStageIndex = i;
      break;
    }
  }

  // Find next stage
  var nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  // Calculate missing areas
  var missingAreas = [];
  var criteria = ['architecture', 'runtime', 'governance', 'intelligence', 'consistency'];
  for (var i = 0; i < criteria.length; i++) {
    var c = criteria[i];
    if (analysis[c] && analysis[c].score < 60) {
      missingAreas.push(c);
    }
  }

  // Validation warnings
  var validationWarnings = validateMaturity();

  // Determine status
  var status = 'healthy';
  if (analysis.overallScore < 30) status = 'critical';
  else if (analysis.overallScore < 50) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (missingAreas.length > 0) status = 'warnings';

  return {
    currentStage: analysis.currentStage,
    currentStageIndex: currentStageIndex,
    nextStage: nextStage ? nextStage.name : 'Complete',
    overallScore: analysis.overallScore,
    architectureScore: analysis.architecture.score,
    runtimeScore: analysis.runtime.score,
    governanceScore: analysis.governance.score,
    intelligenceScore: analysis.intelligence.score,
    consistencyScore: analysis.consistency.score,
    progress: progress + '%',
    progressScore: progress,
    completedMilestones: completedMilestones.length,
    totalMilestones: totalMilestones,
    missingAreas: missingAreas,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🌱 System Maturity Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Current Stage:', report.currentStage.toUpperCase());
  console.log('Next Stage:', report.nextStage);
  console.log('Overall Score:', report.overallScore + '%');
  console.log('Architecture:', report.architectureScore + '%');
  console.log('Runtime:', report.runtimeScore + '%');
  console.log('Governance:', report.governanceScore + '%');
  console.log('Intelligence:', report.intelligenceScore + '%');
  console.log('Consistency:', report.consistencyScore + '%');
  console.log('Progress:', report.progress);
  console.log('Milestones:', report.completedMilestones + '/' + report.totalMilestones);
  if (report.missingAreas.length > 0) {
    console.warn('⚠️ Missing Areas:', report.missingAreas.join(', '));
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMaturityHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemMaturityHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMaturityHealth = window.systemMaturityHealth;
  }
}
