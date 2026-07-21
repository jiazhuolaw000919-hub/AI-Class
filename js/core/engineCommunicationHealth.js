/**
 * Engine Communication Health
 * Generates communication health reports.
 * Developer only.
 */

import { COMMUNICATION_CONTRACTS, COMMUNICATION_TYPES } from './engineCommunicationManifest.js';
import { validateContracts } from './engineCommunicationValidator.js';

export function generateHealthReport() {
  const totalContracts = COMMUNICATION_CONTRACTS.length;
  const activeContracts = COMMUNICATION_CONTRACTS.filter(c => c.status === 'active');
  const deprecatedContracts = COMMUNICATION_CONTRACTS.filter(c => c.status === 'deprecated');
  const experimentalContracts = COMMUNICATION_CONTRACTS.filter(c => c.status === 'experimental');
  
  // Count unique sources and targets
  const sources = new Set();
  const targets = new Set();
  const messageTypes = new Set();
  const permissions = {};
  
  for (let i = 0; i < COMMUNICATION_CONTRACTS.length; i++) {
    const c = COMMUNICATION_CONTRACTS[i];
    sources.add(c.sourceEngine);
    targets.add(c.targetEngine);
    if (c.messageType) messageTypes.add(c.messageType);
    if (c.permission) {
      permissions[c.permission] = (permissions[c.permission] || 0) + 1;
    }
  }
  
  // Validation warnings
  const validationWarnings = validateContracts();
  
  // Invalid contracts (missing required fields)
  let invalidContracts = 0;
  for (let i = 0; i < COMMUNICATION_CONTRACTS.length; i++) {
    const c = COMMUNICATION_CONTRACTS[i];
    if (!c.sourceEngine || !c.targetEngine || !c.messageType) {
      invalidContracts++;
    }
  }
  
  // Coverage (percentage of possible communication patterns)
  const totalEngines = sources.size + targets.size;
  const possiblePatterns = totalEngines > 0 ? totalEngines * (totalEngines - 1) : 1;
  const actualPatterns = totalContracts;
  const coverage = possiblePatterns > 0 ? (actualPatterns / possiblePatterns) * 100 : 0;
  
  // Determine status
  let status = 'healthy';
  if (coverage < 30) status = 'critical';
  else if (coverage < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (invalidContracts > 0) status = 'warnings';
  
  return {
    totalContracts: totalContracts,
    activeContracts: activeContracts.length,
    deprecatedContracts: deprecatedContracts.length,
    experimentalContracts: experimentalContracts.length,
    uniqueSources: sources.size,
    uniqueTargets: targets.size,
    totalEngines: sources.size + targets.size,
    messageTypes: [...messageTypes],
    permissionDistribution: permissions,
    invalidContracts: invalidContracts,
    validationWarnings: validationWarnings.length,
    coverage: `${Math.min(coverage, 100).toFixed(2)}%`,
    coverageScore: Math.round(Math.min(coverage, 100)),
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🌐 Engine Communication Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Contracts:', report.totalContracts);
  console.log('Active:', report.activeContracts + ' | Deprecated:', report.deprecatedContracts + ' | Experimental:', report.experimentalContracts);
  console.log('Sources:', report.uniqueSources + ' | Targets:', report.uniqueTargets);
  console.log('Message Types:', report.messageTypes.join(', ') || '(none)');
  console.log('Coverage:', report.coverage);
  console.log('Invalid Contracts:', report.invalidContracts);
  console.log('Validation Warnings:', report.validationWarnings);
  if (report.validationWarnings > 0) {
    console.warn('⚠️ Run EngineCommunicationValidator for details.');
  } else {
    console.log('✅ All contracts valid.');
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCommunicationHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ EngineCommunicationHealth ready');
      const report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCommunicationHealth = window.engineCommunicationHealth;
  }
}
