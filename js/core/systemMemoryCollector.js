/**
 * System Memory Collector
 * Collects information from existing systems.
 * Aggregation only – never duplicates logic.
 */

import { MEMORY_CATEGORIES } from './systemMemoryManifest.js';

// In‑memory history store
var _history = [];
var _maxEntries = 1000;

export function collectAll() {
  var entries = [];
  var timestamp = new Date().toISOString();
  var version = getSystemVersion();

  // Collect boot history
  var bootEntries = collectBootHistory(timestamp, version);
  entries = entries.concat(bootEntries);

  // Collect runtime history
  var runtimeEntries = collectRuntimeHistory(timestamp, version);
  entries = entries.concat(runtimeEntries);

  // Collect architecture history
  var archEntries = collectArchitectureHistory(timestamp, version);
  entries = entries.concat(archEntries);

  // Collect governance history
  var govEntries = collectGovernanceHistory(timestamp, version);
  entries = entries.concat(govEntries);

  // Collect registry history
  var regEntries = collectRegistryHistory(timestamp, version);
  entries = entries.concat(regEntries);

  // Collect engine history
  var engineEntries = collectEngineHistory(timestamp, version);
  entries = entries.concat(engineEntries);

  // Collect health history
  var healthEntries = collectHealthHistory(timestamp, version);
  entries = entries.concat(healthEntries);

  // Collect recovery history
  var recoveryEntries = collectRecoveryHistory(timestamp, version);
  entries = entries.concat(recoveryEntries);

  // Store in memory
  _history = _history.concat(entries);
  
  // Trim if exceeds max
  if (_history.length > _maxEntries) {
    _history = _history.slice(-_maxEntries);
  }

  return {
    timestamp: timestamp,
    version: version,
    entries: entries,
    totalHistory: _history.length
  };
}

function getSystemVersion() {
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) {
        return LawAIApp.SystemComposer.version;
      }
      if (LawAIApp.BootManager && typeof LawAIApp.BootManager.getStatus === 'function') {
        return '3.3.2';
      }
    }
  } catch (e) { /* ignore */ }
  return 'N/A';
}

