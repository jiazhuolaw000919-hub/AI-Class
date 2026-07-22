/**
 * System Reflection Dashboard
 * Aggregates all reflection outputs.
 * Read only.
 */

import { REFLECTION_CATEGORIES } from './systemReflectionManifest.js';
import { analyzeTrends, getSnapshots, getSnapshotCount } from './systemReflectionAnalyzer.js';
import { generateHealthReport } from './systemReflectionHealth.js';
import { validateReflection } from './systemReflectionValidator.js';

export function getOverview() {
  var health = generateHealthReport();
  var trends = analyzeTrends();
  var snapshots = getSnapshots();
  
  return {
    status: health.status,
    snapshots: snapshots.length,
    coverage: health.coverage,
    consistency: health.consistency,
    trends: trends.trends || {},
    timestamp: new Date().toISOString()
  };
}

export function getTrends() {
  var trends = analyzeTrends();
  return trends.trends || {};
}

export function getTrendByCategory(categoryId) {
  var trends = analyzeTrends();
  return trends.trends ? trends.trends[categoryId] || null : null;
}

export function getSnapshotHistory() {
  var snapshots = getSnapshots();
  return snapshots.map(function(s) {
    return {
      timestamp: s.timestamp,
      date: new Date(s.timestamp).toLocaleString(),
      version: s.version && s.version.version ? s.version.version : 'N/A',
      boot: s.boot,
      runtime: s.runtime,
      governance: s.governance,
      health: s.health
    };
  });
}

export function getSummary() {
  var health = generateHealthReport();
  var trends = analyzeTrends();
  
  // Count improving vs declining
  var improving = 0;
  var declining = 0;
  var stable = 0;
  
  if (trends.trends) {
    for (var key in trends.trends) {
      if (trends.trends.hasOwnProperty(key)) {
        var t = trends.trends[key];
        if (t.trend === 'improving') improving++;
        else if (t.trend === 'declining') declining++;
        else if (t.trend === 'stable' || t.trend === 'growing') stable++;
      }
    }
  }
  
  return {
    overallStatus: health.status,
    totalSnapshots: health.totalSnapshots,
    coverage: health.coverage,
    consistency: health.consistency,
    improvingCategories: improving,
    decliningCategories: declining,
    stableCategories: stable,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemReflectionDashboard = {
    getOverview: getOverview,
    getTrends: getTrends,
    getTrendByCategory: getTrendByCategory,
    getSnapshotHistory: getSnapshotHistory,
    getSummary: getSummary,
    init: function() {
      console.log('✅ SystemReflectionDashboard ready');
      var summary = getSummary();
      console.log('📊 Reflection Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemReflectionDashboard = window.systemReflectionDashboard;
  }
}
