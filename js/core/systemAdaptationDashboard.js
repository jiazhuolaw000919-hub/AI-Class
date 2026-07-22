/**
 * System Adaptation Dashboard
 * Provides presentation data for Developer Panel.
 * Read only.
 */

import { ADAPTATION_TYPES } from './systemAdaptationManifest.js';
import { getRecommendations, collectAll } from './systemAdaptationCollector.js';
import { generateHealthReport } from './systemAdaptationHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var recommendations = getRecommendations();

  return {
    status: health.status,
    totalAdaptations: health.totalAdaptations,
    activeAdaptations: health.activeAdaptations,
    signals: health.activeSignals,
    recommendations: recommendations.length,
    blocked: health.blockedAdaptations,
    coverage: health.coverage,
    timestamp: new Date().toISOString()
  };
}

export function getAdaptationHealth() {
  var health = generateHealthReport();
  return {
    status: health.status,
    healthy: health.healthyAdaptations,
    warning: health.warningAdaptations,
    blocked: health.blockedAdaptations,
    coverage: health.coverage
  };
}

export function getAdaptationSignals() {
  var collected = collectAll();
  return collected.signals || [];
}

export function getAdaptationRecommendations() {
  var recommendations = getRecommendations();
  return recommendations.map(function(r) {
    return {
      id: r.id,
      type: r.type,
      category: r.category,
      description: r.description,
      priority: r.priority,
      timestamp: r.timestamp
    };
  });
}

export function getAdaptationSummary() {
  var health = generateHealthReport();
  var recommendations = getRecommendations();
  var collected = collectAll();

  return {
    overallStatus: health.status,
    totalAdaptations: health.totalAdaptations,
    activeAdaptations: health.activeAdaptations,
    signalCount: collected.signals.length,
    recommendationCount: recommendations.length,
    blockedCount: health.blockedAdaptations,
    opportunities: collected.opportunities || [],
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAdaptationDashboard = {
    getOverview: getOverview,
    getAdaptationHealth: getAdaptationHealth,
    getAdaptationSignals: getAdaptationSignals,
    getAdaptationRecommendations: getAdaptationRecommendations,
    getAdaptationSummary: getAdaptationSummary,
    init: function() {
      console.log('✅ SystemAdaptationDashboard ready');
      var summary = getAdaptationSummary();
      console.log('📊 Adaptation Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAdaptationDashboard = window.systemAdaptationDashboard;
  }
}