function collectBootHistory(timestamp, version) {
  var entries = [];
  
  try {
    var bootManager = LawAIApp.BootManager || window.bootManager;
    if (bootManager && typeof bootManager.getStatus === 'function') {
      var status = bootManager.getStatus();
      entries.push({
        timestamp: timestamp,
        category: 'boot',
        type: 'status',
        source: 'BootManager',
        data: {
          booted: status.booted || false,
          stages: status.stages || {},
          allComplete: status.allComplete || false
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectRuntimeHistory(timestamp, version) {
  var entries = [];
  
  try {
    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
      entries.push({
        timestamp: timestamp,
        category: 'runtime',
        type: 'status',
        source: 'RuntimeStatus',
        data: {
          status: runtimeStatus.getStatus(),
          ready: runtimeStatus.isReady ? runtimeStatus.isReady() : false
        },
        version: version
      });
    }

    var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
    if (runtimeKernel && typeof runtimeKernel.health === 'function') {
      var health = runtimeKernel.health();
      entries.push({
        timestamp: timestamp,
        category: 'runtime',
        type: 'health',
        source: 'RuntimeKernel',
        data: {
          version: health.version || 'N/A',
          uptime: health.uptime || 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectArchitectureHistory(timestamp, version) {
  var entries = [];
  
  try {
    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (archValidator) {
      var warnings = archValidator.warnings || [];
      var violations = archValidator.violations || [];
      entries.push({
        timestamp: timestamp,
        category: 'architecture',
        type: 'validation',
        source: 'ArchitectureValidator',
        data: {
          warnings: warnings.length,
          violations: violations.length,
          passed: warnings.length === 0 && violations.length === 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectGovernanceHistory(timestamp, version) {
  var entries = [];
  
  try {
    var govHealth = LawAIApp.GovernanceHealth || window.governanceHealth;
    if (govHealth && typeof govHealth.getHealth === 'function') {
      var data = govHealth.getHealth();
      entries.push({
        timestamp: timestamp,
        category: 'governance',
        type: 'health',
        source: 'GovernanceHealth',
        data: {
          score: data.governanceScore || 0,
          status: data.status || 'unknown',
          warnings: data.warnings || 0,
          violations: data.violations || 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectRegistryHistory(timestamp, version) {
  var entries = [];
  
  try {
    var regHealth = LawAIApp.RegistryHealth || window.registryHealth;
    if (regHealth && typeof regHealth.getHealth === 'function') {
      var data = regHealth.getHealth();
      entries.push({
        timestamp: timestamp,
        category: 'registry',
        type: 'health',
        source: 'RegistryHealth',
        data: {
          healthScore: data.healthScore || 0,
          status: data.status || 'unknown',
          warnings: data.warnings || 0,
          violations: data.violations || 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectEngineHistory(timestamp, version) {
  var entries = [];
  
  try {
    var engineHealth = LawAIApp.EngineHealth || window.engineHealth;
    if (engineHealth && typeof engineHealth.getHealth === 'function') {
      var data = engineHealth.getHealth();
      entries.push({
        timestamp: timestamp,
        category: 'engine',
        type: 'health',
        source: 'EngineHealth',
        data: {
          totalEngines: data.totalEngines || 0,
          healthyEngines: data.healthyEngines || 0,
          healthScore: data.healthScore || 0,
          warnings: data.warnings || 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectHealthHistory(timestamp, version) {
  var entries = [];
  
  try {
    var runtimeHealth = LawAIApp.RuntimeHealth || window.runtimeHealth;
    if (runtimeHealth && typeof runtimeHealth.getHealth === 'function') {
      var data = runtimeHealth.getHealth();
      entries.push({
        timestamp: timestamp,
        category: 'health',
        type: 'runtime',
        source: 'RuntimeHealth',
        data: {
          healthScore: data.healthScore || 0,
          status: data.status || 'unknown',
          warnings: data.warnings || 0,
          violations: data.violations || 0
        },
        version: version
      });
    }

    var lifecycleHealth = LawAIApp.LifecycleHealth || window.lifecycleHealth;
    if (lifecycleHealth && typeof lifecycleHealth.getHealth === 'function') {
      var data = lifecycleHealth.getHealth();
      entries.push({
        timestamp: timestamp,
        category: 'health',
        type: 'lifecycle',
        source: 'LifecycleHealth',
        data: {
          lifecycleScore: data.lifecycleScore || 0,
          status: data.lifecycleStatus || 'unknown',
          warnings: data.warnings || 0
        },
        version: version
      });
    }
  } catch (e) { /* ignore */ }

  return entries;
}

function collectRecoveryHistory(timestamp, version) {
  var entries = [];
  
  try {
    var recReport = LawAIApp.RecoveryReport || window.recoveryReport;
    if (recReport && typeof recReport.getReport === 'function') {
      var data = recReport.getReport();
      if (data && data.overall) {
        entries.push({
          timestamp: timestamp,
          category: 'recovery',
          type: 'report',
          source: 'RecoveryReport',
          data: {
            score: data.overall.score || 0,
            status: data.overall.status || 'unknown',
            pass: data.overall.pass || false,
            warnings: data.overall.warnings || 0,
            errors: data.overall.errors || 0
          },
          version: version
        });
      }
    }
  } catch (e) { /* ignore */ }

  return entries;
}

export function getHistory() {
  return _history.slice();
}

export function getHistoryByCategory(category) {
  return _history.filter(function(e) { return e.category === category; });
}

export function getHistoryByType(type) {
  return _history.filter(function(e) { return e.type === type; });
}

export function getHistoryCount() {
  return _history.length;
}

export function clearHistory() {
  _history = [];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMemoryCollector = {
    collectAll: collectAll,
    getHistory: getHistory,
    getHistoryByCategory: getHistoryByCategory,
    getHistoryByType: getHistoryByType,
    getHistoryCount: getHistoryCount,
    clearHistory: clearHistory,
    init: function() { 
      console.log('✅ SystemMemoryCollector ready');
      collectAll();
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMemoryCollector = window.systemMemoryCollector;
  }
}
