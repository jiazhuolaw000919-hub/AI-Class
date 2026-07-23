/**
 * Runtime Performance Dashboard
 * Performance Dashboard Data Provider
 * Part 43.12 - Runtime Performance Dashboard Foundation
 */

// ============================================================
// DASHBOARD STATE
// ============================================================

var _dashboardCache = null;
var _isInitialized = false;
var _lastRefreshTime = null;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getReport() {
  return LawAIApp.RuntimePerformanceReport || window.runtimePerformanceReport;
}

function getHealth() {
  return LawAIApp.RuntimePerformanceHealth || window.runtimePerformanceHealth;
}

function getStore() {
  return LawAIApp.RuntimePerformanceStore || window.runtimePerformanceStore;
}

function getAnalyzer() {
  return LawAIApp.RuntimePerformanceAnalyzer || window.runtimePerformanceAnalyzer;
}

function getAPI() {
  return LawAIApp.Performance || window.LawAIApp?.Performance;
}

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Performance Dashboard] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

// ============================================================
// TIMELINE GENERATION
// ============================================================

function generateTimeline(limit) {
  limit = limit || 30;
  var timeline = [];

  try {
    var store = getStore();
    if (!store) return timeline;

    var sessions = safeCall(function() { return store.getCompletedSessions(); }, []);
    if (!sessions || sessions.length === 0) return timeline;

    // Get recent sessions
    var recent = sessions.slice(-limit);

    for (var i = 0; i < recent.length; i++) {
      var session = recent[i];
      var records = session.records || [];

      // Calculate average duration from records
      var durations = records
        .filter(function(r) { return r.status === 'completed' && r.duration !== null && r.duration !== undefined; })
        .map(function(r) { return r.duration; });

      var avgDuration = null;
      if (durations.length > 0) {
        var sum = 0;
        for (var j = 0; j < durations.length; j++) {
          sum += durations[j];
        }
        avgDuration = Math.round(sum / durations.length);
      }

      // Get score from session metadata or calculate
      var score = session.metadata && session.metadata.score ? session.metadata.score : null;
      if (score === null && avgDuration !== null) {
        // Rough score based on average duration (lower is better)
        if (avgDuration < 10) score = 95;
        else if (avgDuration < 25) score = 85;
        else if (avgDuration < 50) score = 70;
        else if (avgDuration < 100) score = 50;
        else score = 30;
      }

      timeline.push({
        timestamp: session.startTime,
        date: new Date(session.startTime).toLocaleDateString(),
        time: new Date(session.startTime).toLocaleTimeString(),
        sessionId: session.id,
        duration: session.duration || 0,
        avgDuration: avgDuration,
        score: score || 0,
        recordCount: records.length,
        status: session.status || 'completed'
      });
    }

    // Sort by timestamp ascending
    timeline.sort(function(a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

  } catch (e) { /* ignore */ }

  return timeline;
}

// ============================================================
// TREND ANALYSIS
// ============================================================

function analyzeTrend(timeline) {
  if (!timeline || timeline.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      confidence: 'low',
      message: 'Insufficient data for trend analysis'
    };
  }

  var scores = timeline.map(function(t) { return t.score || 0; });
  var first = scores[0];
  var last = scores[scores.length - 1];
  var change = last - first;
  var percentChange = first > 0 ? Math.round((change / first) * 100) : 0;

  var direction = 'stable';
  if (change > 5) direction = 'improving';
  else if (change < -5) direction = 'declining';
  else direction = 'stable';

  var confidence = 'medium';
  if (timeline.length >= 10) confidence = 'high';
  else if (timeline.length >= 5) confidence = 'medium';
  else confidence = 'low';

  var message = '';
  if (direction === 'improving') {
    message = 'Performance is improving (' + percentChange + '% increase)';
  } else if (direction === 'declining') {
    message = 'Performance is declining (' + Math.abs(percentChange) + '% decrease)';
  } else {
    message = 'Performance is stable';
  }

  return {
    direction: direction,
    change: change,
    percentChange: percentChange,
    confidence: confidence,
    message: message,
    firstScore: first,
    lastScore: last,
    dataPoints: timeline.length
  };
}

// ============================================================
// MODULE SUMMARY
// ============================================================

function generateModuleSummary() {
  var modules = [];

  try {
    var analyzer = getAnalyzer();
    if (!analyzer) return modules;

    var slowModules = safeCall(function() {
      if (typeof analyzer.getSlowModules === 'function') {
        return analyzer.getSlowModules(10);
      }
      return [];
    }, []);

    if (slowModules && slowModules.length > 0) {
      for (var i = 0; i < slowModules.length; i++) {
        var m = slowModules[i];
        modules.push({
          name: m.target || 'unknown',
          avgDuration: m.average || 0,
          maxDuration: m.max || 0,
          minDuration: m.min || 0,
          count: m.count || 0,
          rank: i + 1
        });
      }
    }
  } catch (e) { /* ignore */ }

  return modules;
}

// ============================================================
// CORE API
// ============================================================

export function getOverview() {
  var result = {
    summary: {
      score: 0,
      status: 'UNKNOWN',
      label: 'Unknown',
      bootDuration: 'N/A',
      totalModules: 0,
      totalRecords: 0,
      hasData: false
    },
    health: {
      score: 0,
      status: 'UNKNOWN',
      label: 'Unknown'
    },
    modules: [],
    warnings: [],
    lastUpdated: new Date().toISOString()
  };

  try {
    var health = getHealth();
    if (health) {
      var healthData = safeCall(function() {
        if (typeof health.getHealthReport === 'function') {
          return health.getHealthReport();
        }
        if (typeof health.evaluate === 'function') {
          return health.evaluate();
        }
        return null;
      });

      if (healthData) {
        result.health.score = healthData.score || 0;
        result.health.status = healthData.status || 'UNKNOWN';
        result.health.label = healthData.label || 'Unknown';

        result.summary.score = healthData.score || 0;
        result.summary.status = healthData.status || 'UNKNOWN';
        result.summary.label = healthData.label || 'Unknown';
        result.summary.hasData = healthData.hasData || false;

        if (healthData.summary) {
          result.summary.bootDuration = healthData.summary.bootDuration || 'N/A';
          result.summary.totalRecords = healthData.summary.totalRecords || 0;
          result.summary.slowestModule = healthData.summary.slowestModule || 'N/A';
        }

        if (healthData.warnings) {
          result.warnings = healthData.warnings;
        }
      }
    }

    // Get module summary
    result.modules = generateModuleSummary();
    result.summary.totalModules = result.modules.length;

    // Try to get report for additional data
    var report = getReport();
    if (report) {
      var reportData = safeCall(function() {
        if (typeof report.getLatest === 'function') {
          return report.getLatest();
        }
        return null;
      });

      if (reportData && reportData.summary) {
        if (reportData.summary.totalModules !== undefined) {
          result.summary.totalModules = reportData.summary.totalModules || 0;
        }
        if (reportData.summary.totalRecords !== undefined) {
          result.summary.totalRecords = reportData.summary.totalRecords || 0;
        }
        if (reportData.summary.bootDuration) {
          result.summary.bootDuration = reportData.summary.bootDuration;
        }
      }
    }

    // Try to get from API
    var api = getAPI();
    if (api) {
      var apiReport = safeCall(function() {
        if (typeof api.report === 'function') {
          return api.report();
        }
        return null;
      });

      if (apiReport && apiReport.summary) {
        if (apiReport.summary.totalModules !== undefined) {
          result.summary.totalModules = apiReport.summary.totalModules || 0;
        }
        if (apiReport.summary.totalRecords !== undefined) {
          result.summary.totalRecords = apiReport.summary.totalRecords || 0;
        }
        if (apiReport.summary.bootDuration) {
          result.summary.bootDuration = apiReport.summary.bootDuration;
        }
        if (apiReport.health) {
          result.health.score = apiReport.health.score || 0;
          result.health.status = apiReport.health.status || 'UNKNOWN';
          result.health.label = apiReport.health.label || 'Unknown';
          result.summary.score = apiReport.health.score || 0;
          result.summary.status = apiReport.health.status || 'UNKNOWN';
          result.summary.label = apiReport.health.label || 'Unknown';
        }
      }
    }

    result.lastUpdated = new Date().toISOString();

  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Performance Dashboard] Error getting overview:', e.message);
    }
  }

  return result;
}

