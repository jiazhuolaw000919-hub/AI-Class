/**
 * Runtime Event Timeline
 * Runtime Event Timeline Provider
 * Part 44.7 - Runtime Event Timeline Implementation
 */

// ============================================================
// TIMELINE STATE
// ============================================================

var _timelineCache = null;
var _isInitialized = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getStore() {
  return LawAIApp.RuntimeEventStore || window.runtimeEventStore;
}

function getRegistry() {
  return LawAIApp.RuntimeEventRegistry || window.runtimeEventRegistry;
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
      console.warn('[Event Timeline] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

function getEventName(eventId) {
  var registry = getRegistry();
  if (!registry) return eventId;
  var def = safeCall(function() {
    if (typeof registry.get === 'function') {
      return registry.get(eventId);
    }
    return null;
  }, null);
  return def ? def.name : eventId;
}

function getEventCategory(eventId) {
  var registry = getRegistry();
  if (!registry) return 'UNKNOWN';
  var def = safeCall(function() {
    if (typeof registry.get === 'function') {
      return registry.get(eventId);
    }
    return null;
  }, null);
  return def ? def.category : 'UNKNOWN';
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return null;
  if (ms < 1) return ms.toFixed(2) + 'ms';
  if (ms < 1000) return Math.round(ms) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

// ============================================================
// TIMELINE BUILDER
// ============================================================

function buildTimelineFromEvents(events, options) {
  options = options || {};

  if (!events || events.length === 0) {
    return {
      entries: [],
      summary: {
        total: 0,
        categories: {},
        sources: {},
        timeRange: { start: null, end: null, duration: null }
      }
    };
  }

  // Sort by timestamp
  var sorted = events.slice().sort(function(a, b) {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  var entries = [];
  var categories = {};
  var sources = {};

  for (var i = 0; i < sorted.length; i++) {
    var e = sorted[i];
    var eventName = getEventName(e.eventId);
    var category = getEventCategory(e.eventId);

    // Count categories and sources
    categories[category] = (categories[category] || 0) + 1;
    sources[e.source] = (sources[e.source] || 0) + 1;

    // Build timeline entry
    var entry = {
      timestamp: e.timestamp,
      date: new Date(e.timestamp).toLocaleString(),
      eventId: e.eventId,
      eventName: eventName,
      source: e.source,
      category: category,
      payload: e.payload || {},
      metadata: e.metadata || {},
      sessionId: e.sessionId || 'unknown'
    };

    entries.push(entry);
  }

  // Calculate time range
  var start = entries.length > 0 ? entries[0].timestamp : null;
  var end = entries.length > 0 ? entries[entries.length - 1].timestamp : null;
  var duration = null;
  if (start && end) {
    duration = new Date(end) - new Date(start);
  }

  return {
    entries: entries,
    summary: {
      total: entries.length,
      categories: categories,
      sources: sources,
      timeRange: {
        start: start,
        end: end,
        duration: duration,
        formattedDuration: formatDuration(duration)
      }
    }
  };
}

// ============================================================
// CORE API
// ============================================================

export function build(sessionId, options) {
  var store = getStore();
  if (!store) {
    if (isDebugMode()) {
      console.warn('[Event Timeline] Store not available');
    }
    return getDefaultTimeline();
  }

  if (isDebugMode()) {
    console.log('[Event Timeline] Building timeline...');
  }

  // Get events
  var events = [];
  if (sessionId) {
    events = safeCall(function() {
      if (typeof store.getSessionEvents === 'function') {
        return store.getSessionEvents(sessionId);
      }
      return [];
    }, []);
  } else {
    events = safeCall(function() {
      if (typeof store.getEvents === 'function') {
        return store.getEvents();
      }
      return [];
    }, []);
  }

  if (!events || events.length === 0) {
    if (isDebugMode()) {
      console.warn('[Event Timeline] No events found');
    }
    return getDefaultTimeline();
  }

  var timeline = buildTimelineFromEvents(events, options);

  _timelineCache = timeline;

  if (isDebugMode()) {
    console.log('[Event Timeline] Timeline Built');
    console.log('[Event Timeline] Entries:', timeline.summary.total);
    console.log('[Event Timeline] Categories:', Object.keys(timeline.summary.categories).length);
    console.log('[Event Timeline] Sources:', Object.keys(timeline.summary.sources).length);
  }

  return timeline;
}

export function getTimeline() {
  if (!_timelineCache) {
    build();
  }
  return _timelineCache || getDefaultTimeline();
}

export function getSessionTimeline(sessionId) {
  return build(sessionId);
}

export function getEntries() {
  var timeline = getTimeline();
  return timeline ? timeline.entries : [];
}

export function getSummary() {
  var timeline = getTimeline();
  return timeline ? timeline.summary : null;
}

// ============================================================
// FILTER FUNCTIONS
// ============================================================

export function filterByCategory(category) {
  var entries = getEntries();
  return entries.filter(function(e) {
    return e.category === category;
  });
}

export function filterBySource(source) {
  var entries = getEntries();
  return entries.filter(function(e) {
    return e.source === source;
  });
}

export function filterByEvent(eventId) {
  var entries = getEntries();
  return entries.filter(function(e) {
    return e.eventId === eventId;
  });
}

export function filterByTimeRange(startTime, endTime) {
  var entries = getEntries();
  var start = new Date(startTime);
  var end = new Date(endTime);
  return entries.filter(function(e) {
    var ts = new Date(e.timestamp);
    return ts >= start && ts <= end;
  });
}

export function filterByKeyword(keyword) {
  if (!keyword) return getEntries();
  var lower = keyword.toLowerCase();
  var entries = getEntries();
  return entries.filter(function(e) {
    return e.eventName.toLowerCase().indexOf(lower) !== -1 ||
           e.source.toLowerCase().indexOf(lower) !== -1 ||
           e.category.toLowerCase().indexOf(lower) !== -1;
  });
}

// ============================================================
// TIMELINE STATISTICS
// ============================================================

export function getCategoryDistribution() {
  var timeline = getTimeline();
  if (!timeline || !timeline.summary) return {};
  return timeline.summary.categories || {};
}

export function getSourceDistribution() {
  var timeline = getTimeline();
  if (!timeline || !timeline.summary) return {};
  return timeline.summary.sources || {};
}

export function getEventFrequency() {
  var entries = getEntries();
  var frequency = {};
  for (var i = 0; i < entries.length; i++) {
    var id = entries[i].eventId;
    frequency[id] = (frequency[id] || 0) + 1;
  }
  return frequency;
}

export function getTimeRange() {
  var timeline = getTimeline();
  if (!timeline || !timeline.summary) {
    return { start: null, end: null, duration: null };
  }
  return timeline.summary.timeRange;
}

// ============================================================
// TIMELINE FORMATTERS
// ============================================================

export function toJSON(indent) {
  var timeline = getTimeline();
  return JSON.stringify(timeline, null, indent || 2);
}

export function toCSV() {
  var entries = getEntries();
  if (entries.length === 0) return '';

  var headers = ['timestamp', 'eventId', 'eventName', 'source', 'category'];
  var lines = [headers.join(',')];

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var row = [
      e.timestamp,
      '"' + e.eventId + '"',
      '"' + e.eventName + '"',
      '"' + e.source + '"',
      '"' + e.category + '"'
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

// ============================================================
// SESSION TIMELINE
// ============================================================

export function getSessionTimelineSummary() {
  var store = getStore();
  if (!store) {
    return { sessions: [], total: 0 };
  }

  var sessions = safeCall(function() {
    if (typeof store.getSessions === 'function') {
      return store.getSessions();
    }
    return [];
  }, []);

  if (!sessions || sessions.length === 0) {
    return { sessions: [], total: 0 };
  }

  var result = [];
  for (var i = 0; i < sessions.length; i++) {
    var session = sessions[i];
    var timeline = build(session.id);
    result.push({
      sessionId: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      eventCount: timeline ? timeline.summary.total : 0,
      status: session.status || 'unknown'
    });
  }

  return {
    sessions: result,
    total: result.length
  };
}

// ============================================================
// RESET
// ============================================================

export function reset() {
  _timelineCache = null;
  if (isDebugMode()) {
    console.log('[Event Timeline] Cache reset');
  }
}

function getDefaultTimeline() {
  return {
    entries: [],
    summary: {
      total: 0,
      categories: {},
      sources: {},
      timeRange: {
        start: null,
        end: null,
        duration: null,
        formattedDuration: null
      }
    }
  };
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initTimeline() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Event Timeline] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeEventTimeline = {
    build: build,
    getTimeline: getTimeline,
    getSessionTimeline: getSessionTimeline,
    getEntries: getEntries,
    getSummary: getSummary,
    filterByCategory: filterByCategory,
    filterBySource: filterBySource,
    filterByEvent: filterByEvent,
    filterByTimeRange: filterByTimeRange,
    filterByKeyword: filterByKeyword,
    getCategoryDistribution: getCategoryDistribution,
    getSourceDistribution: getSourceDistribution,
    getEventFrequency: getEventFrequency,
    getTimeRange: getTimeRange,
    toJSON: toJSON,
    toCSV: toCSV,
    getSessionTimelineSummary: getSessionTimelineSummary,
    reset: reset,
    init: function() {
      var result = initTimeline();
      console.log('✅ RuntimeEventTimeline ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventTimeline = window.runtimeEventTimeline;
  }
}
