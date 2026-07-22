/**
 * System Intelligence Dashboard
 * Provides read‑only intelligence views.
 */

import { INTELLIGENCE_DOMAINS } from './systemIntelligenceManifest.js';
import { collectAll } from './systemIntelligenceCollector.js';
import { generateHealthReport } from './systemIntelligenceHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var collected = collectAll();

  return {
    status: health.status,
    coverage: health.coverage,
    confidence: health.confidenceScore + '%',
    totalSources: health.totalSources,
    healthySources: health.healthySources,
    missingSources: health.missingSources,
    avgHealthScore: health.avgHealthScore + '%',
    anomalies: health.anomalyCount,
    timestamp: health.timestamp
  };
}

export function getHealth() {
  var health = generateHealthReport();
  return {
    overall: health.status,
    coverage: health.coverage,
    confidence: health.confidenceScore + '%',
    sources: health.sourceDetails,
    anomalies: health.anomalies
  };
}

export function getCoverage() {
  var health = generateHealthReport();
  var collected = collectAll();

  return {
    overall: health.coverage,
    sources: health.totalSources,
    healthy: health.healthySources,
    missing: health.missingSources,
    domains: {
      loaded: collected.aggregated.domainsLoaded,
      total: collected.aggregated.domainsTotal,
      percentage: collected.aggregated.coverage + '%'
    }
  };
}

export function getConfidence() {
  var health = generateHealthReport();
  var collected = collectAll();

  var factors = {
    coverage: health.coverageScore || 0,
    avgHealth: health.avgHealthScore || 0,
    warnings: Math.max(0, 100 - (health.totalWarnings * 2)),
    violations: Math.max(0, 100 - (health.totalViolations * 5))
  };

  var score = Math.round(
    (factors.coverage * 0.3) +
    (factors.avgHealth * 0.3) +
    (factors.warnings * 0.2) +
    (factors.violations * 0.2)
  );

  return {
    score: Math.min(score, 100) + '%',
    factors: factors,
    status: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntelligenceDashboard = {
    getOverview: getOverview,
    getHealth: getHealth,
    getCoverage: getCoverage,
    getConfidence: getConfidence,
    init: function() {
      console.log('✅ SystemIntelligenceDashboard ready');
      var overview = getOverview();
      console.log('📊 System Intelligence Overview:', overview);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntelligenceDashboard = window.systemIntelligenceDashboard;
  }
}
