/**
 * System Maturity Validator
 * Validates maturity data and criteria.
 * Warnings only – never stops Boot.
 */

import { MATURITY_STAGES, MATURITY_CRITERIA, MATURITY_MILESTONES } from './systemMaturityManifest.js';
import { analyzeMaturity } from './systemMaturityAnalyzer.js';

export function validateMaturity() {
  var warnings = [];
  var stages = MATURITY_STAGES;
  var criteria = MATURITY_CRITERIA;
  var milestones = MATURITY_MILESTONES;
  var analysis = analyzeMaturity();

  // Check for missing maturity data
  if (stages.length === 0) {
    warnings.push('Missing maturity data: no stages defined');
  }

  // Check for invalid stage
  if (analysis.currentStage) {
    var validStage = stages.some(function(s) { return s.id === analysis.currentStage; });
    if (!validStage) {
      warnings.push('Invalid stage: "' + analysis.currentStage + '"');
    }
  }

  // Check for incomplete criteria
  for (var key in criteria) {
    if (criteria.hasOwnProperty(key)) {
      var criterion = criteria[key];
      var required = criterion.required || [];
      for (var i = 0; i < required.length; i++) {
        var exists = false;
        try {
          if (typeof LawAIApp !== 'undefined' && LawAIApp) {
            if (LawAIApp[required[i]]) exists = true;
          }
          if (!exists && typeof window !== 'undefined') {
            if (window[required[i]]) exists = true;
          }
        } catch (e) { /* ignore */ }
        if (!exists) {
          warnings.push('Incomplete criteria: "' + required[i] + '" missing for "' + key + '"');
        }
      }
    }
  }

  // Check for regression (score decreasing)
  var previousScores = JSON.parse(localStorage.getItem('maturity_scores') || 'null');
  if (previousScores) {
    if (analysis.overallScore < previousScores.overallScore) {
      warnings.push('Regression warning: overall score decreased from ' + previousScores.overallScore + '% to ' + analysis.overallScore + '%');
    }
  }

  // Check for missing milestones
  var completedMilestones = milestones.filter(function(m) { return m.completed; });
  var expectedComplete = milestones.length;
  if (completedMilestones.length < expectedComplete) {
    warnings.push('Missing milestones: ' + (expectedComplete - completedMilestones.length) + ' incomplete');
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMaturityValidator = {
    validateMaturity: validateMaturity,
    init: function() {
      console.log('✅ SystemMaturityValidator ready');
      var warnings = validateMaturity();
      if (warnings.length > 0) {
        console.warn('⚠️ Maturity warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Maturity data valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMaturityValidator = window.systemMaturityValidator;
  }
}