export function getTimeline(limit) {
  limit = limit || 30;
  var timeline = generateTimeline(limit);

  return {
    data: timeline,
    count: timeline.length,
    lastUpdated: new Date().toISOString(),
    hasData: timeline.length > 0
  };
}

export function getTrend(limit) {
  limit = limit || 30;
  var timeline = generateTimeline(limit);
  var trend = analyzeTrend(timeline);

  return {
    trend: trend,
    timeline: timeline,
    dataPoints: timeline.length,
    lastUpdated: new Date().toISOString(),
    hasData: timeline.length > 0
  };
}

export function getModules(limit) {
  limit = limit || 10;
  var modules = generateModuleSummary();

  if (modules.length > limit) {
    modules = modules.slice(0, limit);
  }

  return {
    data: modules,
    count: modules.length,
    lastUpdated: new Date().toISOString(),
    hasData: modules.length > 0
  };
}

export function getSummary() {
  var overview = getOverview();
  var timeline = getTimeline(10);

  return {
    score: overview.summary.score,
    status: overview.summary.status,
    label: overview.summary.label,
    bootDuration: overview.summary.bootDuration,
    totalModules: overview.summary.totalModules,
    totalRecords: overview.summary.totalRecords,
    hasData: overview.summary.hasData,
    warnings: overview.warnings.length,
    recentTimeline: timeline.data.slice(-5),
    lastUpdated: overview.lastUpdated
  };
}

