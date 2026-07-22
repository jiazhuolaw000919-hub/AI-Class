/**
 * System Evolution Health
 * Generates evolution health reports.
 * Developer only.
 */

import { EVOLUTION_MANIFEST } from './systemEvolutionManifest.js';
import { analyzeArchitectureGrowth, analyzeGovernanceGrowth, analyzeModuleGrowth } from './systemEvolutionAnalyzer.js';
import { validateEvolution } from './systemEvolutionValidator.js';

export function generateHealthReport() {
  var archGrowth = analyzeArchitectureGrowth();
  var govGrowth = analyzeGovernanceGrowth();
  var moduleGrowth = analyzeModuleGrowth();
  
  // Evolution Score (combination of completion rate + growth)
  var completionScore = govGrowth.completionRate || 0;
  var growthScore = Math.min(archGrowth.uniqueVersions * 10, 100);
  var evolutionScore = Math.round((completionScore * 0.6) + (growthScore * 0.4));
  
  // Architecture Stability
  var totalVersions = archGrowth.uniqueVersions || 1;
  var majorVersions = 0;
  for (var i = 0; i < archGrowth.versionProgression.length; i++) {
    var v = archGrowth.versionProgression[i];
    if (v.version && v.version.indexOf('.') !== -1) {
      var major = v.version.split('.')[0];
      if (parseInt(major) > 0) {
        majorVersions++;
      }
    }
  }
  var stability = totalVersions > 0 ? Math.round((1 - (majorVersions / totalVersions)) * 100) : 100;
  
  // Compatibility (based on validation warnings)
  var validationWarnings = validateEvolution();
  var compatibility = Math.max(0, 100 - (validationWarnings.length * 10));
  
  // Expansion Readiness
  var readiness = 100;
  if (moduleGrowth.totalEngines === 0) readiness -= 30;
  if (moduleGrowth.totalModules === 0) readiness -= 30;
  readiness = Math.max(0, readiness);
  
  // Recovery Progress
  var recoveryProgress = completionScore;
  
  // Determine status
  var status = 'healthy';
  if (evolutionScore < 40) status = 'critical';
  else if (evolutionScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (stability < 50) status = 'warnings';
  
  return {
    evolutionScore: evolutionScore,
    architectureStability: stability + '%',
    architectureStabilityScore: stability,
    growthScore: growthScore + '%',
    growthScoreValue: growthScore,
    compatibility: compatibility + '%',
    compatibilityScore: compatibility,
    expansionReadiness: readiness + '%',
    readinessScore: readiness,
    recoveryProgress: recoveryProgress + '%',
    recoveryProgressValue: recoveryProgress,
    versions: archGrowth.uniqueVersions,
    milestones: govGrowth.totalMilestones,
    completedMilestones: govGrowth.completedMilestones,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧬 System Evolution Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Evolution Score:', report.evolutionScore + '%');
  console.log('Architecture Stability:', report.architectureStability);
  console.log('Growth Score:', report.growthScore);
  console.log('Compatibility:', report.compatibility);
  console.log('Expansion Readiness:', report.expansionReadiness);
  console.log('Recovery Progress:', report.recoveryProgress);
  console.log('Versions:', report.versions);
  console.log('Milestones:', report.completedMilestones + '/' + report.milestones);
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemEvolutionHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemEvolutionHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemEvolutionHealth = window.systemEvolutionHealth;
  }
}
