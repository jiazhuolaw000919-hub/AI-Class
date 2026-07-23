/**
 * Runtime Performance Analyzer
 * Performance Analysis Engine
 * Part 43.6 - Runtime Performance Analyzer Implementation
 */

// ============================================================
// ANALYZER STATE
// ============================================================

var _analysisCache = null;
var _isInitialized = false;
var _bottleneckThreshold = 100; // ms

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getStore() {
  return LawAIApp.RuntimePerformanceStore || window.runtimePerformanceStore;
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

function getBottleneckThreshold() {
  try {
    var manifest = getManifest();
    if (manifest && manifest.getConfig) {
      var config = manifest.getConfig();
      return config.bottleneckThreshold || 100;
    }
  } catch (e) { /* ignore */ }
  return 100;
}

// ============================================================
// STATISTICS CALCULATION
// ============================================================

function calculateStatistics(records) {
  if (!records || records.length === 0) {
    return {
      count: 0,
      average: null,
      total: 0,
      min: null,
      max: null,
      median: null,
      p95: null
    };
  }

  var durations = records
    .filter(function(r) { return r.status === 'completed' && r.duration !== null && r.duration !== undefined; })
    .map(function(r) { return r.duration; });

  if (durations.length === 0) {
    return {
      count: 0,
      average: null,
      total: 0,
      min: null,
      max: null,
      median: null,
      p95: null
    };
  }

  var sorted = durations.slice().sort(function(a, b) { return a - b; });
  var sum = 0;
  for (var i = 0; i < durations.length; i++) {
    sum += durations[i];
  }

  var median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  var p95Index = Math.floor(sorted.length * 0.95);
  var p95 = p95Index < sorted.length ? sorted[p95Index] : sorted[sorted.length - 1];

  return {
    count: durations.length,
    average: Math.round(sum / durations.length),
    total: sum,
    min: sorted[0] || null,
    max: sorted[sorted.length - 1] || null,
    median: Math.round(median),
    p95: Math.round(p95)
  };
}

function groupByTarget(records) {
  var groups = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var target = record.target || 'unknown';
    if (!groups[target]) {
      groups[target] = [];
    }
    groups[target].push(record);
  }
  return groups;
}

function groupByMetric(records) {
  var groups = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var metricId = record.metricId || 'unknown';
    if (!groups[metricId]) {
      groups[metricId] = [];
    }
    groups[metricId].push(record);
  }
  return groups;
}

// ============================================================
// BOTTLENECK DETECTION
// ============================================================

function detectBottlenecks(records, threshold) {
  threshold = threshold || getBottleneckThreshold();

  var bottlenecks = [];

  // Group by target
  var groups = groupByTarget(records);
  var targetNames = Object.keys(groups);

  for (var i = 0; i < targetNames.length; i++) {
    var target = targetNames[i];
    var group = groups[target];
    var stats = calculateStatistics(group);

    if (stats.max !== null && stats.max > threshold) {
      bottlenecks.push({
        type: 'slow_module',
        target: target,
        maxDuration: stats.max,
        averageDuration: stats.average,
        threshold: threshold,
        severity: stats.max > threshold * 2 ? 'high' : 'medium',
        count: stats.count
      });
    }
  }

  // Group by metric
  var metricGroups = groupByMetric(records);
  var metricNames = Object.keys(metricGroups);

  for (var i = 0; i < metricNames.length; i++) {
    var metricId = metricNames[i];
    var group = metricGroups[metricId];
    var stats = calculateStatistics(group);

    if (stats.max !== null && stats.max > threshold) {
      bottlenecks.push({
        type: 'slow_metric',
        metricId: metricId,
        maxDuration: stats.max,
        averageDuration: stats.average,
        threshold: threshold,
        severity: stats.max > threshold * 2 ? 'high' : 'medium',
        count: stats.count
      });
    }
  }

  // Sort by severity and duration
  bottlenecks.sort(function(a, b) {
    if (a.severity === b.severity) {
      return (b.maxDuration || 0) - (a.maxDuration || 0);
    }
    return a.severity === 'high' ? -1 : 1;
  });

  return bottlenecks;
}

