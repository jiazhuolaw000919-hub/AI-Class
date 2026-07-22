/**
 * System Decision Dashboard
 * Aggregates all decisions.
 * Read only.
 */

import { DECISION_CATEGORIES } from './systemDecisionManifest.js';
import { getDecisions, getSummary, generateDecisions } from './systemDecisionEngine.js';
import { generateHealthReport } from './systemDecisionHealth.js';
import { validateDecisions } from './systemDecisionValidator.js';

export function getOverview() {
  var health = generateHealthReport();
  var summary = getSummary();
  
  return {
    status: health.status,
    totalDecisions: summary.total,
    errors: summary.errors,
    warnings: summary.warnings,
    coverage: health.coverage,
    quality: health.quality,
    timestamp: new Date().toISOString()
  };
}

export function getDecisionsByCategory() {
  var decisions = getDecisions();
  var result = {};
  
  var categories = DECISION_CATEGORIES.map(function(c) { return c.id; });
  for (var i = 0; i < categories.length; i++) {
    result[categories[i]] = [];
  }
  
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    if (result[d.category]) {
      result[d.category].push(d);
    }
  }
  
  return result;
}

export function getDecisionsBySeverity() {
  var decisions = getDecisions();
  var result = { error: [], warning: [] };
  
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    if (d.severity === 'error') {
      result.error.push(d);
    } else if (d.severity === 'warning') {
      result.warning.push(d);
    }
  }
  
  return result;
}

export function getRecommendations() {
  var decisions = getDecisions();
  var recommendations = [];
  
  for (var i = 0; i < decisions.length; i++) {
    var d = decisions[i];
    recommendations.push({
      type: d.decision,
      category: d.category,
      severity: d.severity,
      reason: d.details,
      timestamp: d.timestamp
    });
  }
  
  return recommendations;
}

export function getSummary() {
  var health = generateHealthReport();
  var summary = getSummary();
  var recommendations = getRecommendations();
  
  return {
    overallStatus: health.status,
    totalDecisions: summary.total,
    errors: summary.errors,
    warnings: summary.warnings,
    coverage: health.coverage,
    quality: health.quality,
    recommendations: recommendations.length,
    timestamp: new Date().toISOString()
  };
}

export function refreshDecisions() {
  return generateDecisions();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemDecisionDashboard = {
    getOverview: getOverview,
    getDecisionsByCategory: getDecisionsByCategory,
    getDecisionsBySeverity: getDecisionsBySeverity,
    getRecommendations: getRecommendations,
    getSummary: getSummary,
    refreshDecisions: refreshDecisions,
    init: function() {
      console.log('✅ SystemDecisionDashboard ready');
      var summary = getSummary();
      console.log('📊 Decision Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemDecisionDashboard = window.systemDecisionDashboard;
  }
}
