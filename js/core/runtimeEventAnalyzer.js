/**
 * Runtime Event Analyzer
 * Runtime Event Analysis Engine
 * Part 44.5 - Runtime Event Analyzer Implementation
 */

// ============================================================
// ANALYZER STATE
// ============================================================

var _analysisCache = null;
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
      console.warn('[Event Analyzer] Error:', e.message);
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

// ============================================================
// STATISTICS
// ============================================================

function calculateStatistics(events) {
  if (!events || events.length === 0) {
    return {
      total: 0,
      categories: {},
      sources: {},
      eventTypes: {},
      timeline: {
        first: null,
        last: null,
        duration: null
      }
    };
  }

  var categories = {};
  var sources = {};
  var eventTypes = {};

  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    if (e.category) {
      categories[e.category] = (categories[e.category] || 0) + 1;
    }
    if (e.source) {
      sources[e.source] = (sources[e.source] || 0) + 1;
    }
    if (e.eventId) {
      eventTypes[e.eventId] = (eventTypes[e.eventId] || 0) + 1;
    }
  }

  // Sort event types by frequency
  var sortedTypes = Object.keys(eventTypes).sort(function(a, b) {
    return eventTypes[b] - eventTypes[a];
  });

  var first = events[0] ? events[0].timestamp : null;
  var last = events[events.length - 1] ? events[events.length - 1].timestamp : null;
  var duration = null;
  if (first && last) {
    duration = new Date(last) - new Date(first);
  }

  return {
    total: events.length,
    categories: categories,
    sources: sources,
    eventTypes: eventTypes,
    topEvents: sortedTypes.slice(0, 10).map(function(id) {
      return {
        eventId: id,
        name: getEventName(id),
        count: eventTypes[id]
      };
    }),
    timeline: {
      first: first,
      last: last,
      duration: duration
    }
  };
}

// ============================================================
// SEQUENCE ANALYSIS
// ============================================================

function findSequences(events, minLength) {
  minLength = minLength || 2;
  var sequences = [];
  var seen = {};

  if (!events || events.length < minLength) {
    return sequences;
  }

  // Find repeating sequences
  for (var i = 0; i < events.length - minLength + 1; i++) {
    var seq = [];
    var key = '';
    for (var j = 0; j < minLength; j++) {
      var e = events[i + j];
      seq.push(e.eventId);
      key += e.eventId + '|';
    }

    if (!seen[key]) {
      seen[key] = true;
      // Count occurrences
      var count = 0;
      for (var k = 0; k < events.length - minLength + 1; k++) {
        var match = true;
        for (var m = 0; m < minLength; m++) {
          if (events[k + m].eventId !== seq[m]) {
            match = false;
            break;
          }
        }
        if (match) count++;
      }

      if (count > 1) {
        sequences.push({
          sequence: seq.map(function(id) { return { eventId: id, name: getEventName(id) }; }),
          length: minLength,
          occurrences: count
        });
      }
    }
  }

  // Sort by occurrences
  sequences.sort(function(a, b) {
    return b.occurrences - a.occurrences;
  });

  return sequences;
}

function buildEventChain(events) {
  if (!events || events.length === 0) {
    return [];
  }

  var chain = [];
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    chain.push({
      eventId: e.eventId,
      name: getEventName(e.eventId),
      timestamp: e.timestamp,
      source: e.source,
      category: e.category
    });
  }

  return chain;
}

// ============================================================
// RELATIONSHIP ANALYSIS
// ============================================================

function findRelationships(events) {
  var relationships = [];

  if (!events || events.length < 2) {
    return relationships;
  }

  // Find event pairs that frequently appear together
  var pairs = {};
  for (var i = 0; i < events.length - 1; i++) {
    var key = events[i].eventId + '→' + events[i + 1].eventId;
    pairs[key] = (pairs[key] || 0) + 1;
  }

  var sortedPairs = Object.keys(pairs).sort(function(a, b) {
    return pairs[b] - pairs[a];
  });

  // Get top relationships
  var topPairs = sortedPairs.slice(0, 20);
  for (var i = 0; i < topPairs.length; i++) {
    var parts = topPairs[i].split('→');
    relationships.push({
      from: parts[0],
      fromName: getEventName(parts[0]),
      to: parts[1],
      toName: getEventName(parts[1]),
      count: pairs[topPairs[i]]
    });
  }

  return relationships;
}

// ============================================================
// PATTERN DETECTION
// ============================================================

function detectPatterns(events) {
  var patterns = {
    repeated: [],
    missing: [],
    unexpected: []
  };

  if (!events || events.length === 0) {
    return patterns;
  }

  // Detect repeated events
  var eventCounts = {};
  for (var i = 0; i < events.length; i++) {
    eventCounts[events[i].eventId] = (eventCounts[events[i].eventId] || 0) + 1;
  }

  for (var key in eventCounts) {
    if (eventCounts.hasOwnProperty(key)) {
      if (eventCounts[key] > 3) {
        patterns.repeated.push({
          eventId: key,
          name: getEventName(key),
          count: eventCounts[key]
        });
      }
    }
  }

  // Sort repeated by count
  patterns.repeated.sort(function(a, b) {
    return b.count - a.count;
  });

  // Detect missing events (expected but not found)
  // This requires registry to know what events exist
  var registry = getRegistry();
  if (registry) {
    var allEvents = safeCall(function() {
      if (typeof registry.getAll === 'function') {
        return registry.getAll();
      }
      return [];
    }, []);

    var presentEvents = {};
    for (var i = 0; i < events.length; i++) {
      presentEvents[events[i].eventId] = true;
    }

    for (var i = 0; i < allEvents.length; i++) {
      var e = allEvents[i];
      if (e.enabled && !presentEvents[e.id]) {
        patterns.missing.push({
          eventId: e.id,
          name: e.name
        });
      }
    }
  }

  return patterns;
}