function detectRegression(previousStats, currentStats) {
  if (!previousStats || !currentStats) return null;

  var regressions = [];

  // Check average regression
  if (previousStats.average !== null && currentStats.average !== null) {
    var diff = currentStats.average - previousStats.average;
    if (diff > 10) {
      regressions.push({
        type: 'average_regression',
        previous: previousStats.average,
        current: currentStats.average,
        diff: diff,
        severity: diff > 50 ? 'high' : 'medium'
      });
    }
  }

  // Check max regression
  if (previousStats.max !== null && currentStats.max !== null) {
    var diff = currentStats.max - previousStats.max;
    if (diff > 20) {
      regressions.push({
        type: 'max_regression',
        previous: previousStats.max,
        current: currentStats.max,
        diff: diff,
        severity: diff > 100 ? 'high' : 'medium'
      });
    }
  }

  return regressions;
}

// ============================================================
// CORE API
// ============================================================

export function analyze(sessionId) {
  var store = getStore();
  if (!store) {
    if (isDebugMode()) {
      console.warn('[Performance Analyzer] Store not available');
    }
    return null;
  }

  // Get records
  var records = [];
  if (sessionId) {
    records = store.getRecords(sessionId);
  } else {
    // Get current session records
    records = store.getCurrentRecords();
    // If no current records, use completed sessions
    if (!records || records.length === 0) {
      var sessions = store.getCompletedSessions();
      if (sessions && sessions.length > 0) {
        records = sessions[sessions.length - 1].records || [];
      }
    }
  }

  if (!records || records.length === 0) {
    if (isDebugMode()) {
      console.warn('[Performance Analyzer] No records to analyze');
    }
    return {
      summary: { totalRecords: 0, hasData: false },
      statistics: {},
      modules: {},
      bottlenecks: [],
      timestamp: new Date().toISOString()
    };
  }

  if (isDebugMode()) {
    console.log('[Performance Analyzer] Analysis Started, Records:', records.length);
  }

  // Calculate overall statistics
  var overallStats = calculateStatistics(records);

  // Group by target
  var targetGroups = groupByTarget(records);
  var targetNames = Object.keys(targetGroups);
  var moduleStats = {};

  for (var i = 0; i < targetNames.length; i++) {
    var target = targetNames[i];
    moduleStats[target] = calculateStatistics(targetGroups[target]);
  }

  // Group by metric
  var metricGroups = groupByMetric(records);
  var metricNames = Object.keys(metricGroups);
  var metricStats = {};

  for (var i = 0; i < metricNames.length; i++) {
    var metricId = metricNames[i];
    metricStats[metricId] = calculateStatistics(metricGroups[metricId]);
  }

  // Detect bottlenecks
  var bottlenecks = detectBottlenecks(records);

  // Build result
  var result = {
    summary: {
      totalRecords: records.length,
      completedRecords: records.filter(function(r) { return r.status === 'completed'; }).length,
      totalDuration: overallStats.total,
      averageDuration: overallStats.average,
      maxDuration: overallStats.max,
      minDuration: overallStats.min,
      hasData: true
    },
    statistics: {
      overall: overallStats,
      byTarget: moduleStats,
      byMetric: metricStats
    },
    modules: moduleStats,
    bottlenecks: bottlenecks,
    slowestModule: null,
    fastestModule: null,
    timestamp: new Date().toISOString()
  };

  // Find slowest and fastest modules
  var moduleDurations = [];
  for (var target in moduleStats) {
    if (moduleStats.hasOwnProperty(target)) {
      var stats = moduleStats[target];
      if (stats.average !== null) {
        moduleDurations.push({
          target: target,
          average: stats.average,
          max: stats.max,
          min: stats.min
        });
      }
    }
  }

  if (moduleDurations.length > 0) {
    moduleDurations.sort(function(a, b) { return (b.average || 0) - (a.average || 0); });
    result.slowestModule = moduleDurations[0] || null;
    result.fastestModule = moduleDurations[moduleDurations.length - 1] || null;
  }

  // Cache result
  _analysisCache = result;

  if (isDebugMode()) {
    console.log('[Performance Analyzer] Analysis Completed');
    if (result.bottlenecks.length > 0) {
      console.warn('[Performance Analyzer] Bottlenecks Detected:', result.bottlenecks.length);
    }
  }

  return result;
}

