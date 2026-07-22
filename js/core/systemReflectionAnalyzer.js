/**
 * System Reflection Analyzer
 * Compares historical snapshots from existing systems.
 * Uses existing data only – no business logic.
 */

import { REFLECTION_CATEGORIES } from './systemReflectionManifest.js';

// Store historical snapshots for comparison
var _snapshots = [];

export function captureSnapshot() {
  var snapshot = {
    timestamp: new Date().toISOString(),
    boot: getBootSnapshot(),
    runtime: getRuntimeSnapshot(),
    architecture: getArchitectureSnapshot(),
    governance: getGovernanceSnapshot(),
    memory: getMemorySnapshot(),
    health: getHealthSnapshot(),
    recovery: getRecoverySnapshot(),
    version: getVersionSnapshot()
  };
  
  _snapshots.push(snapshot);
  
  // Keep last 50 snapshots
  if (_snapshots.length > 50) {
    _snapshots = _snapshots.slice(-50);
  }
  
  return snapshot;
}

function getBootSnapshot() {
  try {
    var bootManager = LawAIApp.BootManager || window.bootManager;
    if (bootManager && typeof bootManager.getStatus === 'function') {
      var status = bootManager.getStatus();
      return {
        booted: status.booted || false,
        stagesComplete: Object.values(status.stages || {}).filter(function(v) { return v; }).length,
        totalStages: Object.keys(status.stages || {}).length
      };
    }
  } catch (e) { /* ignore */ }
  return { booted: false, stagesComplete: 0, totalStages: 0 };
}

function getRuntimeSnapshot() {
  try {
    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    var result = { status: 'unknown', ready: false, uptime: 0 };
    
    if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
      result.status = runtimeStatus.getStatus();
      result.ready = runtimeStatus.isReady ? runtimeStatus.isReady() : false;
    }
    
    var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
    if (runtimeKernel && typeof runtimeKernel.health === 'function') {
      var health = runtimeKernel.health();
      result.uptime = health.uptime || 0;
    }
    
    return result;
  } catch (e) { /* ignore */ }
  return { status: 'unknown', ready: false, uptime: 0 };
}

function getArchitectureSnapshot() {
  try {
    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (archValidator) {
      var warnings = archValidator.warnings || [];
      var violations = archValidator.violations || [];
      return {
        warnings: warnings.length,
        violations: violations.length,
        passed: warnings.length === 0 && violations.length === 0
      };
    }
  } catch (e) { /* ignore */ }
  return { warnings: 0, violations: 0, passed: false };
}

function getGovernanceSnapshot() {
  try {
    var govHealth = LawAIApp.GovernanceHealth || window.governanceHealth;
    if (govHealth && typeof govHealth.getHealth === 'function') {
      var data = govHealth.getHealth();
      return {
        score: data.governanceScore || 0,
        status: data.status || 'unknown',
        warnings: data.warnings || 0,
        violations: data.violations || 0
      };
    }
  } catch (e) { /* ignore */ }
  return { score: 0, status: 'unknown', warnings: 0, violations: 0 };
}

function getMemorySnapshot() {
  try {
    var memoryCollector = LawAIApp.SystemMemoryCollector || window.systemMemoryCollector;
    if (memoryCollector && typeof memoryCollector.getHistoryCount === 'function') {
      return {
        totalEntries: memoryCollector.getHistoryCount()
      };
    }
  } catch (e) { /* ignore */ }
  return { totalEntries: 0 };
}

function getHealthSnapshot() {
  try {
    var runtimeHealth = LawAIApp.RuntimeHealth || window.runtimeHealth;
    var result = { runtimeHealth: 0, lifecycleHealth: 0 };
    
    if (runtimeHealth && typeof runtimeHealth.getHealth === 'function') {
      var data = runtimeHealth.getHealth();
      result.runtimeHealth = data.healthScore || 0;
    }
    
    var lifecycleHealth = LawAIApp.LifecycleHealth || window.lifecycleHealth;
    if (lifecycleHealth && typeof lifecycleHealth.getHealth === 'function') {
      var data = lifecycleHealth.getHealth();
      result.lifecycleHealth = data.lifecycleScore || 0;
    }
    
    return result;
  } catch (e) { /* ignore */ }
  return { runtimeHealth: 0, lifecycleHealth: 0 };
}

function getRecoverySnapshot() {
  try {
    var recReport = LawAIApp.RecoveryReport || window.recoveryReport;
    if (recReport && typeof recReport.getReport === 'function') {
      var data = recReport.getReport();
      if (data && data.overall) {
        return {
          score: data.overall.score || 0,
          status: data.overall.status || 'unknown',
          pass: data.overall.pass || false
        };
      }
    }
  } catch (e) { /* ignore */ }
  return { score: 0, status: 'unknown', pass: false };
}

