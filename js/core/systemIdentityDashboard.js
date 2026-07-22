/**
 * System Identity Dashboard
 * Provides presentation data for Developer Panel.
 * Read only.
 */

import { SYSTEM_IDENTITY } from './systemIdentityManifest.js';
import { collectAll } from './systemIdentityCollector.js';
import { generateHealthReport } from './systemIdentityHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var identity = SYSTEM_IDENTITY;

  return {
    status: health.status,
    systemName: identity.systemName,
    systemVersion: identity.systemVersion,
    architectureVersion: identity.architectureVersion,
    intelligenceEra: identity.intelligenceEra,
    currentSeason: identity.currentSeason,
    currentPart: identity.currentPart,
    identitySignature: identity.identitySignature,
    healthScore: health.healthScore,
    completeness: health.completeness,
    runtimeReady: health.runtimeReady,
    timestamp: new Date().toISOString()
  };
}

export function getIdentityHealth() {
  var health = generateHealthReport();
  return {
    status: health.status,
    healthScore: health.healthScore,
    completeness: health.completeness,
    runtimeReady: health.runtimeReady,
    validationWarnings: health.validationWarnings
  };
}

export function getIdentityMetadata() {
  var identity = SYSTEM_IDENTITY;
  var metadata = identity.identityMetadata || {};

  return {
    created: metadata.created || 'N/A',
    lastUpdated: metadata.lastUpdated || 'N/A',
    totalParts: metadata.totalParts || 0,
    totalSeasons: metadata.totalSeasons || 0,
    totalVersions: metadata.totalVersions || 0,
    architectureLayers: identity.architectureLayers || []
  };
}

export function getIdentitySummary() {
  var health = generateHealthReport();
  var identity = SYSTEM_IDENTITY;

  return {
    overallStatus: health.status,
    systemName: identity.systemName,
    systemVersion: identity.systemVersion,
    architectureVersion: identity.architectureVersion,
    intelligenceEra: identity.intelligenceEra,
    currentSeason: identity.currentSeason,
    currentPart: identity.currentPart,
    identitySignature: identity.identitySignature,
    healthScore: health.healthScore,
    completeness: health.completeness,
    validationWarnings: health.validationWarnings,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIdentityDashboard = {
    getOverview: getOverview,
    getIdentityHealth: getIdentityHealth,
    getIdentityMetadata: getIdentityMetadata,
    getIdentitySummary: getIdentitySummary,
    init: function() {
      console.log('✅ SystemIdentityDashboard ready');
      var summary = getIdentitySummary();
      console.log('🪪 Identity Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIdentityDashboard = window.systemIdentityDashboard;
  }
}
