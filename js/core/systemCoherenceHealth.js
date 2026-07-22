/**
 * System Coherence Health
 * Generates coherence health reports.
 * Developer only.
 */

import { INTELLIGENCE_CHAIN, LAYER_RELATIONSHIPS } from './systemCoherenceManifest.js';
import { analyzeCoherence } from './systemCoherenceAnalyzer.js';
import { validateCoherence } from './systemCoherenceValidator.js';

export function generateHealthReport() {
  var chain = INTELLIGENCE_CHAIN;
  var relationships = LAYER_RELATIONSHIPS;
  var analysis = analyzeCoherence();

  var totalLayers = chain.length;
  var availableLayers = analysis.layers.filter(function(l) { return l.available; }).length;
  var connectedLayers = 0;
  var brokenLinks = analysis.brokenLinks.length;

  // Count connected layers
  var connectedSet = new Set();
  for (var i = 0; i < relationships.length; i++) {
    var rel = relationships[i];
    if (analysis.layers.some(function(l) { return l.id === rel.from && l.available; }) &&
        analysis.layers.some(function(l) { return l.id === rel.to && l.available; })) {
      connectedSet.add(rel.from);
      connectedSet.add(rel.to);
    }
  }
  connectedLayers = connectedSet.size;

  // Calculate consistency score
  var consistencyScore = 100;
  if (totalLayers > 0) {
    var missingPenalty = (totalLayers - availableLayers) * 5;
    var brokenPenalty = brokenLinks * 10;
    consistencyScore = Math.max(0, 100 - missingPenalty - brokenPenalty);
  }

  // Validation warnings
  var validationWarnings = validateCoherence();

  // Determine status
  var status = 'healthy';
  if (analysis.chainComplete) status = 'excellent';
  else if (brokenLinks > 0) status = 'warnings';
  else if (availableLayers < totalLayers) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (consistencyScore < 50) status = 'critical';

  return {
    totalLayers: totalLayers,
    availableLayers: availableLayers,
    connectedLayers: connectedLayers,
    brokenLinks: brokenLinks,
    missingLayers: analysis.missingLayers.length,
    duplicateRelationships: analysis.duplicateRelationships.length,
    unusedLayers: analysis.unusedLayers.length,
    consistencyScore: consistencyScore,
    chainComplete: analysis.chainComplete,
    completeness: analysis.completeness + '%',
    completenessScore: analysis.completeness,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧩 System Coherence Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Chain Complete:', report.chainComplete ? '✅ Yes' : '❌ No');
  console.log('Consistency Score:', report.consistencyScore + '%');
  console.log('Completeness:', report.completeness);
  console.log('Layers:', report.availableLayers + '/' + report.totalLayers);
  console.log('Connected Layers:', report.connectedLayers);
  if (report.brokenLinks > 0) {
    console.warn('⚠️ Broken Links:', report.brokenLinks);
  }
  if (report.missingLayers > 0) {
    console.warn('⚠️ Missing Layers:', report.missingLayers);
  }
  if (report.unusedLayers > 0) {
    console.warn('📭 Unused Layers:', report.unusedLayers);
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemCoherenceHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemCoherenceHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemCoherenceHealth = window.systemCoherenceHealth;
  }
}