function getVersionSnapshot() {
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      if (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) {
        return { version: LawAIApp.SystemComposer.version };
      }
      if (LawAIApp.BootManager && typeof LawAIApp.BootManager.getStatus === 'function') {
        return { version: '3.3.3' };
      }
    }
  } catch (e) { /* ignore */ }
  return { version: 'N/A' };
}

export function analyzeTrends() {
  var snapshots = _snapshots;
  var trends = {};
  
  if (snapshots.length < 2) {
    return {
      snapshots: snapshots.length,
      trends: {},
      message: 'Not enough snapshots for trend analysis (need at least 2)'
    };
  }
  
  var categories = REFLECTION_CATEGORIES;
  
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    var values = snapshots.map(function(s) {
      return s[category.id];
    }).filter(function(v) { return v !== null && v !== undefined; });
    
    if (values.length >= 2) {
      trends[category.id] = analyzeCategoryTrend(category.id, values, snapshots);
    } else {
      trends[category.id] = {
        trend: 'insufficient_data',
        confidence: 0,
        message: 'Insufficient data for trend analysis'
      };
    }
  }
  
  return {
    snapshots: snapshots.length,
    trends: trends,
    generated: new Date().toISOString()
  };
}

function analyzeCategoryTrend(categoryId, values, snapshots) {
  var result = {
    trend: 'unknown',
    confidence: 0,
    current: values[values.length - 1],
    previous: values.length > 1 ? values[values.length - 2] : null,
    first: values[0],
    change: 0,
    direction: 'stable'
  };
  
  // Calculate change
  if (values.length >= 2) {
    var current = values[values.length - 1];
    var previous = values[values.length - 2];
    var change = 0;
    
    // Extract numeric value for comparison
    var currentVal = extractNumeric(current);
    var previousVal = extractNumeric(previous);
    var firstVal = extractNumeric(values[0]);
    
    if (previousVal !== null && currentVal !== null) {
      change = currentVal - previousVal;
      result.change = change;
      result.current = currentVal;
      result.previous = previousVal;
      result.first = firstVal;
      
      if (change > 0.1) {
        result.direction = 'increasing';
      } else if (change < -0.1) {
        result.direction = 'decreasing';
      } else {
        result.direction = 'stable';
      }
      
      // Determine trend type based on category
      if (categoryId === 'health' || categoryId === 'governance') {
        if (currentVal > firstVal) {
          result.trend = 'improving';
          result.confidence = Math.min(100, Math.round(70 + (currentVal - firstVal) / 10));
        } else if (currentVal < firstVal) {
          result.trend = 'declining';
          result.confidence = Math.min(100, Math.round(70 + (firstVal - currentVal) / 10));
        } else {
          result.trend = 'stable';
          result.confidence = 80;
        }
      } else if (categoryId === 'memory') {
        if (currentVal > firstVal) {
          result.trend = 'growing';
          result.confidence = Math.min(100, Math.round(70 + (currentVal - firstVal) / 10));
        } else {
          result.trend = 'stable';
          result.confidence = 80;
        }
      } else {
        result.trend = result.direction;
        result.confidence = Math.min(100, Math.round(70 + Math.abs(change) * 5));
      }
    }
  }
  
  return result;
}

function extractNumeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    // Try to extract score from object
    if (value.score !== undefined) return value.score;
    if (value.healthScore !== undefined) return value.healthScore;
    if (value.runtimeHealth !== undefined) return value.runtimeHealth;
    if (value.totalEntries !== undefined) return value.totalEntries;
    if (value.warnings !== undefined) return -value.warnings;
  }
  return null;
}

export function getSnapshots() {
  return _snapshots.slice();
}

export function getSnapshotCount() {
  return _snapshots.length;
}

export function clearSnapshots() {
  _snapshots = [];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemReflectionAnalyzer = {
    captureSnapshot: captureSnapshot,
    analyzeTrends: analyzeTrends,
    getSnapshots: getSnapshots,
    getSnapshotCount: getSnapshotCount,
    clearSnapshots: clearSnapshots,
    init: function() {
      console.log('✅ SystemReflectionAnalyzer ready');
      captureSnapshot();
      var trends = analyzeTrends();
      console.log('📊 Reflection Analysis:', trends.snapshots + ' snapshots, ' + Object.keys(trends.trends).length + ' trend categories');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemReflectionAnalyzer = window.systemReflectionAnalyzer;
  }
}
