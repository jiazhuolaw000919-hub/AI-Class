/**
 * Runtime Performance Report
 * Performance Report Generator
 * Part 43.8 - Runtime Performance Report System Implementation
 */

// ============================================================
// REPORT STATE
// ============================================================

var _reportCache = null;
var _reportHistory = [];
var _isInitialized = false;
var _maxReports = 20;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getHealth() {
  return LawAIApp.RuntimePerformanceHealth || window.runtimePerformanceHealth;
}

function getStore() {
  return LawAIApp.RuntimePerformanceStore || window.runtimePerformanceStore;
}

function getAnalyzer() {
  return LawAIApp.RuntimePerformanceAnalyzer || window.runtimePerformanceAnalyzer;
}

function getManifest() {
  return LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
}

function isDebugMode() {
  try {
    var manifest = getManifest();
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function getHistoryLimit() {
  try {
    var manifest = getManifest();
    if (manifest && typeof manifest.getHistoryLimit === 'function') {
      return manifest.getHistoryLimit();
    }
  } catch (e) { /* ignore */ }
  return 20;
}

function generateReportId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  var random = Math.random().toString(36).substring(2, 6);
  return 'report_' + timestamp + '_' + random;
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return 'N/A';
  if (ms < 1) return ms.toFixed(2) + 'ms';
  if (ms < 1000) return Math.round(ms) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

function getStatusLabel(status) {
  var labels = {
    'EXCELLENT': 'Excellent',
    'GOOD': 'Good',
    'WARNING': 'Warning',
    'CRITICAL': 'Critical',
    'UNKNOWN': 'Unknown'
  };
  return labels[status] || status;
}

// ============================================================
// SUMMARY GENERATION
// ============================================================

function generateSummary(healthResult, store) {
  var summary = {
    totalModules: 0,
    averageDuration: 'N/A',
    slowestModule: 'N/A',
    fastestModule: 'N/A',
    totalRecords: 0,
    bootDuration: 'N/A',
    hasData: false
  };

  if (!healthResult || !healthResult.hasData) {
    return summary;
  }

  summary.hasData = true;

  // Get from health summary
  if (healthResult.summary) {
    var s = healthResult.summary;
    summary.totalRecords = s.totalRecords || 0;
    summary.bootDuration = s.bootDuration || 'N/A';
    summary.slowestModule = s.slowestModule || 'N/A';
    summary.fastestModule = s.fastestModule || 'N/A';
    summary.totalModules = 0;
    summary.averageDuration = s.averageDuration !== null ? formatDuration(s.averageDuration) : 'N/A';
  }

  // Try to get module count from store
  try {
    var sessions = store ? store.getCompletedSessions() : [];
    if (sessions && sessions.length > 0) {
      var lastSession = sessions[sessions.length - 1];
      if (lastSession && lastSession.records) {
        var moduleSet = {};
        for (var i = 0; i < lastSession.records.length; i++) {
          var r = lastSession.records[i];
          if (r.target && r.target !== 'Boot') {
            moduleSet[r.target] = true;
          }
        }
        summary.totalModules = Object.keys(moduleSet).length;
      }
    }
  } catch (e) { /* ignore */ }

  return summary;
}

// ============================================================
// MODULE REPORT GENERATION
// ============================================================

function generateModuleReport(analysis) {
  var modules = [];

  if (!analysis || !analysis.modules) {
    return modules;
  }

  var moduleNames = Object.keys(analysis.modules);
  for (var i = 0; i < moduleNames.length; i++) {
    var name = moduleNames[i];
    var stats = analysis.modules[name];
    if (stats && stats.average !== null) {
      modules.push({
        name: name,
        averageDuration: stats.average,
        maxDuration: stats.max,
        minDuration: stats.min,
        count: stats.count,
        formattedAverage: formatDuration(stats.average),
        formattedMax: formatDuration(stats.max),
        formattedMin: formatDuration(stats.min)
      });
    }
  }

  // Sort by average duration (slowest first)
  modules.sort(function(a, b) {
    return (b.average || 0) - (a.average || 0);
  });

  // Add rank
  for (var i = 0; i < modules.length; i++) {
    modules[i].rank = i + 1;
  }

  return modules;
}

// ============================================================
// WARNING REPORT GENERATION
// ============================================================

function generateWarningReport(healthResult) {
  if (!healthResult || !healthResult.warnings) {
    return [];
  }

  return healthResult.warnings.map(function(w) {
    return {
      type: w.type || 'unknown',
      target: w.target || null,
      message: w.message || 'Unknown warning',
      severity: w.severity || 'medium'
    };
  });
}

// ============================================================
// METRIC REPORT GENERATION
// ============================================================

function generateMetricReport(analysis) {
  var metrics = [];

  if (!analysis || !analysis.statistics || !analysis.statistics.byMetric) {
    return metrics;
  }

  var metricNames = Object.keys(analysis.statistics.byMetric);
  for (var i = 0; i < metricNames.length; i++) {
    var name = metricNames[i];
    var stats = analysis.statistics.byMetric[name];
    if (stats && stats.average !== null) {
      metrics.push({
        id: name,
        averageDuration: stats.average,
        maxDuration: stats.max,
        minDuration: stats.min,
        count: stats.count,
        formattedAverage: formatDuration(stats.average),
        formattedMax: formatDuration(stats.max),
        formattedMin: formatDuration(stats.min)
      });
    }
  }

  metrics.sort(function(a, b) {
    return (b.average || 0) - (a.average || 0);
  });

  return metrics;
}

// ============================================================
// CORE API
// ============================================================

export function generate() {
  var health = getHealth();
  var store = getStore();
  var analyzer = getAnalyzer();

  if (!health) {
    if (isDebugMode()) {
      console.warn('[Performance Report] Health not available');
    }
    return getDefaultReport();
  }

  if (isDebugMode()) {
    console.log('[Performance Report] Generating Report...');
  }

  // Get health result
  var healthResult = null;
  if (typeof health.getHealthReport === 'function') {
    healthResult = health.getHealthReport();
  } else if (typeof health.evaluate === 'function') {
    healthResult = health.evaluate();
  }

  if (!healthResult || !healthResult.hasData) {
    if (isDebugMode()) {
      console.warn('[Performance Report] No health data available');
    }
    return getDefaultReport();
  }

  // Get analysis for module data
  var analysis = null;
  if (analyzer && typeof analyzer.analyze === 'function') {
    analysis = analyzer.analyze();
  }

  // Generate report
  var report = {
    id: generateReportId(),
    timestamp: new Date().toISOString(),
    summary: generateSummary(healthResult, store),
    health: {
      score: healthResult.score || 0,
      status: healthResult.status || 'UNKNOWN',
      label: getStatusLabel(healthResult.status),
      statusLabel: getStatusLabel(healthResult.status)
    },
    metrics: generateMetricReport(analysis),
    modules: generateModuleReport(analysis),
    warnings: generateWarningReport(healthResult),
    metadata: {
      generatedBy: 'RuntimePerformanceReport',
      version: '1.0.0',
      sessionId: 'current'
    }
  };

  // Add module count to summary
  report.summary.totalModules = report.modules.length;

  // Cache report
  _reportCache = report;

  // Store in history
  _reportHistory.push(report);

  // Trim history
  var limit = getHistoryLimit();
  if (_reportHistory.length > limit) {
    _reportHistory = _reportHistory.slice(-limit);
  }

  if (isDebugMode()) {
    console.log('[Performance Report] Generated');
    console.log('[Performance Report] Score:', report.health.score);
    console.log('[Performance Report] Status:', report.health.label);
    console.log('[Performance Report] Modules:', report.modules.length);
  }

  return report;
}

export function getLatest() {
  if (!_reportCache) {
    generate();
  }
  return _reportCache || getDefaultReport();
}

export function getHistory() {
  return _reportHistory.slice();
}

export function getReport(id) {
  for (var i = 0; i < _reportHistory.length; i++) {
    if (_reportHistory[i].id === id) {
      return _reportHistory[i];
    }
  }
  return null;
}

export function exportReport(format) {
  format = format || 'json';
  var report = getLatest();

  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  if (format === 'markdown') {
    return generateMarkdownReport(report);
  }

  if (isDebugMode()) {
    console.warn('[Performance Report] Unknown export format:', format);
  }
  return JSON.stringify(report, null, 2);
}

function generateMarkdownReport(report) {
  var lines = [];
  lines.push('# Runtime Performance Report');
  lines.push('');
  lines.push('**Generated:** ' + new Date(report.timestamp).toLocaleString());
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push('| Performance Score | ' + report.health.score + '% |');
  lines.push('| Status | ' + report.health.label + ' |');
  lines.push('| Boot Duration | ' + report.summary.bootDuration + ' |');
  lines.push('| Total Modules | ' + report.summary.totalModules + ' |');
  lines.push('| Total Records | ' + report.summary.totalRecords + ' |');
  lines.push('| Average Duration | ' + report.summary.averageDuration + ' |');
  lines.push('| Slowest Module | ' + report.summary.slowestModule + ' |');
  lines.push('| Fastest Module | ' + report.summary.fastestModule + ' |');
  lines.push('');

  if (report.warnings && report.warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (var i = 0; i < report.warnings.length; i++) {
      var w = report.warnings[i];
      lines.push('- **' + (w.type || 'Warning') + '**: ' + w.message);
    }
    lines.push('');
  }

  if (report.modules && report.modules.length > 0) {
    lines.push('## Module Performance');
    lines.push('');
    lines.push('| Rank | Module | Average | Max | Count |');
    lines.push('|------|--------|---------|-----|-------|');
    var topModules = report.modules.slice(0, 10);
    for (var i = 0; i < topModules.length; i++) {
      var m = topModules[i];
      lines.push('| ' + m.rank + ' | ' + m.name + ' | ' + m.formattedAverage + ' | ' + m.formattedMax + ' | ' + m.count + ' |');
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getDefaultReport() {
  return {
    id: 'report_default',
    timestamp: new Date().toISOString(),
    summary: {
      totalModules: 0,
      averageDuration: 'N/A',
      slowestModule: 'N/A',
      fastestModule: 'N/A',
      totalRecords: 0,
      bootDuration: 'N/A',
      hasData: false
    },
    health: {
      score: 0,
      status: 'UNKNOWN',
      label: 'Unknown',
      statusLabel: 'Unknown'
    },
    metrics: [],
    modules: [],
    warnings: [{ type: 'no_data', message: 'No performance data available' }],
    metadata: {
      generatedBy: 'RuntimePerformanceReport',
      version: '1.0.0',
      isDefault: true
    }
  };
}

export function reset() {
  _reportCache = null;
  _reportHistory = [];
  if (isDebugMode()) {
    console.log('[Performance Report] Reset');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initReport() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _maxReports = getHistoryLimit();
  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Performance Report] Initialized, Max Reports:', _maxReports);
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceReport = {
    generate: generate,
    getLatest: getLatest,
    getHistory: getHistory,
    getReport: getReport,
    exportReport: exportReport,
    reset: reset,
    init: function() {
      var result = initReport();
      console.log('✅ RuntimePerformanceReport ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceReport = window.runtimePerformanceReport;
  }
}
