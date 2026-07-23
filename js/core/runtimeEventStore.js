/**
 * Runtime Event Store
 * Runtime Event Storage Engine
 * Part 44.4 - Runtime Event Store Implementation
 */

// ============================================================
// STORE STATE
// ============================================================

var _currentSession = null;
var _sessions = [];
var _events = [];
var _eventMap = {};
var _isInitialized = false;
var _sessionCounter = 0;
var _maxEventsPerSession = 10000;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isDebugMode() {
    try {
        var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
        if (manifest && typeof manifest.isDebugMode === 'function') {
            return manifest.isDebugMode();
        }
    } catch (e) { /* ignore */ }
    return false;
}

function generateSessionId() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    _sessionCounter++;
    return 'evt_session_' + timestamp + '_' + _sessionCounter;
}

function safeCall(fn, fallback) {
    try {
        return fn();
    } catch (e) {
        if (isDebugMode()) {
            console.warn('[Event Store] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export function createSession(metadata) {
    if (_currentSession) {
        if (isDebugMode()) {
            console.warn('[Event Store] Session already active');
        }
        return _currentSession;
    }

    var session = {
        id: generateSessionId(),
        startTime: new Date().toISOString(),
        endTime: null,
        eventCount: 0,
        metadata: metadata || {},
        status: 'active'
    };

    _currentSession = session;
    _sessions.push(session);

    if (isDebugMode()) {
        console.log('[Event Store] Session Created:', session.id);
    }

    return session;
}

export function closeSession(metadata) {
    if (!_currentSession) {
        if (isDebugMode()) {
            console.warn('[Event Store] No active session to close');
        }
        return null;
    }

    _currentSession.endTime = new Date().toISOString();
    _currentSession.status = 'closed';
    if (metadata) {
        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                _currentSession.metadata[key] = metadata[key];
            }
        }
    }

    var closedSession = _currentSession;
    _currentSession = null;

    if (isDebugMode()) {
        console.log('[Event Store] Session Closed:', closedSession.id, 'Events:', closedSession.eventCount);
    }

    return closedSession;
}

export function getCurrentSession() {
    return _currentSession;
}

export function getSession(sessionId) {
    for (var i = 0; i < _sessions.length; i++) {
        if (_sessions[i].id === sessionId) {
            return _sessions[i];
        }
    }
    return null;
}

export function getSessions() {
    return _sessions.slice();
}

export function getSessionCount() {
    return _sessions.length;
}

// ============================================================
// EVENT STORAGE
// ============================================================

export function addEvent(record) {
    if (!record) {
        if (isDebugMode()) {
            console.warn('[Event Store] addEvent called with null record');
        }
        return false;
    }

    // Validate record has required fields
    if (!record.id || !record.eventId || !record.timestamp) {
        if (isDebugMode()) {
            console.warn('[Event Store] Invalid record format:', record);
        }
        return false;
    }

    // Check for duplicate
    if (_eventMap[record.id]) {
        if (isDebugMode()) {
            console.warn('[Event Store] Duplicate record:', record.id);
        }
        return false;
    }

    // Ensure session exists
    if (!_currentSession) {
        if (isDebugMode()) {
            console.warn('[Event Store] No active session, creating one');
        }
        createSession();
    }

    // Add event
    _events.push(record);
    _eventMap[record.id] = record;
    _currentSession.eventCount++;

    // Trim if exceeds max
    if (_events.length > _maxEventsPerSession) {
        var toRemove = _events.length - _maxEventsPerSession;
        var removed = _events.splice(0, toRemove);
        for (var i = 0; i < removed.length; i++) {
            delete _eventMap[removed[i].id];
        }
        if (isDebugMode()) {
            console.log('[Event Store] Trimmed', toRemove, 'old events');
        }
    }

    if (isDebugMode()) {
        console.log('[Event Store] Record Saved:', record.eventId, 'Session:', _currentSession.id);
    }

    return true;
}

export function addEvents(records) {
    if (!records || !Array.isArray(records) || records.length === 0) {
        return 0;
    }

    var added = 0;
    for (var i = 0; i < records.length; i++) {
        if (addEvent(records[i])) {
            added++;
        }
    }

    return added;
}

export function getEvent(eventId) {
    return _eventMap[eventId] || null;
}

export function getEvents() {
    return _events.slice();
}

export function getEventsByCategory(category) {
    var result = [];
    for (var i = 0; i < _events.length; i++) {
        if (_events[i].category === category) {
            result.push(_events[i]);
        }
    }
    return result;
}

export function getEventsBySource(source) {
    var result = [];
    for (var i = 0; i < _events.length; i++) {
        if (_events[i].source === source) {
            result.push(_events[i]);
        }
    }
    return result;
}

export function getEventsByEventId(eventId) {
    var result = [];
    for (var i = 0; i < _events.length; i++) {
        if (_events[i].eventId === eventId) {
            result.push(_events[i]);
        }
    }
    return result;
}

export function getSessionEvents(sessionId) {
    var session = getSession(sessionId);
    if (!session) return [];

    // Find events within session time range
    var start = new Date(session.startTime);
    var end = session.endTime ? new Date(session.endTime) : new Date();

    var result = [];
    for (var i = 0; i < _events.length; i++) {
        var ts = new Date(_events[i].timestamp);
        if (ts >= start && ts <= end) {
            result.push(_events[i]);
        }
    }
    return result;
}

export function getRecentEvents(limit) {
    limit = limit || 20;
    var recent = _events.slice(-limit);
    return recent.reverse();
}

export function getEventCount() {
    return _events.length;
}

export function getSessionEventCount(sessionId) {
    var session = getSession(sessionId);
    return session ? session.eventCount : 0;
}

// ============================================================
// STATISTICS
// ============================================================

export function getStatistics() {
    var stats = {
        totalEvents: _events.length,
        sessions: _sessions.length,
        currentSession: _currentSession ? _currentSession.id : null,
        categories: {},
        sources: {},
        eventTypes: {}
    };

    for (var i = 0; i < _events.length; i++) {
        var e = _events[i];
        if (e.category) {
            stats.categories[e.category] = (stats.categories[e.category] || 0) + 1;
        }
        if (e.source) {
            stats.sources[e.source] = (stats.sources[e.source] || 0) + 1;
        }
        if (e.eventId) {
            stats.eventTypes[e.eventId] = (stats.eventTypes[e.eventId] || 0) + 1;
        }
    }

    return stats;
}

// ============================================================
// CLEANUP
// ============================================================

export function clearSession() {
    _events = [];
    _eventMap = {};
    if (_currentSession) {
        _currentSession.eventCount = 0;
    }
    if (isDebugMode()) {
        console.log('[Event Store] Session cleared');
    }
}

export function resetStore() {
    _events = [];
    _eventMap = {};
    _sessions = [];
    _currentSession = null;
    _sessionCounter = 0;
    if (isDebugMode()) {
        console.log('[Event Store] Store reset');
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initStore() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    // Create initial session
    createSession({
        initialized: new Date().toISOString(),
        version: 'V4.4.4'
    });

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[Event Store] Initialized');
        console.log('[Event Store] Session:', _currentSession.id);
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.runtimeEventStore = {
        createSession: createSession,
        closeSession: closeSession,
        getCurrentSession: getCurrentSession,
        getSession: getSession,
        getSessions: getSessions,
        getSessionCount: getSessionCount,
        addEvent: addEvent,
        addEvents: addEvents,
        getEvent: getEvent,
        getEvents: getEvents,
        getEventsByCategory: getEventsByCategory,
        getEventsBySource: getEventsBySource,
        getEventsByEventId: getEventsByEventId,
        getSessionEvents: getSessionEvents,
        getRecentEvents: getRecentEvents,
        getEventCount: getEventCount,
        getSessionEventCount: getSessionEventCount,
        getStatistics: getStatistics,
        clearSession: clearSession,
        resetStore: resetStore,
        init: function() {
            var result = initStore();
            console.log('✅ RuntimeEventStore ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.RuntimeEventStore = window.runtimeEventStore;
    }
}
