/**
 * System Coherence Dashboard
 * Provides presentation data for Developer Panel.
 * Read only.
 */

import { INTELLIGENCE_CHAIN } from './systemCoherenceManifest.js';
import { analyzeCoherence } from './systemCoherenceAnalyzer.js';
import { generateHealthReport } from './systemCoherenceHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var analysis = analyzeCoherence();

  return {
    status: health.status,
    consistency: health.consistencyScore + '%',
    completeness: health.completeness,
    layers: health.availableLayers + '/' + health.totalLayers,
    connected: health.connectedLayers,
    brokenLinks: health.brokenLinks,
    chainComplete: health.chainComplete,
    timestamp: new Date().toISOString()
  };
}

export function getCoherenceHealth() {
  var health = generateHealthReport();
  return {
    status: health.status,
    consistencyScore: health.consistencyScore,
    completenessScore: health.completenessScore,
    availableLayers: health.availableLayers,
    totalLayers: health.totalLayers,
    brokenLinks: health.brokenLinks,
    missingLayers: health.missingLayers
  };
}

export function getLayerStatus() {
  var analysis = analyzeCoherence();
  return analysis.layers;
}

export function getConnections() {
  var analysis = analyzeCoherence();
  return analysis.connections;
}

export function getCoherenceSummary() {
  var health = generateHealthReport();
  var analysis = analyzeCoherence();

  return {
    overallStatus: health.status,
    chainComplete: health.chainComplete,
    consistencyScore: health.consistencyScore,
    completeness: health.completeness,
    totalLayers: health.totalLayers,
    availableLayers: health.availableLayers,
    connectedLayers: health.connectedLayers,
    brokenLinks: health.brokenLinks,
    missingLayers: health.missingLayers,
    unusedLayers: health.unusedLayers,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemCoherenceDashboard = {
    getOverview: getOverview,
    getCoherenceHealth: getCoherenceHealth,
    getLayerStatus: getLayerStatus,
    getConnections: getConnections,
    getCoherenceSummary: getCoherenceSummary,
    init: function() {
      console.log('✅ SystemCoherenceDashboard ready');
      var summary = getCoherenceSummary();
      console.log('🧩 Coherence Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemCoherenceDashboard = window.systemCoherenceDashboard;
  }
}
