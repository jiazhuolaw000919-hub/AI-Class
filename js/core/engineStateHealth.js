/**
 * Engine State Health
 * Generates state health reports.
 * Developer only.
 */

import { ENGINE_STATES, STATE_CATEGORIES, getCategories } from './engineStateManifest.js';

export function generateHealthReport() {
  var states = ENGINE_STATES;
  var categories = getCategories();
  
  // Count by category
  var categoryCounts = {};
  var categoryStates = {};
  for (var i = 0; i < categories.length; i++) {
    categoryCounts[categories[i]] = 0;
    categoryStates[categories[i]] = [];
  }
  
  for (var i = 0; i < states.length; i++) {
    var s = states[i];
    if (categoryCounts[s.category] !== undefined) {
      categoryCounts[s.category]++;
      categoryStates[s.category].push(s.id);
    }
  }
  
  // Count active vs inactive
  var activeStates = states.filter(function(s) { return s.status === 'active'; });
  var inactiveStates = states.filter(function(s) { return s.status !== 'active'; });
  
  // Count error states
  var errorStates = states.filter(function(s) { return s.category === 'Error'; });
  
  // Calculate coverage (percentage of possible states that are defined)
  var totalPossible = 20; // estimated reasonable number of states
  var coverage = Math.round((states.length / totalPossible) * 100);
  
  // Determine status
  var status = 'healthy';
  if (errorStates.length > 2) status = 'warnings';
  if (inactiveStates.length > 0) status = 'warnings';
  if (states.length < 10) status = 'needs_attention';
  
  return {
    totalStates: states.length,
    categories: categoryCounts,
    categoryStates: categoryStates,
    activeStates: activeStates.length,
    inactiveStates: inactiveStates.length,
    errorStates: errorStates.length,
    errorStateIds: errorStates.map(function(s) { return s.id; }),
    coverage: coverage + '%',
    coverageScore: coverage,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🟢 Engine State Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total States:', report.totalStates);
  console.log('Coverage:', report.coverage);
  console.log('Active States:', report.activeStates);
  console.log('Inactive States:', report.inactiveStates);
  console.log('Error States:', report.errorStates);
  if (report.errorStates > 0) {
    console.warn('⚠️ Error States:', report.errorStateIds.join(', '));
  }
  console.log('Categories:');
  for (var cat in report.categories) {
    if (report.categories.hasOwnProperty(cat)) {
      console.log('  ' + cat + ':', report.categories[cat] + ' states (' + report.categoryStates[cat].join(', ') + ')');
    }
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineStateHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ EngineStateHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineStateHealth = window.engineStateHealth;
  }
}
