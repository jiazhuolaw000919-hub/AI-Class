/**
 * Runtime Intelligence Collector
 * Collects runtime information only.
 * Read only – never modifies runtime.
 */

import { OBSERVATION_TARGETS } from './runtimeIntelligenceManifest.js';

export function collectEngineStatus(engineName) {
  const result = { engine: engineName, status: 'unknown', metadata: null };
  
  try {
    // Check LawAIApp
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp[engineName]) {
        const engine = LawAIApp[engineName];
        result.status = engine.status || 'unknown';
        result.metadata = engine.__meta || engine.metadata || null;
        return result;
      }
    }
    
    // Check window
    if (typeof window !== 'undefined' && window) {
      if (window[engineName]) {
        const engine = window[engineName];
        result.status = engine.status || 'unknown';
        result.metadata = engine.__meta || engine.metadata || null;
        return result;
      }
    }
  } catch (err) {
    result.status = 'error';
  }
  
  return result;
}

export function collectRuntimeStatus() {
  const result = { status: 'unknown', uptime: '0s', version: 'N/A', ready: false };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.RuntimeStatus && typeof LawAIApp.RuntimeStatus.getStatus === 'function') {
        result.status = LawAIApp.RuntimeStatus.getStatus();
        result.ready = LawAIApp.RuntimeStatus.isReady ? LawAIApp.RuntimeStatus.isReady() : false;
      }
      if (LawAIApp.RuntimeKernel && typeof LawAIApp.RuntimeKernel.health === 'function') {
        const health = LawAIApp.RuntimeKernel.health();
        result.version = health.version || 'N/A';
        result.uptime = health.uptime ? Math.round(health.uptime / 1000) + 's' : '0s';
      }
    }
  } catch (err) {
    result.status = 'error';
  }
  
  return result;
}

export function collectLifecycleState(engineName) {
  const result = { engine: engineName, state: 'unknown', phase: 'unknown' };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      const lifecycle = LawAIApp.LifecycleHealth || window.lifecycleHealth;
      if (lifecycle && typeof lifecycle.getEngineState === 'function') {
        const state = lifecycle.getEngineState(engineName);
        result.state = state.state || 'unknown';
        result.phase = state.phase || 'unknown';
        return result;
      }
    }
  } catch (err) {
    result.state = 'error';
  }
  
  return result;
}

export function collectRegistryInformation() {
  const result = { modules: 0, engines: 0, moduleList: [], engineList: [] };
  
  try {
    // Runtime Registry
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.RuntimeRegistry && typeof LawAIApp.RuntimeRegistry.getAll === 'function') {
        const all = LawAIApp.RuntimeRegistry.getAll();
        result.modules = all.length;
        result.moduleList = all.map(m => m.name || m.id).filter(Boolean);
      }
      if (LawAIApp.EngineRegistry && typeof LawAIApp.EngineRegistry.list === 'function') {
        const engines = LawAIApp.EngineRegistry.list();
        result.engines = engines.length;
        result.engineList = engines.map(e => e.name || e.id).filter(Boolean);
      }
    }
  } catch (err) {
    result.modules = -1;
  }
  
  return result;
}

export function collectPerformanceMetrics() {
  const result = { memory: null, loadTime: null, fps: null };
  
  try {
    if (typeof performance !== 'undefined') {
      const memory = performance.memory;
      if (memory) {
        result.memory = {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        };
      }
      
      const timing = performance.timing;
      if (timing && timing.loadEventEnd && timing.navigationStart) {
        result.loadTime = Math.round((timing.loadEventEnd - timing.navigationStart) / 1000);
      }
    }
  } catch (err) {
    // Ignore
  }
  
  return result;
}

export function collectHealthInformation() {
  const result = { scores: {}, warnings: 0, violations: 0 };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      // Runtime Health
      if (LawAIApp.RuntimeHealth && typeof LawAIApp.RuntimeHealth.getHealth === 'function') {
        const health = LawAIApp.RuntimeHealth.getHealth();
        result.scores.runtime = health.healthScore || 0;
        result.warnings += health.warnings || 0;
        result.violations += health.violations || 0;
      }
      
      // Lifecycle Health
      if (LawAIApp.LifecycleHealth && typeof LawAIApp.LifecycleHealth.getHealth === 'function') {
        const health = LawAIApp.LifecycleHealth.getHealth();
        result.scores.lifecycle = health.lifecycleScore || 0;
        result.warnings += health.warnings || 0;
        result.violations += health.violations || 0;
      }
      
      // Governance Health
      if (LawAIApp.GovernanceHealth && typeof LawAIApp.GovernanceHealth.getHealth === 'function') {
        const health = LawAIApp.GovernanceHealth.getHealth();
        result.scores.governance = health.governanceScore || 0;
        result.warnings += health.warnings || 0;
        result.violations += health.violations || 0;
      }
    }
  } catch (err) {
    result.scores.error = -1;
  }
  
  return result;
}

export function collectAll() {
  return {
    timestamp: new Date().toISOString(),
    runtime: collectRuntimeStatus(),
    registry: collectRegistryInformation(),
    performance: collectPerformanceMetrics(),
    health: collectHealthInformation()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeIntelligenceCollector = {
    collectEngineStatus,
    collectRuntimeStatus,
    collectLifecycleState,
    collectRegistryInformation,
    collectPerformanceMetrics,
    collectHealthInformation,
    collectAll,
    init: function() { console.log('✅ RuntimeIntelligenceCollector ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeIntelligenceCollector = {
      collectEngineStatus,
      collectRuntimeStatus,
      collectLifecycleState,
      collectRegistryInformation,
      collectPerformanceMetrics,
      collectHealthInformation,
      collectAll,
      init: function() { console.log('✅ RuntimeIntelligenceCollector ready'); return this; }
    };
  }
}
