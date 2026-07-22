/**
 * System Memory Validator
 * Validates memory entries and categories.
 * Warnings only – never stops Boot.
 */

import { MEMORY_CATEGORIES } from './systemMemoryManifest.js';
import { getHistory } from './systemMemoryCollector.js';

export function validateMemory() {
  var warnings = [];
  var categories = MEMORY_CATEGORIES.map(function(c) { return c.id; });
  var history = getHistory();

  // Check for duplicate history entries
  var seen = {};
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    var key = entry.timestamp + '-' + entry.category + '-' + entry.type;
    if (seen[key]) {
      warnings.push('Duplicate history entry: ' + key);
    }
    seen[key] = true;
  }

  // Check for unknown categories
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    if (entry.category && categories.indexOf(entry.category) === -1) {
      warnings.push('Unknown category in history: "' + entry.category + '"');
    }
  }

  // Check for missing timeline
  var categoriesWithHistory = {};
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    if (entry.category) {
      categoriesWithHistory[entry.category] = true;
    }
  }

  for (var i = 0; i < categories.length; i++) {
    if (!categoriesWithHistory[categories[i]]) {
      warnings.push('Missing history for category: "' + categories[i] + '"');
    }
  }

  // Check for corrupted memory entries (missing required fields)
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    if (!entry.timestamp) {
      warnings.push('Corrupted memory entry: missing timestamp');
    }
    if (!entry.category) {
      warnings.push('Corrupted memory entry: missing category');
    }
    if (!entry.type) {
      warnings.push('Corrupted memory entry: missing type');
    }
    if (!entry.source) {
      warnings.push('Corrupted memory entry: missing source');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMemoryValidator = {
    validateMemory: validateMemory,
    init: function() {
      console.log('✅ SystemMemoryValidator ready');
      var warnings = validateMemory();
      if (warnings.length > 0) {
        console.warn('⚠️ Memory warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All memory entries valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMemoryValidator = window.systemMemoryValidator;
  }
}
