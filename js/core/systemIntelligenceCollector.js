/**
 * System Intelligence Collector
 * Collects existing information from governance systems.
 * Only aggregates – never duplicates logic.
 */

import { INTELLIGENCE_DOMAINS } from './systemIntelligenceManifest.js';

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    domains: {},
    aggregated: {
      totalHealthScore: 0,
      totalWarnings: 0,
      totalViolations: 0,
      domainsLoaded: 0
    }
  };

  var domainMap = {
    runtime: { health: null, warnings: 0, violations: 0, score: 0 },
    architecture: { health: null, warnings: 0, violations: 0, score: 0 },
    engine: { health: null, warnings: 0, violations: 0, score: 0 },
    registry: { health: null, warnings: 0, violations: 0, score: 0 },
    dependency: { health: null, warnings: 0, violations: 0, score: 0 },
    lifecycle: { health: null, warnings: 0, violations: 0, score: 0 },
    capability: { health: null, warnings: 0, violations: 0, score: 0 },
    communication: { health: null, warnings: 0, violations: 0, score: 0 },
    signal: { health: null, warnings: 0, violations: 0, score: 0 }
  };

  var totalScore = 0;
  var loadedCount = 0;

  try {
    // Runtime Health
    var runtimeHealth = LawAIApp.RuntimeHealth || window.runtimeHealth;
    if (runtimeHealth && typeof runtimeHealth.getHealth === 'function') {
      var data = runtimeHealth.getHealth();
      domainMap.runtime.health = data;
      domainMap.runtime.score = data.healthScore || 0;
      domainMap.runtime.warnings = data.warnings || 0;
      domainMap.runtime.violations = data.violations || 0;
      totalScore += domainMap.runtime.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Architecture Validator
    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (archValidator) {
      var warnings = archValidator.warnings || [];
      var violations = archValidator.violations || [];
      domainMap.architecture.health = { warnings: warnings, violations: violations };
      domainMap.architecture.score = 100 - Math.min((warnings.length + violations.length) * 5, 100);
      domainMap.architecture.warnings = warnings.length;
      domainMap.architecture.violations = violations.length;
      totalScore += domainMap.architecture.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Engine Health
    var engineHealth = LawAIApp.EngineHealth || window.engineHealth;
    if (engineHealth && typeof engineHealth.getHealth === 'function') {
      var data = engineHealth.getHealth();
      domainMap.engine.health = data;
      domainMap.engine.score = data.healthScore || 0;
      domainMap.engine.warnings = data.warnings || 0;
      domainMap.engine.violations = data.violations || 0;
      totalScore += domainMap.engine.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Registry Health
    var registryHealth = LawAIApp.RegistryHealth || window.registryHealth;
    if (registryHealth && typeof registryHealth.getHealth === 'function') {
      var data = registryHealth.getHealth();
      domainMap.registry.health = data;
      domainMap.registry.score = data.healthScore || 0;
      domainMap.registry.warnings = data.warnings || 0;
      domainMap.registry.violations = data.violations || 0;
      totalScore += domainMap.registry.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Dependency Health
    var depHealth = LawAIApp.DependencyHealth || window.dependencyHealth;
    if (depHealth && typeof depHealth.getHealth === 'function') {
      var data = depHealth.getHealth();
      domainMap.dependency.health = data;
      domainMap.dependency.score = data.dependencyScore || 0;
      domainMap.dependency.warnings = data.warnings || 0;
      domainMap.dependency.violations = data.violations || 0;
      totalScore += domainMap.dependency.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Lifecycle Health
    var lifecycleHealth = LawAIApp.LifecycleHealth || window.lifecycleHealth;
    if (lifecycleHealth && typeof lifecycleHealth.getHealth === 'function') {
      var data = lifecycleHealth.getHealth();
      domainMap.lifecycle.health = data;
      domainMap.lifecycle.score = data.lifecycleScore || 0;
      domainMap.lifecycle.warnings = data.warnings || 0;
      domainMap.lifecycle.violations = data.violations || 0;
      totalScore += domainMap.lifecycle.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Capability Health
    var capHealth = LawAIApp.CapabilityHealth || window.capabilityHealth;
    if (capHealth && typeof capHealth.getHealth === 'function') {
      var data = capHealth.getHealth();
      domainMap.capability.health = data;
      domainMap.capability.score = data.capabilityScore || 0;
      domainMap.capability.warnings = data.warnings || 0;
      domainMap.capability.violations = data.violations || 0;
      totalScore += domainMap.capability.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Communication Health
    var commHealth = LawAIApp.EngineCommunicationHealth || window.engineCommunicationHealth;
    if (commHealth && typeof commHealth.getHealth === 'function') {
      var data = commHealth.getHealth();
      domainMap.communication.health = data;
      domainMap.communication.score = data.coverageScore || 0;
      domainMap.communication.warnings = data.validationWarnings || 0;
      domainMap.communication.violations = data.invalidContracts || 0;
      totalScore += domainMap.communication.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  try {
    // Signal Health
    var signalHealth = LawAIApp.EngineSignalHealth || window.engineSignalHealth;
    if (signalHealth && typeof signalHealth.getHealth === 'function') {
      var data = signalHealth.getHealth();
      domainMap.signal.health = data;
      domainMap.signal.score = data.coverageScore || 0;
      domainMap.signal.warnings = data.validationWarnings || 0;
      domainMap.signal.violations = 0;
      totalScore += domainMap.signal.score;
      loadedCount++;
    }
  } catch (e) { /* ignore */ }

  // Calculate aggregated values
  var avgScore = loadedCount > 0 ? Math.round(totalScore / loadedCount) : 0;
  var totalWarnings = 0;
  var totalViolations = 0;

  for (var key in domainMap) {
    if (domainMap.hasOwnProperty(key)) {
      totalWarnings += domainMap[key].warnings || 0;
      totalViolations += domainMap[key].violations || 0;
    }
  }

  result.domains = domainMap;
  result.aggregated = {
    totalHealthScore: avgScore,
    totalWarnings: totalWarnings,
    totalViolations: totalViolations,
    domainsLoaded: loadedCount,
    domainsTotal: Object.keys(domainMap).length,
    coverage: loadedCount > 0 ? Math.round((loadedCount / Object.keys(domainMap).length) * 100) : 0
  };

  return result;
}

export function collectDomain(id) {
  var all = collectAll();
  return all.domains[id] || null;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntelligenceCollector = {
    collectAll: collectAll,
    collectDomain: collectDomain,
    init: function() { console.log('✅ SystemIntelligenceCollector ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntelligenceCollector = window.systemIntelligenceCollector;
  }
}