export function analyzeHistory(limit) {
  limit = limit || 10;
  var store = getStore();
  if (!store) {
    if (isDebugMode()) {
      console.warn('[Performance Analyzer] Store not available');
    }
    return null;
  }

  var sessions = store.getCompletedSessions();
  if (!sessions || sessions.length === 0) {
    return {
      sessions: [],
      summary: { totalSessions: 0, hasData: false }
    };
  }

  // Get last N sessions
  var recentSessions = sessions.slice(-limit);
  var results = [];

  for (var i = 0; i < recentSessions.length; i++) {
    var session = recentSessions[i];
    var analysis = analyze(session.id);
    if (analysis) {
      results.push({
        sessionId: session.id,
        startTime: session.startTime,
        duration: session.duration,
        analysis: analysis
      });
    }
  }

  return {
    sessions: results,
    summary: {
      totalSessions: results.length,
      averageDuration: 0,
      hasData: results.length > 0
    }
  };
}

export function getStatistics() {
  if (_analysisCache) {
    return _analysisCache.statistics;
  }
  var result = analyze();
  return result ? result.statistics : null;
}

export function findBottlenecks(threshold) {
  if (_analysisCache) {
    return _analysisCache.bottlenecks;
  }
  var result = analyze();
  return result ? result.bottlenecks : [];
}

export function compareSessions(sessionId1, sessionId2) {
  var analysis1 = analyze(sessionId1);
  var analysis2 = analyze(sessionId2);

  if (!analysis1 || !analysis2) {
    if (isDebugMode()) {
      console.warn('[Performance Analyzer] Cannot compare, missing analysis');
    }
    return null;
  }

  var comparison = {
    session1: {
      id: sessionId1,
      totalDuration: analysis1.summary.totalDuration,
      averageDuration: analysis1.summary.averageDuration,
      recordCount: analysis1.summary.totalRecords
    },
    session2: {
      id: sessionId2,
      totalDuration: analysis2.summary.totalDuration,
      averageDuration: analysis2.summary.averageDuration,
      recordCount: analysis2.summary.totalRecords
    },
    differences: {},
    regressions: []
  };

  // Calculate differences
  comparison.differences.totalDuration = analysis2.summary.totalDuration - analysis1.summary.totalDuration;
  comparison.differences.averageDuration = analysis2.summary.averageDuration - analysis1.summary.averageDuration;

  // Detect regressions
  if (analysis1.statistics.overall && analysis2.statistics.overall) {
    var regressions = detectRegression(
      analysis1.statistics.overall,
      analysis2.statistics.overall
    );
    if (regressions) {
      comparison.regressions = regressions;
    }
  }

  return comparison;
}

export function getSlowModules(limit) {
  limit = limit || 5;
  var result = analyze();
  if (!result || !result.modules) return [];

  var modules = [];
  for (var target in result.modules) {
    if (result.modules.hasOwnProperty(target)) {
      var stats = result.modules[target];
      if (stats.average !== null) {
        modules.push({
          target: target,
          average: stats.average,
          max: stats.max,
          min: stats.min,
          count: stats.count
        });
      }
    }
  }

  modules.sort(function(a, b) { return (b.average || 0) - (a.average || 0); });
  return modules.slice(0, limit);
}

export function reset() {
  _analysisCache = null;
  if (isDebugMode()) {
    console.log('[Performance Analyzer] Cache reset');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initAnalyzer() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _bottleneckThreshold = getBottleneckThreshold();
  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Performance Analyzer] Initialized, Threshold:', _bottleneckThreshold + 'ms');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceAnalyzer = {
    analyze: analyze,
    analyzeHistory: analyzeHistory,
    getStatistics: getStatistics,
    findBottlenecks: findBottlenecks,
    compareSessions: compareSessions,
    getSlowModules: getSlowModules,
    reset: reset,
    init: function() {
      var result = initAnalyzer();
      console.log('✅ RuntimePerformanceAnalyzer ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceAnalyzer = window.runtimePerformanceAnalyzer;
  }
}
