/**
 * System Intention Health
 * Generates intention health reports.
 * Developer only.
 */

import { INTENTION_TYPES } from './systemIntentionManifest.js';
import { getCurrentIntention, getIntentionHistory } from './systemIntentionCollector.js';
import { validateIntentions } from './systemIntentionValidator.js';

export function generateHealthReport() {
  var definedIntentions = INTENTION_TYPES;
  var current = getCurrentIntention();
  var history = getIntentionHistory();

  // Count active intentions (with history or current)
  var activeIntentions = {};
  if (current) {
    activeIntentions[current] = true;
  }
  for (var i = 0; i < history.length; i++) {
    if (history[i].intention) {
      activeIntentions[history[i].intention] = true;
    }
  }
  var activeCount = Object.keys(activeIntentions).length;

  // Count unknown intentions (in history but not defined)
  var unknownCount = 0;
  var definedIds = definedIntentions.map(function(i) { return i.id; });
  for (var i = 0; i < history.length; i++) {
    if (history[i].intention && definedIds.indexOf(history[i].intention) === -1) {
      unknownCount++;
    }
  }

  // Calculate coverage
  var totalDefined = definedIntentions.length;
  var covered = 0;
  for (var i = 0; i < definedIntentions.length; i++) {
    if (activeIntentions[definedIntentions[i].id]) {
      covered++;
    }
  }
  var coverage = totalDefined > 0 ? Math.round((covered / totalDefined) * 100) : 0;

  // Validation warnings
  var validationWarnings = validateIntentions();

  // Determine status
  var status = 'healthy';
  if (coverage < 30) status = 'critical';
  else if (coverage < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';

  return {
    totalIntentions: totalDefined,
    activeIntentions: activeCount,
    currentIntention: current || 'none',
    coveredIntentions: covered,
    unknownIntentions: unknownCount,
    coverage: coverage + '%',
    coverageScore: coverage,
    historyCount: history.length,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧭 System Intention Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Intentions:', report.totalIntentions);
  console.log('Active Intentions:', report.activeIntentions);
  console.log('Current Intention:', report.currentIntention);
  console.log('Coverage:', report.coverage);
  console.log('History Entries:', report.historyCount);
  if (report.unknownIntentions > 0) {
    console.warn('⚠️ Unknown Intentions:', report.unknownIntentions);
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntentionHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemIntentionHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntentionHealth = window.systemIntentionHealth;
  }
}
