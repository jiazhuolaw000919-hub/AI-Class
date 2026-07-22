/**
 * System Identity Health
 * Generates identity health reports.
 * Developer only.
 */

import { SYSTEM_IDENTITY } from './systemIdentityManifest.js';
import { collectAll } from './systemIdentityCollector.js';
import { validateIdentity } from './systemIdentityValidator.js';

export function generateHealthReport() {
  var identity = SYSTEM_IDENTITY;
  var collected = collectAll();

  // Calculate identity completeness
  var requiredFields = ['systemName', 'systemVersion', 'architectureVersion', 'intelligenceEra', 'currentSeason', 'currentPart', 'identitySignature'];
  var presentFields = 0;
  for (var i = 0; i < requiredFields.length; i++) {
    if (identity[requiredFields[i]] && identity[requiredFields[i]].trim() !== '') {
      presentFields++;
    }
  }
  var completeness = Math.round((presentFields / requiredFields.length) * 100);

  // Check if runtime is ready
  var runtimeReady = collected.runtime && collected.runtime.ready;

  // Validate identity
  var validationWarnings = validateIdentity();

  // Calculate identity health score
  var healthScore = completeness;
  if (!runtimeReady) healthScore -= 10;
  if (validationWarnings.length > 0) healthScore -= validationWarnings.length * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine status
  var status = 'healthy';
  if (healthScore < 40) status = 'critical';
  else if (healthScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';

  return {
    systemName: identity.systemName,
    systemVersion: identity.systemVersion,
    architectureVersion: identity.architectureVersion,
    intelligenceEra: identity.intelligenceEra,
    currentSeason: identity.currentSeason,
    currentPart: identity.currentPart,
    identitySignature: identity.identitySignature,
    runtimeReady: runtimeReady,
    completeness: completeness + '%',
    completenessScore: completeness,
    healthScore: healthScore,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🪪 System Identity Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('System Name:', report.systemName);
  console.log('System Version:', report.systemVersion);
  console.log('Architecture Version:', report.architectureVersion);
  console.log('Intelligence Era:', report.intelligenceEra);
  console.log('Current Season:', report.currentSeason);
  console.log('Current Part:', report.currentPart);
  console.log('Identity Signature:', report.identitySignature);
  console.log('Runtime Ready:', report.runtimeReady ? '✅ Yes' : '❌ No');
  console.log('Completeness:', report.completeness);
  console.log('Health Score:', report.healthScore + '%');
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIdentityHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemIdentityHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIdentityHealth = window.systemIdentityHealth;
  }
}