export function getCompleteDashboard() {
  var overview = getOverview();
  var timeline = getTimeline(30);
  var trend = getTrend(30);
  var modules = getModules(10);

  var dashboard = {
    summary: overview.summary,
    health: overview.health,
    modules: modules.data,
    warnings: overview.warnings,
    timeline: timeline.data,
    trend: trend.trend,
    lastUpdated: new Date().toISOString(),
    hasData: overview.summary.hasData || timeline.hasData || modules.hasData
  };

  _dashboardCache = dashboard;
  return dashboard;
}

export function refresh() {
  _lastRefreshTime = new Date().toISOString();

  if (isDebugMode()) {
    console.log('[Performance Dashboard] Refreshing...');
  }

  var dashboard = getCompleteDashboard();

  if (isDebugMode()) {
    console.log('[Performance Dashboard] Timeline Updated:', dashboard.timeline.length + ' points');
    console.log('[Performance Dashboard] Score:', dashboard.summary.score);
    console.log('[Performance Dashboard] Status:', dashboard.summary.label);
  }

  return dashboard;
}

export function getLatest() {
  if (!_dashboardCache) {
    return refresh();
  }
  return _dashboardCache;
}

export function reset() {
  _dashboardCache = null;
  _lastRefreshTime = null;
  if (isDebugMode()) {
    console.log('[Performance Dashboard] Reset');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initDashboard() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _isInitialized = true;

  // Initial refresh
  refresh();

  if (isDebugMode()) {
    console.log('[Performance Dashboard] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceDashboard = {
    getOverview: getOverview,
    getTimeline: getTimeline,
    getTrend: getTrend,
    getModules: getModules,
    getSummary: getSummary,
    getCompleteDashboard: getCompleteDashboard,
    refresh: refresh,
    getLatest: getLatest,
    reset: reset,
    init: function() {
      var result = initDashboard();
      console.log('✅ RuntimePerformanceDashboard ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceDashboard = window.runtimePerformanceDashboard;
  }
}
