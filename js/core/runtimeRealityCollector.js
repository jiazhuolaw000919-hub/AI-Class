/**
 * Runtime Reality Collector
 * Collects actual runtime state.
 * Read only – never modifies runtime.
 */

export function collectLoadedEngines() {
  var result = { total: 0, active: 0, idle: 0, error: 0, list: [], names: [] };
  
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
          result.list.push(e);
          result.names.push(e.name || e.id);
        }
      }
    }
  } catch (err) {
    result.total = -1;
    result.error = err.message;
  }
  
  return result;
}

export function collectRegisteredModules() {
  var result = { total: 0, list: [], names: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.RuntimeRegistry && typeof LawAIApp.RuntimeRegistry.getAll === 'function') {
        var modules = LawAIApp.RuntimeRegistry.getAll();
        result.total = modules.length;
        result.list = modules;
        result.names = modules.map(function(m) { return m.name || m.id; }).filter(Boolean);
      }
    }
  } catch (err) {
    result.total = -1;
    result.error = err.message;
  }
  
  return result;
}

export function collectActiveDomains() {
  var result = { total: 0, populated: 0, list: [], names: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.DomainRegistry && typeof LawAIApp.DomainRegistry.list === 'function') {
        var domains = LawAIApp.DomainRegistry.list();
        result.total = domains.length;
        result.list = domains;
        result.names = domains.map(function(d) { return d.name; });
        result.populated = domains.filter(function(d) { return d.engines && d.engines.length > 0; }).length;
      }
    }
  } catch (err) {
    result.total = -1;
    result.error = err.message;
  }
  
  return result;
}

export function collectActiveFeatures() {
  var result = { total: 0, active: 0, disabled: 0, list: [], names: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.FeatureRegistry && typeof LawAIApp.FeatureRegistry.list === 'function') {
        var features = LawAIApp.FeatureRegistry.list();
        result.total = features.length;
        result.list = features;
        result.names = features.map(function(f) { return f.name || f.id; }).filter(Boolean);
        
        for (var i = 0; i < features.length; i++) {
          var f = features[i];
          if (f.status === 'disabled') result.disabled++;
          else result.active++;
        }
      }
    }
  } catch (err) {
    result.total = -1;
    result.error = err.message;
  }
  
  return result;
}

export function collectActiveUIComponents() {
  var result = { total: 0, used: 0, unused: 0, list: [], names: [] };
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.UIRegistry && typeof LawAIApp.UIRegistry.list === 'function') {
        var components = LawAIApp.UIRegistry.list();
        result.total = components.length;
        result.list = components;
        result.names = components.map(function(c) { return c.name || c.id; }).filter(Boolean);
        
        for (var i = 0; i < components.length; i++) {
          var c = components[i];
          if (c.used) result.used++;
          else result.unused++;
        }
      }
    }
  } catch (err) {
    result.total = -1;
    result.error = err.message;
  }
  
  return result;
}

export function collectRuntimeStatus() {
  var result = { status: 'unknown', version: 'N/A', uptime: '0s', ready: false };
  
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

export function collectAll() {
  return {
    timestamp: new Date().toISOString(),
    runtime: collectRuntimeStatus(),
    engines: collectLoadedEngines(),
    modules: collectRegisteredModules(),
    domains: collectActiveDomains(),
    features: collectActiveFeatures(),
    ui: collectActiveUIComponents()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeRealityCollector = {
    collectLoadedEngines: collectLoadedEngines,
    collectRegisteredModules: collectRegisteredModules,
    collectActiveDomains: collectActiveDomains,
    collectActiveFeatures: collectActiveFeatures,
    collectActiveUIComponents: collectActiveUIComponents,
    collectRuntimeStatus: collectRuntimeStatus,
    collectAll: collectAll,
    init: function() { console.log('✅ RuntimeRealityCollector ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeRealityCollector = window.runtimeRealityCollector;
  }
}
