/**
 * System Identity Collector
 * Collects runtime and architecture identity information.
 * Observation only – no modification.
 */

import { SYSTEM_IDENTITY } from './systemIdentityManifest.js';

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    identity: {},
    runtime: {},
    architecture: {},
    intelligence: {},
    version: {}
  };

  // Collect system identity
  result.identity = {
    systemName: SYSTEM_IDENTITY.systemName,
    systemVersion: SYSTEM_IDENTITY.systemVersion,
    architectureVersion: SYSTEM_IDENTITY.architectureVersion,
    intelligenceEra: SYSTEM_IDENTITY.intelligenceEra,
    currentSeason: SYSTEM_IDENTITY.currentSeason,
    currentPart: SYSTEM_IDENTITY.currentPart,
    identitySignature: SYSTEM_IDENTITY.identitySignature
  };

  // Collect runtime identity
  try {
    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
      result.runtime = {
        status: runtimeStatus.getStatus(),
        ready: runtimeStatus.isReady ? runtimeStatus.isReady() : false
      };
    }

    var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
    if (runtimeKernel && typeof runtimeKernel.health === 'function') {
      var health = runtimeKernel.health();
      result.runtime.uptime = health.uptime || 0;
      result.runtime.version = health.version || 'N/A';
    }
  } catch (e) { /* ignore */ }

  // Collect architecture identity
  try {
    var archGuard = LawAIApp.ArchitectureGuard || window.architectureGuard;
    if (archGuard) {
      result.architecture = {
        status: 'active',
        layers: SYSTEM_IDENTITY.architectureLayers.length
      };
      if (typeof archGuard.isCompliant === 'function') {
        result.architecture.compliant = archGuard.isCompliant();
      }
    }
  } catch (e) { /* ignore */ }

  // Collect intelligence identity
  try {
    var intelligenceHealth = LawAIApp.SystemIntelligenceHealth || window.systemIntelligenceHealth;
    if (intelligenceHealth && typeof intelligenceHealth.getHealth === 'function') {
      var data = intelligenceHealth.getHealth();
      result.intelligence = {
        generation: 'Generation 1',
        coverage: data.coverageScore || 0,
        confidence: data.confidenceScore || 0
      };
    }
  } catch (e) { /* ignore */ }

  // Collect version identity
  try {
    var continuityHealth = LawAIApp.SystemContinuityHealth || window.systemContinuityHealth;
    if (continuityHealth && typeof continuityHealth.getHealth === 'function') {
      var data = continuityHealth.getHealth();
      result.version = {
        current: data.currentVersion || 'N/A',
        totalVersions: data.totalVersions || 0,
        continuityScore: data.continuityScore || 0
      };
    }
  } catch (e) { /* ignore */ }

  return result;
}

export function collectIdentity() {
  var all = collectAll();
  return all.identity;
}

export function collectRuntime() {
  var all = collectAll();
  return all.runtime;
}

export function collectArchitecture() {
  var all = collectAll();
  return all.architecture;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIdentityCollector = {
    collectAll: collectAll,
    collectIdentity: collectIdentity,
    collectRuntime: collectRuntime,
    collectArchitecture: collectArchitecture,
    init: function() {
      console.log('✅ SystemIdentityCollector ready');
      var identity = collectIdentity();
      console.log('🪪 System Identity:', identity.systemName, identity.systemVersion);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIdentityCollector = window.systemIdentityCollector;
  }
}
