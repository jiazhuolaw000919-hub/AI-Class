/**
 * System Decision Health
 * Generates decision health reports.
 * Developer only.
 */

import { DECISION_CATEGORIES, DECISION_RULES } from './systemDecisionManifest.js';
import { getDecisions, getDecisionCount, getSummary } from './systemDecisionEngine.js';
import { validateDecisions } from './systemDecisionValidator.js';

export function generateHealthReport() {
  var categories = DECISION_CATEGORIES;
  var rules = DECISION_RULES;
  var decisions = getDecisions();
  var summary = getSummary();
  
  // Calculate coverage (rules that have triggered decisions)
  var triggeredRules = decisions.map(function(d) { return d.ruleId; });
  var uniqueTriggered = [];
  for (var i = 0; i < triggeredRules.length; i++) {
    if (uniqueTriggered.indexOf(triggeredRules[i]) === -1) {
      uniqueTriggered.push(triggeredRules[i]);
    }
  }
  
  var activeRules = rules.filter(function(r) { return r.status === 'active'; });
  var coverage = activeRules.length > 0 ? Math.round((uniqueTriggered.length / activeRules.length) * 100) : 0;
  
  // Decision consistency (ratio of errors to warnings)
  var consistency = 100;
  if (summary.errors > 0 && summary.warnings > 0) {
    consistency = Math.round((summary.warnings / (summary.errors + summary.warnings)) * 100);
  } else if (summary.errors > 0) {
    consistency = 0;
  }
  
  // Rule availability
  var ruleAvailability = activeRules.length;
  
  // Recommendation quality based on severity distribution
  var quality = 100;
  if (summary.errors > 3) {
    quality = Math.max(50, 100 - (summary.errors * 5));
  }
  
  // Validation warnings
  var validationWarnings = validateDecisions();
  
  // Determine status
  var status = 'healthy';
  if (summary.errors > 5) status = 'critical';
  else if (coverage < 30) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (summary.errors > 0) status = 'warnings';
  
  return {
    totalDecisions: summary.total,
    triggeredRules: uniqueTriggered.length,
    totalRules: activeRules.length,
    coverage: coverage + '%',
    coverageScore: coverage,
    consistency: consistency + '%',
    consistencyScore: consistency,
    errors: summary.errors,
    warnings: summary.warnings,
    ruleAvailability: ruleAvailability,
    quality: quality + '%',
    qualityScore: quality,
    validationWarnings: validationWarnings.length,
    status: status,
    categories: summary.categories,
    decisionTypes: summary.decisionTypes,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧭 System Decision Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Decisions:', report.totalDecisions);
  console.log('Coverage:', report.coverage);
  console.log('Consistency:', report.consistency);
  console.log('Quality:', report.quality);
  console.log('Errors:', report.errors);
  console.log('Warnings:', report.warnings);
  console.log('Validation Warnings:', report.validationWarnings);
  if (report.errors > 0) {
    console.warn('⚠️ ' + report.errors + ' error-level decisions detected');
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemDecisionHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemDecisionHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemDecisionHealth = window.systemDecisionHealth;
  }
}
