/**
 * System Reflection Health
 * Generates reflection health reports.
 * Developer only.
 */

import { REFLECTION_CATEGORIES } from './systemReflectionManifest.js';
import { getSnapshots, analyzeTrends } from './systemReflectionAnalyzer.js';
import { validateReflection } from './systemReflectionValidator.js';

export function generateHealthReport() {
  var categories = REFLECTION_CATEGORIES;
  var snapshots = getSnapshots();
  var trends = analyzeTrends();
  
  // Calculate coverage
  var totalCategories = categories.length;
  var availableTrends = 0;
  var trendDetails = {};
  
  if (trends && trends.trends) {
    for (var key in trends.trends) {
      if (trends.trends.hasOwnProperty(key)) {
        var t = trends.trends[key];
        if (t.trend !== 'insufficient_data' && t.trend !== 'unknown') {
          availableTrends++;
        }
        trendDetails[key] = t;
      }
    }
  }
  
  var coverage = totalCategories > 0 ? Math.round((availableTrends / totalCategories) * 100) : 0;
  
  // Count historical comparisons available
  var comparisons = 0;
  if (snapshots.length >= 2) {
    comparisons = snapshots.length - 1;
  }
  
  // Check consistency (stable trends across categories)
  var consistentCategories = 0;
  for (var key in trendDetails) {
    if (trendDetails.hasOwnProperty(key)) {
      var t = trendDetails[key];
      if (t.trend === 'stable' || t.trend === 'improving') {
        consistentCategories++;
      }
    }
  }
  
  var consistency = availableTrends > 0 ? Math.round((consistentCategories / availableTrends) * 100) : 0;
  
  // Validation warnings
  var validationWarnings = validateReflection();
  
  // Determine status
  var status = 'healthy';
  if (snapshots.length < 2) status = 'insufficient_data';
  else if (coverage < 30) status = 'critical';
  else if (coverage < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (consistency < 50) status = 'warnings';
  
  return {
    totalSnapshots: snapshots.length,
    availableTrends: availableTrends,
    totalCategories: totalCategories,
    coverage: coverage + '%',
    coverageScore: coverage,
    comparisons: comparisons,
    consistency: consistency + '%',
    consistencyScore: consistency,
    trendDetails: trendDetails,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🤔 System Reflection Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Snapshots:', report.totalSnapshots);
  console.log('Coverage:', report.coverage);
  console.log('Consistency:', report.consistency);
  console.log('Comparisons:', report.comparisons);
  console.log('Available Trends:', report.availableTrends + '/' + report.totalCategories);
  console.log('Validation Warnings:', report.validationWarnings);
  if (report.totalSnapshots < 2) {
    console.warn('⚠️ Insufficient snapshots for reflection analysis');
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemReflectionHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemReflectionHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemReflectionHealth = window.systemReflectionHealth;
  }
}
