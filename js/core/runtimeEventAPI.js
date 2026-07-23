/**
 * Runtime Event API
 * Runtime Event Public Interface
 * Part 44.8 - Runtime Event API Implementation
 */

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTimeline() {
  return LawAIApp.RuntimeEventTimeline || window.runtimeEventTimeline;
}

function getIntelligence() {
  return LawAIApp.RuntimeEventIntelligence || window.runtimeEventIntelligence;
}

function getStore() {
  return LawAIApp.RuntimeEventStore || window.runtimeEventStore;
}

function getAnalyzer() {
  return LawAIApp.RuntimeEventAnalyzer || window.runtimeEventAnalyzer;
}

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Event API] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

// ============================================================
// CORE API - Timeline
// ============================================================

export function getTimeline(sessionId) {
  var timeline = getTimeline();
  if (!timeline) {
    if (isDebugMode()) {
      console.warn('[Event API] Timeline not available');
    }
    return { entries: [], summary: { total: 0 } };
  }

  if (isDebugMode()) {
    console.log('[Event API] Timeline Requested' + (sessionId ? ' (Session: ' + sessionId + ')' : ''));
  }

  if (sessionId) {
    return safeCall(function() {
      if (typeof timeline.getSessionTimeline === 'function') {
        return timeline.getSessionTimeline(sessionId);
      }
      return null;
    }, { entries: [], summary: { total: 0 } });
  }

  return safeCall(function() {
    if (typeof timeline.getTimeline === 'function') {
      return timeline.getTimeline();
    }
    return null;
  }, { entries: [], summary: { total: 0 } });
}

export function getTimelineEntries() {
  var timeline = getTimeline();
  if (!timeline) return [];

  if (isDebugMode()) {
    console.log('[Event API] Timeline Entries Requested');
  }

  return safeCall(function() {
    if (typeof timeline.getEntries === 'function') {
      return timeline.getEntries();
    }
    return [];
  }, []);
}

export function getTimelineSummary() {
  var timeline = getTimeline();
  if (!timeline) {
    return { total: 0, categories: {}, sources: {}, timeRange: { start: null, end: null, duration: null } };
  }

  if (isDebugMode()) {
    console.log('[Event API] Timeline Summary Requested');
  }

  return safeCall(function() {
    if (typeof timeline.getSummary === 'function') {
      return timeline.getSummary();
    }
    return null;
  }, { total: 0, categories: {}, sources: {}, timeRange: { start: null, end: null, duration: null } });
}

// ============================================================
// CORE API - Intelligence
// ============================================================

export function getInsights() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Intelligence not available');
    }
    return [];
  }

  if (isDebugMode()) {
    console.log('[Event API] Insights Requested');
  }

  return safeCall(function() {
    if (typeof intelligence.getInsights === 'function') {
      return intelligence.getInsights();
    }
    return [];
  }, []);
}

export function getRecommendations() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Intelligence not available');
    }
    return [];
  }

  if (isDebugMode()) {
    console.log('[Event API] Recommendations Requested');
  }

  return safeCall(function() {
    if (typeof intelligence.getRecommendations === 'function') {
      return intelligence.getRecommendations();
    }
    return [];
  }, []);
}

export function getRisks() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Intelligence not available');
    }
    return [];
  }

  if (isDebugMode()) {
    console.log('[Event API] Risks Requested');
  }

  return safeCall(function() {
    if (typeof intelligence.getRisks === 'function') {
      return intelligence.getRisks();
    }
    return [];
  }, []);
}

export function getDependencies() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Dependencies not available');
    }
    return [];
  }

  if (isDebugMode()) {
    console.log('[Event API] Dependencies Requested');
  }

  return safeCall(function() {
    if (typeof intelligence.getDependencies === 'function') {
      return intelligence.getDependencies();
    }
    return [];
  }, []);
}

export function getIntelligenceReport() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Intelligence not available');
    }
    return { insights: [], dependencies: [], risks: [], recommendations: [], summary: { totalInsights: 0 } };
  }

  if (isDebugMode()) {
    console.log('[Event API] Intelligence Report Requested');
  }

  return safeCall(function() {
    if (typeof intelligence.getIntelligenceReport === 'function') {
      return intelligence.getIntelligenceReport();
    }
    return null;
  }, { insights: [], dependencies: [], risks: [], recommendations: [], summary: { totalInsights: 0 } });
}

// ============================================================
// CORE API - Statistics
// ============================================================

export function getStatistics() {
  var analyzer = getAnalyzer();
  if (!analyzer) {
    if (isDebugMode()) {
      console.warn('[Event API] Analyzer not available');
    }
    return { total: 0, categories: {}, sources: {}, eventTypes: {}, topEvents: [] };
  }

  if (isDebugMode()) {
    console.log('[Event API] Statistics Requested');
  }

  return safeCall(function() {
    if (typeof analyzer.getStatistics === 'function') {
      return analyzer.getStatistics();
    }
    return null;
  }, { total: 0, categories: {}, sources: {}, eventTypes: {}, topEvents: [] });
}

