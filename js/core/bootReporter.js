/**
 * Boot Reporter
 * Generates boot reports.
 * Developer only.
 */

import { collectDiagnostics, getBootHistory, getBootStatus } from './bootDiagnostics.js';
import { getPipeline } from './bootPipeline.js';
import { getStageRegistry } from './bootStageRegistry.js';

export function generateBootReport() {
  var diagnostics = collectDiagnostics();
  var status = getBootStatus();
  var stages = getStageRegistry();

  var report = {
    generated: new Date().toISOString(),
    status: status.status,
    summary: {
      totalStages: status.total,
      completedStages: status.completed,
      failedStages: status.failed,
      duration: status.duration + 'ms'
    },
    stages: diagnostics.stageDetails,
    warnings: diagnostics.warnings,
    overallHealth: 'healthy'
  };

  if (report.summary.failedStages > 0) {
    report.overallHealth = 'failed';
  } else if (report.warnings.length > 0) {
    report.overallHealth = 'warnings';
  } else if (report.summary.completedStages < report.summary.totalStages) {
    report.overallHealth = 'incomplete';
  }

  return report;
}

export function generatePerformanceReport() {
  var history = getBootHistory();
  var last = history.length > 0 ? history[history.length - 1] : null;

  var result = {
    timestamp: new Date().toISOString(),
    lastBootDuration: last ? last.totalDuration + 'ms' : 'N/A',
    totalBoots: history.length,
    averageDuration: 'N/A',
    fastestBoot: 'N/A',
    slowestBoot: 'N/A'
  };

  if (history.length > 0) {
    var durations = history.map(function(h) { return h.totalDuration || 0; }).filter(function(d) { return d > 0; });
    if (durations.length > 0) {
      var sum = durations.reduce(function(a, b) { return a + b; }, 0);
      result.averageDuration = Math.round(sum / durations.length) + 'ms';
      result.fastestBoot = Math.min.apply(null, durations) + 'ms';
      result.slowestBoot = Math.max.apply(null, durations) + 'ms';
    }
  }

  return result;
}

export function generateStageBreakdown() {
  var diagnostics = collectDiagnostics();
  var breakdown = {};

  for (var i = 0; i < diagnostics.stageDetails.length; i++) {
    var s = diagnostics.stageDetails[i];
    breakdown[s.name] = {
      status: s.status,
      duration: s.duration + 'ms',
      hasResult: !!s.result
    };
  }

  return breakdown;
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootReporter = {
    generateBootReport: generateBootReport,
    generatePerformanceReport: generatePerformanceReport,
    generateStageBreakdown: generateStageBreakdown,
    init: function() {
      console.log('📊 Boot Reporter Ready');
      var report = generateBootReport();
      console.log('  📊 Report Status:', report.status, '| Health:', report.overallHealth);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootReporter = window.bootReporter;
  }
}
