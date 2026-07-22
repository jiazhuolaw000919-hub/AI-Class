/**
 * System Timeline
 * Generates timeline of system history.
 * Developer only – read only.
 */

import { getHistory, getHistoryByCategory, getHistoryCount } from './systemMemoryCollector.js';
import { getMemoryCategories } from './systemMemoryManifest.js';

export function generateTimeline() {
  var history = getHistory();
  var categories = getMemoryCategories();

  // Sort by timestamp
  var sorted = history.slice().sort(function(a, b) {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // Group by category
  var grouped = {};
  for (var i = 0; i < sorted.length; i++) {
    var entry = sorted[i];
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
    }
    grouped[entry.category].push(entry);
  }

  // Build timeline entries
  var timeline = [];
  for (var i = 0; i < sorted.length; i++) {
    var entry = sorted[i];
    var category = categories.find(function(c) { return c.id === entry.category; });
    timeline.push({
      timestamp: entry.timestamp,
      date: new Date(entry.timestamp).toLocaleString(),
      category: entry.category,
      categoryName: category ? category.name : entry.category,
      type: entry.type,
      source: entry.source,
      version: entry.version || 'N/A',
      data: entry.data || {}
    });
  }

  // Get latest entry by category
  var latest = {};
  for (var i = 0; i < sorted.length; i++) {
    var entry = sorted[i];
    if (!latest[entry.category] || new Date(entry.timestamp) > new Date(latest[entry.category].timestamp)) {
      latest[entry.category] = entry;
    }
  }

  return {
    totalEntries: sorted.length,
    categories: Object.keys(grouped),
    categoryCounts: Object.keys(grouped).map(function(key) {
      return { category: key, count: grouped[key].length };
    }),
    latest: latest,
    timeline: timeline,
    generated: new Date().toISOString()
  };
}

export function getTimelineByCategory(category) {
  var history = getHistoryByCategory(category);
  return history.slice().sort(function(a, b) {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

export function getTimelineSummary() {
  var timeline = generateTimeline();
  return {
    totalEntries: timeline.totalEntries,
    categories: timeline.categories,
    latestEntries: Object.keys(timeline.latest).map(function(key) {
      return {
        category: key,
        timestamp: timeline.latest[key].timestamp,
        type: timeline.latest[key].type
      };
    }),
    generated: timeline.generated
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemTimeline = {
    generateTimeline: generateTimeline,
    getTimelineByCategory: getTimelineByCategory,
    getTimelineSummary: getTimelineSummary,
    init: function() {
      console.log('✅ SystemTimeline ready');
      var summary = getTimelineSummary();
      console.log('📅 Timeline Summary:', summary.totalEntries + ' entries across ' + summary.categories.length + ' categories');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemTimeline = window.systemTimeline;
  }
}