export function getSessionStatistics() {
  var store = getStore();
  if (!store) {
    if (isDebugMode()) {
      console.warn('[Event API] Store not available');
    }
    return { sessions: [], total: 0 };
  }

  if (isDebugMode()) {
    console.log('[Event API] Session Statistics Requested');
  }

  return safeCall(function() {
    if (typeof store.getStatistics === 'function') {
      return store.getStatistics();
    }
    return null;
  }, { sessions: [], total: 0 });
}

export function getSessionCount() {
  var store = getStore();
  if (!store) return 0;

  return safeCall(function() {
    if (typeof store.getSessionCount === 'function') {
      return store.getSessionCount();
    }
    return 0;
  }, 0);
}

export function getEventCount() {
  var store = getStore();
  if (!store) return 0;

  return safeCall(function() {
    if (typeof store.getEventCount === 'function') {
      return store.getEventCount();
    }
    return 0;
  }, 0);
}

// ============================================================
// CORE API - Query
// ============================================================

export function query(filter) {
  var timeline = getTimeline();
  if (!timeline) {
    if (isDebugMode()) {
      console.warn('[Event API] Timeline not available for query');
    }
    return [];
  }

  if (isDebugMode()) {
    console.log('[Event API] Query:', filter);
  }

  // Get all entries
  var entries = safeCall(function() {
    if (typeof timeline.getEntries === 'function') {
      return timeline.getEntries();
    }
    return [];
  }, []);

  if (!entries || entries.length === 0) {
    return [];
  }

  return entries.filter(function(entry) {
    var match = true;

    // Filter by eventId
    if (filter.eventId) {
      if (entry.eventId !== filter.eventId) {
        match = false;
      }
    }

    // Filter by source
    if (filter.source) {
      if (entry.source !== filter.source) {
        match = false;
      }
    }

    // Filter by category
    if (filter.category) {
      if (entry.category !== filter.category) {
        match = false;
      }
    }

    // Filter by time range
    if (filter.startTime) {
      var ts = new Date(entry.timestamp);
      if (ts < new Date(filter.startTime)) {
        match = false;
      }
    }
    if (filter.endTime) {
      var ts = new Date(entry.timestamp);
      if (ts > new Date(filter.endTime)) {
        match = false;
      }
    }

    // Filter by keyword
    if (filter.keyword) {
      var lower = filter.keyword.toLowerCase();
      var eventName = entry.eventName || entry.eventId;
      if (eventName.toLowerCase().indexOf(lower) === -1 &&
          entry.source.toLowerCase().indexOf(lower) === -1 &&
          entry.category.toLowerCase().indexOf(lower) === -1) {
        match = false;
      }
    }

    return match;
  });
}

// ============================================================
// CORE API - Utility
// ============================================================

export function generateIntelligence() {
  var intelligence = getIntelligence();
  if (!intelligence) {
    if (isDebugMode()) {
      console.warn('[Event API] Intelligence not available');
    }
    return null;
  }

  if (isDebugMode()) {
    console.log('[Event API] Generating Intelligence');
  }

  return safeCall(function() {
    if (typeof intelligence.generate === 'function') {
      return intelligence.generate();
    }
    return null;
  }, null);
}

export function buildTimeline(sessionId) {
  var timeline = getTimeline();
  if (!timeline) {
    if (isDebugMode()) {
      console.warn('[Event API] Timeline not available');
    }
    return null;
  }

  if (isDebugMode()) {
    console.log('[Event API] Building Timeline' + (sessionId ? ' (Session: ' + sessionId + ')' : ''));
  }

  return safeCall(function() {
    if (typeof timeline.build === 'function') {
      return timeline.build(sessionId);
    }
    return null;
  }, null);
}

export function reset() {
  var timeline = getTimeline();
  var intelligence = getIntelligence();

  if (timeline && typeof timeline.reset === 'function') {
    safeCall(function() { timeline.reset(); });
  }
  if (intelligence && typeof intelligence.reset === 'function') {
    safeCall(function() { intelligence.reset(); });
  }

  if (isDebugMode()) {
    console.log('[Event API] Reset complete');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initAPI() {
  if (isDebugMode()) {
    console.log('[Event API] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT - LawAIApp.Events
// ============================================================

if (typeof window !== 'undefined') {
  // Mount to window.LawAIApp
  if (typeof LawAIApp === 'undefined') {
    window.LawAIApp = {};
  }

  LawAIApp.Events = {
    // Timeline
    getTimeline: getTimeline,
    getTimelineEntries: getTimelineEntries,
    getTimelineSummary: getTimelineSummary,

    // Intelligence
    getInsights: getInsights,
    getRecommendations: getRecommendations,
    getRisks: getRisks,
    getDependencies: getDependencies,
    getIntelligenceReport: getIntelligenceReport,

    // Statistics
    getStatistics: getStatistics,
    getSessionStatistics: getSessionStatistics,
    getSessionCount: getSessionCount,
    getEventCount: getEventCount,

    // Query
    query: query,

    // Utility
    generateIntelligence: generateIntelligence,
    buildTimeline: buildTimeline,
    reset: reset,

    init: function() {
      var result = initAPI();
      console.log('✅ Runtime Event API ready (LawAIApp.Events)');
      return this;
    }
  };

  // Also mount to window for backward compatibility
  window.runtimeEventAPI = LawAIApp.Events;

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventAPI = window.runtimeEventAPI;
  }
}