// ============================================================
// CORE API
// ============================================================

export function analyze(sessionId) {
  var store = getStore();
  if (!store) {
    if (isDebugMode()) {
      console.warn('[Event Analyzer] Store not available');
    }
    return getDefaultResult();
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
      console.warn('[Event Analyzer] No events to analyze');
    }
    return getDefaultResult();
  }

  if (isDebugMode()) {
    console.log('[Event Analyzer] Analysis Started, Events:', events.length);
  }

  // Calculate statistics
  var stats = calculateStatistics(events);

  // Find sequences
  var sequences = findSequences(events, 2);
  var longSequences = findSequences(events, 3);

  // Build event chain
  var chain = buildEventChain(events);

  // Find relationships
  var relationships = findRelationships(events);

  // Detect patterns
  var patterns = detectPatterns(events);

  // Build result
  var result = {
    summary: {
      totalEvents: events.length,
      categories: Object.keys(stats.categories).length,
      sources: Object.keys(stats.sources).length,
      uniqueEvents: Object.keys(stats.eventTypes).length,
      firstEvent: stats.timeline.first,
      lastEvent: stats.timeline.last,
      duration: stats.timeline.duration
    },
    statistics: stats,
    sequences: {
      short: sequences,
      long: longSequences
    },
    chain: chain.slice(0, 50),
    relationships: relationships.slice(0, 20),
    patterns: patterns,
    timestamp: new Date().toISOString()
  };

  _analysisCache = result;

  if (isDebugMode()) {
    console.log('[Event Analyzer] Analysis Completed');
    console.log('[Event Analyzer] Events:', result.summary.totalEvents);
    console.log('[Event Analyzer] Sequences:', sequences.length);
    console.log('[Event Analyzer] Relationships:', relationships.length);
  }

  return result;
}

export function analyzeHistory(limit) {
  limit = limit || 10;
  var store = getStore();
  if (!store) {
    return { sessions: [], summary: { total: 0 } };
  }

  var sessions = safeCall(function() {
    if (typeof store.getSessions === 'function') {
      return store.getSessions();
    }
    return [];
  }, []);

  if (!sessions || sessions.length === 0) {
    return { sessions: [], summary: { total: 0 } };
  }

  var recent = sessions.slice(-limit);
  var results = [];

  for (var i = 0; i < recent.length; i++) {
    var session = recent[i];
    var analysis = analyze(session.id);
    if (analysis) {
      results.push({
        sessionId: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        eventCount: analysis.summary.totalEvents,
        categories: analysis.summary.categories,
        analysis: analysis
      });
    }
  }

  return {
    sessions: results,
    summary: {
      total: results.length,
      totalEvents: results.reduce(function(sum, s) { return sum + s.eventCount; }, 0)
    }
  };
}

export function findSequence(sequence, sessionId) {
  if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
    return [];
  }

  var events = [];
  var store = getStore();
  if (store) {
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
  }

  if (!events || events.length === 0) {
    return [];
  }

  var matches = [];
  for (var i = 0; i < events.length - sequence.length + 1; i++) {
    var match = true;
    for (var j = 0; j < sequence.length; j++) {
      if (events[i + j].eventId !== sequence[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      matches.push({
        start: i,
        end: i + sequence.length - 1,
        events: events.slice(i, i + sequence.length)
      });
    }
  }

  return matches;
}

export function findRelationship(fromEvent, toEvent, sessionId) {
  var events = [];
  var store = getStore();
  if (store) {
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
  }

  if (!events || events.length === 0) {
    return [];
  }

  var relationships = [];
  for (var i = 0; i < events.length - 1; i++) {
    if (events[i].eventId === fromEvent && events[i + 1].eventId === toEvent) {
      relationships.push({
        from: events[i],
        to: events[i + 1],
        gap: new Date(events[i + 1].timestamp) - new Date(events[i].timestamp)
      });
    }
  }

  return relationships;
}

export function getStatistics() {
  if (!_analysisCache) {
    analyze();
  }
  return _analysisCache ? _analysisCache.statistics : null;
}

export function reset() {
  _analysisCache = null;
  if (isDebugMode()) {
    console.log('[Event Analyzer] Cache reset');
  }
}

function getDefaultResult() {
  return {
    summary: {
      totalEvents: 0,
      categories: 0,
      sources: 0,
      uniqueEvents: 0,
      firstEvent: null,
      lastEvent: null,
      duration: null
    },
    statistics: {
      total: 0,
      categories: {},
      sources: {},
      eventTypes: {},
      topEvents: [],
      timeline: { first: null, last: null, duration: null }
    },
    sequences: { short: [], long: [] },
    chain: [],
    relationships: [],
    patterns: { repeated: [], missing: [], unexpected: [] },
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initAnalyzer() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Event Analyzer] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeEventAnalyzer = {
    analyze: analyze,
    analyzeHistory: analyzeHistory,
    findSequence: findSequence,
    findRelationship: findRelationship,
    getStatistics: getStatistics,
    reset: reset,
    init: function() {
      var result = initAnalyzer();
      console.log('✅ RuntimeEventAnalyzer ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventAnalyzer = window.runtimeEventAnalyzer;
  }
}
