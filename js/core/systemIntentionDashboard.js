/**
 * System Intention Dashboard
 * Provides intention overview and analytics.
 * Presentation only.
 */

import { INTENTION_TYPES } from './systemIntentionManifest.js';
import { getCurrentIntention, getIntentionHistory, collectAll } from './systemIntentionCollector.js';
import { generateHealthReport } from './systemIntentionHealth.js';

export function getOverview() {
  var health = generateHealthReport();
  var current = getCurrentIntention();
  var history = getIntentionHistory();

  return {
    status: health.status,
    currentIntention: current || 'none',
    totalIntentions: health.totalIntentions,
    activeIntentions: health.activeIntentions,
    coverage: health.coverage,
    historyCount: history.length,
    timestamp: new Date().toISOString()
  };
}

export function getIntentionHistory() {
  var history = getIntentionHistory();
  return history.map(function(h) {
    return {
      intention: h.intention,
      timestamp: h.timestamp,
      date: new Date(h.timestamp).toLocaleString()
    };
  });
}

export function getIntentionStats() {
  var history = getIntentionHistory();
  var stats = {};

  for (var i = 0; i < history.length; i++) {
    var intention = history[i].intention;
    stats[intention] = (stats[intention] || 0) + 1;
  }

  // Add current intention if not in stats
  var current = getCurrentIntention();
  if (current && !stats[current]) {
    stats[current] = (stats[current] || 0) + 1;
  }

  return stats;
}

export function getIntentionTimeline() {
  var history = getIntentionHistory();
  var timeline = [];

  for (var i = 0; i < history.length; i++) {
    var h = history[i];
    var intention = INTENTION_TYPES.find(function(i) { return i.id === h.intention; });
    timeline.push({
      intention: h.intention,
      name: intention ? intention.name : h.intention,
      timestamp: h.timestamp,
      date: new Date(h.timestamp).toLocaleString()
    });
  }

  // Add current intention
  var current = getCurrentIntention();
  if (current) {
    var intention = INTENTION_TYPES.find(function(i) { return i.id === current; });
    timeline.push({
      intention: current,
      name: intention ? intention.name : current,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString(),
      current: true
    });
  }

  return timeline;
}

export function getSummary() {
  var health = generateHealthReport();
  var stats = getIntentionStats();

  return {
    overallStatus: health.status,
    totalIntentions: health.totalIntentions,
    activeIntentions: health.activeIntentions,
    coverage: health.coverage,
    currentIntention: health.currentIntention,
    intentionDistribution: stats,
    timestamp: new Date().toISOString()
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntentionDashboard = {
    getOverview: getOverview,
    getIntentionHistory: getIntentionHistory,
    getIntentionStats: getIntentionStats,
    getIntentionTimeline: getIntentionTimeline,
    getSummary: getSummary,
    init: function() {
      console.log('✅ SystemIntentionDashboard ready');
      var summary = getSummary();
      console.log('📊 Intention Summary:', summary);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntentionDashboard = window.systemIntentionDashboard;
  }
}
