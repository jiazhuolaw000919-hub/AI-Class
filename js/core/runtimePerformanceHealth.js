/**
 * Runtime Performance Health
 * Performance Evaluation Engine
 * Part 43.7 - Runtime Performance Health System Implementation
 */

// ============================================================
// HEALTH STATE
// ============================================================

var _healthCache = null;
var _isInitialized = false;

// ============================================================
// CONFIGURATION
// ============================================================

var STATUS_THRESHOLDS = {
  EXCELLENT: { min: 90, label: 'Excellent' },
  GOOD: { min: 70, label: 'Good' },
  WARNING: { min: 50, label: 'Warning' },
  CRITICAL: { min: 0, label: 'Critical' }
};

var DEFAULT_THRESHOLDS = {
  bootDurationWarning: 100,   // ms
  bootDurationCritical: 200,  // ms
  moduleDurationWarning: 50,  // ms
  moduleDurationCritical: 100, // ms
  bottleneckThreshold: 50,    // ms
  regressionThreshold: 20     // ms
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

function getThresholds() {
  try {
    var manifest = getManifest();
    if (manifest && manifest.getConfig) {
      var config = manifest.getConfig();
      return config.healthThresholds || DEFAULT_THRESHOLDS;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_THRESHOLDS;
}

// ============================================================
// STATUS EVALUATION
// ============================================================

function evaluateStatus(score) {
  if (score >= STATUS_THRESHOLDS.EXCELLENT.min) {
    return { status: 'EXCELLENT', label: 'Excellent' };
  } else if (score >= STATUS_THRESHOLDS.GOOD.min) {
    return { status: 'GOOD', label: 'Good' };
  } else if (score >= STATUS_THRESHOLDS.WARNING.min) {
    return { status: 'WARNING', label: 'Warning' };
  } else {
    return { status: 'CRITICAL', label: 'Critical' };
  }
}

// ============================================================
// SCORE CALCULATION
// ============================================================

function calculateScore(analysis, thresholds) {
  if (!analysis || !analysis.summary || !analysis.summary.hasData) {
    return { score: 0, details: { reason: 'No data available' } };
  }

  var score = 100;
  var deductions = [];
  var warnings = [];

  var thresholds = thresholds || DEFAULT_THRESHOLDS;

  // Check boot duration
  var bootStats = analysis.statistics.byMetric ? analysis.statistics.byMetric['runtime.boot.duration'] : null;
  if (bootStats && bootStats.average !== null) {
    if (bootStats.average > thresholds.bootDurationCritical) {
      score -= 20;
      deductions.push('Boot duration critical: ' + bootStats.average + 'ms');
      warnings.push({ type: 'boot_critical', message: 'Boot duration: ' + bootStats.average + 'ms (critical)' });
    } else if (bootStats.average > thresholds.bootDurationWarning) {
      score -= 10;
      deductions.push('Boot duration warning: ' + bootStats.average + 'ms');
      warnings.push({ type: 'boot_warning', message: 'Boot duration: ' + bootStats.average + 'ms (warning)' });
    }
  }

  // Check module durations
  var moduleStats = analysis.modules || {};
  var moduleNames = Object.keys(moduleStats);
  var slowModules = [];

  for (var i = 0; i < moduleNames.length; i++) {
    var name = moduleNames[i];
    var stats = moduleStats[name];
    if (stats && stats.average !== null) {
      if (stats.average > thresholds.moduleDurationCritical) {
        slowModules.push({ name: name, duration: stats.average, severity: 'critical' });
      } else if (stats.average > thresholds.moduleDurationWarning) {
        slowModules.push({ name: name, duration: stats.average, severity: 'warning' });
      }
    }
  }

  if (slowModules.length > 0) {
    // Deduct for each slow module
    for (var i = 0; i < slowModules.length; i++) {
      var sm = slowModules[i];
      if (sm.severity === 'critical') {
        score -= 10;
        deductions.push('Module critical: ' + sm.name + ' (' + sm.duration + 'ms)');
        warnings.push({ type: 'module_critical', target: sm.name, message: 'Module execution exceeded critical threshold: ' + sm.duration + 'ms' });
      } else {
        score -= 5;
        deductions.push('Module warning: ' + sm.name + ' (' + sm.duration + 'ms)');
        warnings.push({ type: 'module_warning', target: sm.name, message: 'Module execution exceeded warning threshold: ' + sm.duration + 'ms' });
      }
    }
  }

  // Check bottlenecks
  var bottlenecks = analysis.bottlenecks || [];
  if (bottlenecks.length > 0) {
    var highSeverity = bottlenecks.filter(function(b) { return b.severity === 'high'; });
    var mediumSeverity = bottlenecks.filter(function(b) { return b.severity === 'medium'; });

    if (highSeverity.length > 0) {
      score -= highSeverity.length * 5;
      for (var i = 0; i < highSeverity.length; i++) {
        var b = highSeverity[i];
        warnings.push({ type: 'bottleneck_high', target: b.target || b.metricId, message: 'High severity bottleneck detected: ' + (b.target || b.metricId) + ' (' + b.maxDuration + 'ms)' });
      }
    }

    if (mediumSeverity.length > 0) {
      score -= mediumSeverity.length * 2;
      for (var i = 0; i < mediumSeverity.length; i++) {
        var b = mediumSeverity[i];
        warnings.push({ type: 'bottleneck_medium', target: b.target || b.metricId, message: 'Medium severity bottleneck: ' + (b.target || b.metricId) + ' (' + b.maxDuration + 'ms)' });
      }
    }
  }

  // Check record count
  if (analysis.summary.totalRecords < 3) {
    score -= 5;
    deductions.push('Few records collected: ' + analysis.summary.totalRecords);
    warnings.push({ type: 'insufficient_data', message: 'Insufficient performance data collected' });
  }

  // Ensure score stays within range
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    deductions: deductions,
    warnings: warnings
  };
}

// ============================================================
// SUMMARY GENERATION
// ============================================================

function generateSummary(analysis, scoreResult) {
  if (!analysis || !analysis.summary || !analysis.summary.hasData) {
    return {
      bootDuration: 'N/A',
      slowestModule: 'N/A',
      totalRecords: 0,
      bottlenecks: 0
    };
  }

  var summary = {
    totalRecords: analysis.summary.totalRecords,
    totalDuration: analysis.summary.totalDuration || 0,
    averageDuration: analysis.summary.averageDuration,
    bootDuration: 'N/A',
    slowestModule: 'N/A',
    slowestDuration: null,
    fastestModule: 'N/A',
    fastestDuration: null,
    bottlenecks: analysis.bottlenecks ? analysis.bottlenecks.length : 0
  };

  // Get boot duration
  if (analysis.statistics.byMetric && analysis.statistics.byMetric['runtime.boot.duration']) {
    var bootStats = analysis.statistics.byMetric['runtime.boot.duration'];
    if (bootStats.average !== null) {
      summary.bootDuration = bootStats.average + 'ms';
    }
  }

  // Get slowest module
  if (analysis.slowestModule) {
    summary.slowestModule = analysis.slowestModule.target;
    summary.slowestDuration = analysis.slowestModule.average;
  }

  // Get fastest module
  if (analysis.fastestModule) {
    summary.fastestModule = analysis.fastestModule.target;
    summary.fastestDuration = analysis.fastestModule.average;
  }

  return summary;
}

// ============================================================
// CORE API
// ============================================================

export function evaluate(sessionId) {
  var analyzer = getAnalyzer();
  if (!analyzer) {
    if (isDebugMode()) {
      console.warn('[Performance Health] Analyzer not available');
    }
    return getDefaultHealth();
  }

  // Get analysis
  var analysis = null;
  if (typeof analyzer.analyze === 'function') {
    analysis = analyzer.analyze(sessionId);
  }

  if (!analysis || !analysis.summary || !analysis.summary.hasData) {
    if (isDebugMode()) {
      console.warn('[Performance Health] No analysis data available');
    }
    return getDefaultHealth();
  }

  if (isDebugMode()) {
    console.log('[Performance Health] Evaluation Started');
  }

  // Calculate score
  var thresholds = getThresholds();
  var scoreResult = calculateScore(analysis, thresholds);

  // Evaluate status
  var statusResult = evaluateStatus(scoreResult.score);

  // Generate summary
  var summary = generateSummary(analysis, scoreResult);

  // Build health result
  var result = {
    score: scoreResult.score,
    status: statusResult.status,
    label: statusResult.label,
    summary: summary,
    warnings: scoreResult.warnings,
    deductions: scoreResult.deductions,
    timestamp: new Date().toISOString(),
    hasData: true
  };

  _healthCache = result;

  if (isDebugMode()) {
    console.log('[Performance Health] Score:', result.score);
    console.log('[Performance Health] Status:', result.label);
    if (result.warnings.length > 0) {
      console.warn('[Performance Health] Warnings:', result.warnings.length);
    }
  }

  return result;
}

export function getStatus() {
  if (!_healthCache) {
    evaluate();
  }
  return _healthCache ? { status: _healthCache.status, label: _healthCache.label } : { status: 'UNKNOWN', label: 'Unknown' };
}

export function getScore() {
  if (!_healthCache) {
    evaluate();
  }
  return _healthCache ? _healthCache.score : 0;
}

export function getSummary() {
  if (!_healthCache) {
    evaluate();
  }
  return _healthCache ? _healthCache.summary : null;
}

export function getWarnings() {
  if (!_healthCache) {
    evaluate();
  }
  return _healthCache ? _healthCache.warnings : [];
}

export function getHealthReport() {
  if (!_healthCache) {
    evaluate();
  }
  if (!_healthCache) {
    return getDefaultHealth();
  }
  return _healthCache;
}

function getDefaultHealth() {
  return {
    score: 0,
    status: 'UNKNOWN',
    label: 'Unknown',
    summary: {
      totalRecords: 0,
      totalDuration: 0,
      bootDuration: 'N/A',
      slowestModule: 'N/A',
      bottlenecks: 0
    },
    warnings: [{ type: 'no_data', message: 'No performance data available' }],
    deductions: ['No data available'],
    timestamp: new Date().toISOString(),
    hasData: false
  };
}

export function reset() {
  _healthCache = null;
  if (isDebugMode()) {
    console.log('[Performance Health] Cache reset');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initHealth() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Performance Health] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimePerformanceHealth = {
    evaluate: evaluate,
    getStatus: getStatus,
    getScore: getScore,
    getSummary: getSummary,
    getWarnings: getWarnings,
    getHealthReport: getHealthReport,
    reset: reset,
    init: function() {
      var result = initHealth();
      console.log('✅ RuntimePerformanceHealth ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimePerformanceHealth = window.runtimePerformanceHealth;
  }
}
