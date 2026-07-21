/**
 * System Awareness Collector
 * Collects system awareness information.
 * No mutation – read only.
 */

import { AWARENESS_SOURCES } from './systemAwarenessManifest.js';

export function collectRuntimeStatus() {
  var result = { status: 'unknown', uptime: '0s', version: 'N/A', ready: false };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.RuntimeStatus && typeof LawAIApp.RuntimeStatus.getStatus === 'function') {
        result.status = LawAIApp.RuntimeStatus.getStatus();
        result.ready = LawAIApp.RuntimeStatus.isReady ? LawAIApp.RuntimeStatus.isReady() : false;
      }
      if (LawAIApp.RuntimeKernel && typeof LawAIApp.RuntimeKernel.health === 'function') {
        var health = LawAIApp.RuntimeKernel.health();
        result.version = health.version || 'N/A';
        result.uptime = health.uptime ? Math.round(health.uptime / 1000) + 's' : '0s';
      }
    }
  } catch (err) {
    result.status = 'error';
  }
  
  return result;
}

export function collectEngineState() {
  var result = { total: 0, active: 0, idle: 0, error: 0, deprecated: 0, list: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.EngineRegistry && typeof LawAIApp.EngineRegistry.list === 'function') {
        var engines = LawAIApp.EngineRegistry.list();
        result.total = engines.length;
        
        for (var i = 0; i < engines.length; i++) {
          var e = engines[i];
          var status = e.status || 'unknown';
          if (status === 'active' || status === 'running') result.active++;
          else if (status === 'idle') result.idle++;
          else if (status === 'error') result.error++;
          else if (status === 'deprecated') result.deprecated++;
          result.list.push(e.name || e.id);
        }
      }
    }
  } catch (err) {
    result.total = -1;
  }
  
  return result;
}

export function collectDomainState() {
  var result = { total: 0, populated: 0, domains: {}, list: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.DomainRegistry && typeof LawAIApp.DomainRegistry.list === 'function') {
        var domains = LawAIApp.DomainRegistry.list();
        result.total = domains.length;
        result.populated = domains.filter(function(d) { return d.engines && d.engines.length > 0; }).length;
        result.list = domains.map(function(d) { return d.name; });
        for (var i = 0; i < domains.length; i++) {
          result.domains[domains[i].name] = domains[i].engines ? domains[i].engines.length : 0;
        }
      }
    }
  } catch (err) {
    result.total = -1;
  }
  
  return result;
}

export function collectCapabilityState() {
  var result = { total: 0, defined: 0, undefined: 0, unique: 0, coverage: 0 };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.CapabilityHealth && typeof LawAIApp.CapabilityHealth.getHealth === 'function') {
        var health = LawAIApp.CapabilityHealth.getHealth();
        result.total = health.totalEngines || 0;
        result.defined = health.definedCapabilities || 0;
        result.undefined = health.undefinedCapabilities || 0;
        result.unique = health.uniqueCapabilities || 0;
        result.coverage = health.coveragePercentage || 0;
      }
    }
  } catch (err) {
    result.total = -1;
  }
  
  return result;
}

export function collectHealthState() {
  var result = { overall: 0, runtime: 0, lifecycle: 0, governance: 0, warnings: 0 };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.RuntimeHealth && typeof LawAIApp.RuntimeHealth.getHealth === 'function') {
        var health = LawAIApp.RuntimeHealth.getHealth();
        result.runtime = health.healthScore || 0;
        result.warnings += health.warnings || 0;
      }
      if (LawAIApp.LifecycleHealth && typeof LawAIApp.LifecycleHealth.getHealth === 'function') {
        var health = LawAIApp.LifecycleHealth.getHealth();
        result.lifecycle = health.lifecycleScore || 0;
        result.warnings += health.warnings || 0;
      }
      if (LawAIApp.GovernanceHealth && typeof LawAIApp.GovernanceHealth.getHealth === 'function') {
        var health = LawAIApp.GovernanceHealth.getHealth();
        result.governance = health.governanceScore || 0;
        result.warnings += health.warnings || 0;
      }
      result.overall = Math.round((result.runtime + result.lifecycle + result.governance) / 3);
    }
  } catch (err) {
    result.overall = -1;
  }
  
  return result;
}

export function collectAll() {
  return {
    timestamp: new Date().toISOString(),
    runtime: collectRuntimeStatus(),
    engine: collectEngineState(),
    domain: collectDomainState(),
    capability: collectCapabilityState(),
    health: collectHealthState()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAwarenessCollector = {
    collectRuntimeStatus,
    collectEngineState,
    collectDomainState,
    collectCapabilityState,
    collectHealthState,
    collectAll,
    init: function() { console.log('✅ SystemAwarenessCollector ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAwarenessCollector = window.systemAwarenessCollector;
  }
}
