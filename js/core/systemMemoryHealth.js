/**
 * System Memory Health
 * Generates memory health reports.
 * Developer only.
 */

import { MEMORY_CATEGORIES } from './systemMemoryManifest.js';
import { getHistory, getHistoryCount } from './systemMemoryCollector.js';
import { validateMemory } from './systemMemoryValidator.js';

export function generateHealthReport() {
  var categories = MEMORY_CATEGORIES;
  var history = getHistory();
  var totalEntries = getHistoryCount();

  // Count entries by category
  var categoryCounts = {};
  var categoriesWithHistory = {};
  
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    if (entry.category) {
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
      categoriesWithHistory[entry.category] = true;
    }
  }

  // Calculate coverage
  var totalCategories = categories.length;
  var coveredCategories = Object.keys(categoriesWithHistory).length;
  var coverage = totalCategories > 0 ? Math.round((coveredCategories / totalCategories) * 100) : 0;

  // Check for missing history
  var missingCategories = [];
  for (var i = 0; i < categories.length; i++) {
    if (!categoriesWithHistory[categories[i].id]) {
      missingCategories.push(categories[i].id);
    }
  }

  // Check for corrupted entries
  var corruptedEntries = 0;
  for (var i = 0; i < history.length; i++) {
    var entry = history[i];
    if (!entry.timestamp || !entry.category || !entry.type || !entry.source) {
      corruptedEntries++;
    }
  }

  // Validation warnings
  var validationWarnings = validateMemory();

  // Retention score (based on entry count and coverage)
  var retentionScore = 0;
  if (totalEntries > 0) {
    var expectedMin = totalCategories * 2; // at least 2 entries per category
    var entryScore = Math.min((totalEntries / expectedMin) * 50, 50);
    var coverageScore = coverage * 0.5;
    retentionScore = Math.round(entryScore + coverageScore);
  }
  retentionScore = Math.min(retentionScore, 100);

  // Determine status
  var status = 'healthy';
  if (retentionScore < 30) status = 'critical';
  else if (retentionScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (corruptedEntries > 0) status = 'warnings';

  return {
    totalEntries: totalEntries,
    categories: Object.keys(categoryCounts),
    categoryCounts: categoryCounts,
    coveredCategories: coveredCategories,
    totalCategories: totalCategories,
    coverage: coverage + '%',
    coverageScore: coverage,
    missingCategories: missingCategories,
    missingCount: missingCategories.length,
    corruptedEntries: corruptedEntries,
    retentionScore: retentionScore,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧠 System Memory Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Entries:', report.totalEntries);
  console.log('Coverage:', report.coverage);
  console.log('Retention Score:', report.retentionScore + '%');
  console.log('Categories:', report.categories.join(', ') || '(none)');
  if (report.missingCount > 0) {
    console.warn('⚠️ Missing Categories:', report.missingCategories.join(', '));
  }
  if (report.corruptedEntries > 0) {
    console.warn('⚠️ Corrupted Entries:', report.corruptedEntries);
  } else {
    console.log('✅ No corrupted entries.');
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMemoryHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemMemoryHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMemoryHealth = window.systemMemoryHealth;
  }
}
