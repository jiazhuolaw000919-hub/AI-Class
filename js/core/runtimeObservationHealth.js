/**
 * Runtime Observation Health
 * Generates observation health reports.
 * Developer only.
 */

import { OBSERVATION_EVENTS } from './runtimeObservationManifest.js';
import { getObservations, getObservationCount } from './runtimeObservationCollector.js';
import { validateAllObservations } from './runtimeObservationValidator.js';

export function generateHealthReport() {
  var events = OBSERVATION_EVENTS;
  var observations = getObservations();
  var totalObservations = getObservationCount();
  
  // Count by event
  var eventCounts = {};
  var eventCategories = {};
  for (var i = 0; i < observations.length; i++) {
    var event = observations[i].event;
    eventCounts[event] = (eventCounts[event] || 0) + 1;
    
    var category = events.find(function(e) { return e.id === event; });
    if (category) {
      eventCategories[category.category] = (eventCategories[category.category] || 0) + 1;
    }
  }
  
  // Count unique events observed
  var observedEvents = Object.keys(eventCounts);
  var totalEvents = events.length;
  var coverage = totalEvents > 0 ? Math.round((observedEvents.length / totalEvents) * 100) : 0;
  
  // Count warnings and errors
  var warnings = 0;
  var errors = 0;
  for (var i = 0; i < observations.length; i++) {
    var event = observations[i].event;
    if (event === 'RUNTIME_WARNING') warnings++;
    if (event === 'RUNTIME_ERROR') warnings++;
    if (event === 'BOOT_STAGE_FAILED') errors++;
  }
  
  // Validation warnings
  var validationWarnings = validateAllObservations();
  
  // Calculate health score
  var healthScore = coverage;
  if (warnings > 0) healthScore -= Math.min(warnings * 2, 20);
  if (errors > 0) healthScore -= Math.min(errors * 5, 30);
  if (validationWarnings.length > 0) healthScore -= Math.min(validationWarnings.length * 2, 20);
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Determine status
  var status = 'healthy';
  if (healthScore < 30) status = 'critical';
  else if (healthScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (errors > 0) status = 'warnings';
  
  return {
    totalObservations: totalObservations,
    observedEvents: observedEvents.length,
    totalEvents: totalEvents,
    coverage: coverage + '%',
    coverageScore: coverage,
    eventCounts: eventCounts,
    eventCategories: eventCategories,
    warnings: warnings,
    errors: errors,
    validationWarnings: validationWarnings.length,
    healthScore: healthScore,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('👁 Runtime Observation Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Observations:', report.totalObservations);
  console.log('Coverage:', report.coverage);
  console.log('Health Score:', report.healthScore + '%');
  console.log('Observed Events:', report.observedEvents + '/' + report.totalEvents);
  console.log('Warnings:', report.warnings);
  console.log('Errors:', report.errors);
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeObservationHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ RuntimeObservationHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeObservationHealth = window.runtimeObservationHealth;
  }
}
