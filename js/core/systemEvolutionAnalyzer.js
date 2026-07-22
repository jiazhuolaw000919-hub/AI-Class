/**
 * System Evolution Analyzer
 * Analyzes architecture and system growth over time.
 * Developer only.
 */

import { EVOLUTION_MANIFEST } from './systemEvolutionManifest.js';

export function analyzeArchitectureGrowth() {
  var timeline = EVOLUTION_MANIFEST.timeline;
  
  var versionCounts = {};
  var yearCounts = {};
  
  for (var i = 0; i < timeline.length; i++) {
    var entry = timeline[i];
    var version = entry.version;
    var year = entry.date.substring(0, 4);
    
    versionCounts[version] = (versionCounts[version] || 0) + 1;
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  
  // Calculate growth rate (entries per year)
  var years = Object.keys(yearCounts);
  var totalEntries = timeline.length;
  var growthRate = years.length > 0 ? Math.round(totalEntries / years.length) : 0;
  
  // Calculate version progression
  var versions = Object.keys(versionCounts).sort();
  var versionProgression = versions.map(function(v) {
    return { version: v, count: versionCounts[v] };
  });
  
  return {
    totalEntries: totalEntries,
    uniqueVersions: versions.length,
    growthRate: growthRate + ' entries/year',
    versionProgression: versionProgression,
    yearDistribution: yearCounts,
    latestVersion: versions[versions.length - 1] || 'N/A',
    earliestVersion: versions[0] || 'N/A'
  };
}

export function analyzeGovernanceGrowth() {
  var milestones = EVOLUTION_MANIFEST.milestones;
  var completed = milestones.filter(function(m) { return m.completed; });
  var pending = milestones.filter(function(m) { return !m.completed; });
  
  var categories = {};
  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    var prefix = m.id.charAt(0);
    if (!categories[prefix]) {
      categories[prefix] = 0;
    }
    categories[prefix]++;
  }
  
  return {
    totalMilestones: milestones.length,
    completedMilestones: completed.length,
    pendingMilestones: pending.length,
    completionRate: milestones.length > 0 ? Math.round((completed.length / milestones.length) * 100) : 0,
    categories: categories,
    currentRecoveryStage: EVOLUTION_MANIFEST.recoveryStage,
    governanceStage: EVOLUTION_MANIFEST.governanceStage
  };
}

export function analyzeModuleGrowth() {
  var growth = {
    totalEngines: 0,
    totalModules: 0,
    totalDomains: 0,
    totalFeatures: 0,
    totalRegistries: 0
  };
  
  try {
    // Engine count
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.EngineRegistry && typeof LawAIApp.EngineRegistry.list === 'function') {
        growth.totalEngines = LawAIApp.EngineRegistry.list().length;
      }
      if (LawAIApp.RuntimeRegistry && typeof LawAIApp.RuntimeRegistry.getAll === 'function') {
        growth.totalModules = LawAIApp.RuntimeRegistry.getAll().length;
      }
      if (LawAIApp.DomainRegistry && typeof LawAIApp.DomainRegistry.list === 'function') {
        growth.totalDomains = LawAIApp.DomainRegistry.list().length;
      }
      if (LawAIApp.FeatureRegistry && typeof LawAIApp.FeatureRegistry.list === 'function') {
        growth.totalFeatures = LawAIApp.FeatureRegistry.list().length;
      }
    }
  } catch (e) { /* ignore */ }
  
  return growth;
}

export function analyzeGrowthTrends() {
  var archGrowth = analyzeArchitectureGrowth();
  var govGrowth = analyzeGovernanceGrowth();
  var moduleGrowth = analyzeModuleGrowth();
  
  return {
    architecture: {
      totalVersions: archGrowth.uniqueVersions,
      growthRate: archGrowth.growthRate,
      latestVersion: archGrowth.latestVersion
    },
    governance: {
      completionRate: govGrowth.completionRate + '%',
      completed: govGrowth.completedMilestones,
      total: govGrowth.totalMilestones
    },
    modules: {
      engines: moduleGrowth.totalEngines,
      modules: moduleGrowth.totalModules,
      domains: moduleGrowth.totalDomains,
      features: moduleGrowth.totalFeatures
    },
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemEvolutionAnalyzer = {
    analyzeArchitectureGrowth: analyzeArchitectureGrowth,
    analyzeGovernanceGrowth: analyzeGovernanceGrowth,
    analyzeModuleGrowth: analyzeModuleGrowth,
    analyzeGrowthTrends: analyzeGrowthTrends,
    init: function() {
      console.log('✅ SystemEvolutionAnalyzer ready');
      var trends = analyzeGrowthTrends();
      console.log('📊 Evolution Analysis:', trends);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemEvolutionAnalyzer = window.systemEvolutionAnalyzer;
  }
}
