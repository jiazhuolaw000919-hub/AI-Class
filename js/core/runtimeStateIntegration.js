/**
 * Runtime State Integration
 * Runtime State Integration Layer
 * Part 45.7 - Runtime State Integration
 * Part 45.9 - Fixed: State updates via Event, not direct calls
 */

// ============================================================
// INTEGRATION STATE
// ============================================================

var _isInitialized = false;
var _integrationHandlers = {};
var _stateEventMap = {};
var _eventListenersSetup = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getEngine() {
    return LawAIApp.StateSyncEngine || window.stateSyncEngine;
}

function getEventCollector() {
    return LawAIApp.RuntimeEventCollector || window.runtimeEventCollector;
}

function getIntelligence() {
    return LawAIApp.StateIntelligence || window.stateIntelligence;
}

function getManifest() {
    return LawAIApp.StateSyncManifest || window.stateSyncManifest;
}

function isDebugMode() {
    try {
        var manifest = getManifest();
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
            console.warn('[State Integration] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

// ============================================================
// EVENT TO STATE MAPPING
// ============================================================

// Default Event → State mappings
var DEFAULT_MAPPINGS = {
    'runtime.boot.start': {
        stateId: 'runtime.state',
        transform: function(payload) {
            return { status: 'booting', ready: false, startedAt: new Date().toISOString() };
        }
    },
    'runtime.boot.complete': {
        stateId: 'runtime.state',
        transform: function(payload) {
            return { status: 'running', ready: true, bootDuration: payload.duration || 0, bootCompletedAt: new Date().toISOString() };
        }
    },
    'runtime.module.loaded': {
        stateId: 'module.state',
        transform: function(payload) {
            return { loaded: true, ready: false, name: payload.moduleName || 'unknown' };
        }
    },
    'runtime.module.ready': {
        stateId: 'module.state',
        transform: function(payload) {
            return { loaded: true, ready: true, name: payload.moduleName || 'unknown' };
        }
    },
    'runtime.module.failed': {
        stateId: 'module.state',
        transform: function(payload) {
            return { loaded: false, ready: false, name: payload.moduleName || 'unknown', error: payload.error || 'unknown' };
        }
    },
    'learning.lesson.completed': {
        stateId: 'learning.state',
        transform: function(payload) {
            var currentProgress = arguments[1] || 0;
            var newProgress = Math.min(currentProgress + 10, 100);
            return { 
                currentLesson: payload.lessonId || 'unknown', 
                progress: newProgress,
                completed: newProgress >= 100,
                lastCompleted: new Date().toISOString()
            };
        }
    },
    'session.started': {
        stateId: 'session.state',
        transform: function(payload) {
            return { active: true, sessionId: payload.sessionId || 'unknown' };
        }
    },
    'session.ended': {
        stateId: 'session.state',
        transform: function(payload) {
            return { active: false, sessionId: payload.sessionId || 'unknown', endedAt: new Date().toISOString() };
        }
    }
};

// ============================================================
// 🆕 EVENT LISTENER SETUP (Part 45.9)
// ============================================================

function setupEventListeners() {
    if (_eventListenersSetup) return;
    
    var collector = getEventCollector();
    if (!collector) {
        if (isDebugMode()) {
            console.warn('[State Integration] Event collector not available for listeners');
        }
        return;
    }

    if (isDebugMode()) {
        console.log('[State Integration] Setting up event listeners...');
    }

    // Use the collector's on method if available
    if (typeof collector.on === 'function') {
        // Listen to boot events
        collector.on('BOOT_STARTED', function(payload) {
            if (isDebugMode()) {
                console.log('[State Integration] Received BOOT_STARTED event');
            }
            var engine = getEngine();
            if (engine && typeof engine.update === 'function') {
                engine.update('runtime.state', {
                    status: 'booting',
                    ready: false,
                    startedAt: payload.timestamp || new Date().toISOString()
                }, 'RuntimeEventCollector', { source: 'BOOT_STARTED' });
            }
        });

        collector.on('BOOT_COMPLETE', function(payload) {
            if (isDebugMode()) {
                console.log('[State Integration] Received BOOT_COMPLETE event');
            }
            var engine = getEngine();
            if (engine && typeof engine.update === 'function') {
                engine.update('runtime.state', {
                    status: 'running',
                    ready: true,
                    bootDuration: payload.duration || 0,
                    bootCompletedAt: new Date().toISOString()
                }, 'RuntimeEventCollector', { source: 'BOOT_COMPLETE' });
            }
        });

        // Listen to module events
        collector.on('MODULE_LOADED', function(payload) {
            if (isDebugMode()) {
                console.log('[State Integration] Received MODULE_LOADED event');
            }
            var engine = getEngine();
            if (engine && typeof engine.update === 'function') {
                engine.update('module.state', {
                    loaded: true,
                    ready: false,
                    name: payload.moduleName || 'unknown'
                }, 'RuntimeEventCollector', { source: 'MODULE_LOADED' });
            }
        });

        collector.on('MODULE_READY', function(payload) {
            if (isDebugMode()) {
                console.log('[State Integration] Received MODULE_READY event');
            }
            var engine = getEngine();
            if (engine && typeof engine.update === 'function') {
                engine.update('module.state', {
                    loaded: true,
                    ready: true,
                    name: payload.moduleName || 'unknown'
                }, 'RuntimeEventCollector', { source: 'MODULE_READY' });
            }
        });

        _eventListenersSetup = true;
        if (isDebugMode()) {
            console.log('[State Integration] Event listeners established');
        }
    } else {
        if (isDebugMode()) {
            console.warn('[State Integration] Event collector does not support .on() method');
        }
    }
}

// ============================================================
// REGISTRATION API
// ============================================================

export function registerMapping(eventId, stateId, transformFn) {
    if (!eventId || !stateId) {
        console.warn('[State Integration] Invalid mapping registration');
        return false;
    }

    _stateEventMap[eventId] = {
        stateId: stateId,
        transform: transformFn || function(payload) { return payload; }
    };

    if (isDebugMode()) {
        console.log('[State Integration] Mapping registered:', eventId, '→', stateId);
    }

    return true;
}

export function registerMappings(mappings) {
    var registered = 0;
    for (var eventId in mappings) {
        if (mappings.hasOwnProperty(eventId)) {
            var mapping = mappings[eventId];
            if (registerMapping(eventId, mapping.stateId, mapping.transform)) {
                registered++;
            }
        }
    }
    return registered;
}

export function getMapping(eventId) {
    return _stateEventMap[eventId] || null;
}

export function getMappings() {
    return JSON.parse(JSON.stringify(_stateEventMap));
}

export function removeMapping(eventId) {
    if (_stateEventMap[eventId]) {
        delete _stateEventMap[eventId];
        if (isDebugMode()) {
            console.log('[State Integration] Mapping removed:', eventId);
        }
        return true;
    }
    return false;
}

// ============================================================
// EVENT HANDLER
// ============================================================

export function handleEvent(event) {
    if (!event || !event.eventId) {
        return { success: false, error: 'Invalid event' };
    }

    var mapping = getMapping(event.eventId);
    if (!mapping) {
        return { success: false, error: 'No mapping for event: ' + event.eventId };
    }

    var engine = getEngine();
    if (!engine) {
        return { success: false, error: 'Engine not available' };
    }

    var currentValue = safeCall(function() {
        if (typeof engine.get === 'function') {
            return engine.get(mapping.stateId);
        }
        return null;
    }, null);

    var newValue;
    try {
        if (typeof mapping.transform === 'function') {
            newValue = mapping.transform(event.payload || {}, currentValue);
        } else {
            newValue = event.payload || {};
        }
    } catch (e) {
        if (isDebugMode()) {
            console.warn('[State Integration] Transform error:', e.message);
        }
        return { success: false, error: 'Transform failed: ' + e.message };
    }

    var result = safeCall(function() {
        if (typeof engine.update === 'function') {
            return engine.update(mapping.stateId, newValue, 'Event:' + event.eventId, {
                eventId: event.eventId,
                eventSource: event.source,
                eventTimestamp: event.timestamp
            });
        }
        return null;
    }, null);

    if (result && result.success) {
        if (isDebugMode()) {
            console.log('[State Integration] State updated via event:', event.eventId, '→', mapping.stateId);
        }
        return { success: true, stateId: mapping.stateId, newValue: newValue };
    }

    return { success: false, error: 'Update failed' };
}

// ============================================================
// AUTO INTEGRATION
// ============================================================

export function setupAutoIntegration() {
    var collector = getEventCollector();
    if (!collector) {
        if (isDebugMode()) {
            console.warn('[State Integration] Event collector not available');
        }
        return false;
    }

    var registered = registerMappings(DEFAULT_MAPPINGS);

    // 🆕 Setup event listeners for state updates
    setupEventListeners();

    if (isDebugMode()) {
        console.log('[State Integration] Auto integration setup:', registered + ' mappings registered');
    }

    return true;
}

// ============================================================
// INTEGRATION WITH PERFORMANCE
// ============================================================

export function handlePerformanceMetric(metricId, value, metadata) {
    if (!metricId) return { success: false, error: 'Invalid metric' };

    var engine = getEngine();
    if (!engine) {
        return { success: false, error: 'Engine not available' };
    }

    var stateId = null;
    var newValue = {};

    if (metricId === 'BOOT_TIME') {
        stateId = 'runtime.state';
        var currentState = safeCall(function() {
            if (typeof engine.get === 'function') {
                return engine.get(stateId);
            }
            return null;
        }, {});

        newValue = {
            status: currentState.status || 'running',
            ready: currentState.ready || true,
            bootDuration: value,
            lastBootTime: new Date().toISOString()
        };
    } else if (metricId === 'RUNTIME_HEALTH') {
        stateId = 'runtime.state';
        var currentState = safeCall(function() {
            if (typeof engine.get === 'function') {
                return engine.get(stateId);
            }
            return null;
        }, {});

        newValue = {
            status: value < 60 ? 'degraded' : (currentState.status || 'running'),
            ready: currentState.ready || true,
            healthScore: value,
            lastHealthUpdate: new Date().toISOString()
        };
    } else {
        return { success: false, error: 'No state mapping for metric: ' + metricId };
    }

    if (stateId) {
        var result = safeCall(function() {
            if (typeof engine.update === 'function') {
                return engine.update(stateId, newValue, 'Performance:' + metricId, {
                    metricId: metricId,
                    metadata: metadata || {}
                });
            }
            return null;
        }, null);

        if (result && result.success) {
            if (isDebugMode()) {
                console.log('[State Integration] State updated via performance:', metricId, '→', stateId);
            }
            return { success: true, stateId: stateId };
        }
    }

    return { success: false, error: 'Update failed' };
}

// ============================================================
// 🆕 DEPRECATED: Boot Integration (Part 45.9 - No longer used)
// ============================================================

export function initBootState() {
    if (isDebugMode()) {
        console.warn('[State Integration] initBootState() is deprecated. Use Event-based state updates instead.');
    }
    // Event listeners now handle this via BOOT_STARTED event
    return { success: true, message: 'Deprecated - use Event-based updates' };
}

export function completeBootState(duration, success) {
    if (isDebugMode()) {
        console.warn('[State Integration] completeBootState() is deprecated. Use Event-based state updates instead.');
    }
    // Event listeners now handle this via BOOT_COMPLETE event
    return { success: true, message: 'Deprecated - use Event-based updates' };
}

// ============================================================
// UNIFIED RUNTIME STATE
// ============================================================

export function getUnifiedState() {
    var engine = getEngine();
    if (!engine) {
        return { success: false, error: 'Engine not available' };
    }

    var allStates = safeCall(function() {
        if (typeof engine.getAll === 'function') {
            return engine.getAll();
        }
        return {};
    }, {});

    var unified = {
        runtime: allStates['runtime.state'] || { status: 'unknown', ready: false },
        modules: allStates['module.state'] || { loaded: false, ready: false },
        learning: allStates['learning.state'] || { progress: 0, completed: false },
        session: allStates['session.state'] || { active: false },
        health: allStates['health.state'] || { score: 100, status: 'healthy' },
        timestamp: new Date().toISOString(),
        success: true
    };

    return unified;
}

// ============================================================
// INTEGRATION STATUS
// ============================================================

export function getIntegrationStatus() {
    var status = {
        initialized: _isInitialized,
        mappings: Object.keys(_stateEventMap).length,
        engineAvailable: !!getEngine(),
        collectorAvailable: !!getEventCollector(),
        intelligenceAvailable: !!getIntelligence(),
        eventListenersActive: _eventListenersSetup
    };

    return status;
}

// ============================================================
// RESET
// ============================================================

export function reset() {
    _stateEventMap = {};
    _integrationHandlers = {};
    _eventListenersSetup = false;
    if (isDebugMode()) {
        console.log('[State Integration] Reset complete');
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initIntegration() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    var setupResult = setupAutoIntegration();

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[State Integration] Initialized');
        console.log('[State Integration] Mappings:', Object.keys(_stateEventMap).length);
        console.log('[State Integration] Event Listeners:', _eventListenersSetup ? '✅ Active' : '❌ Inactive');
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.runtimeStateIntegration = {
        registerMapping: registerMapping,
        registerMappings: registerMappings,
        getMapping: getMapping,
        getMappings: getMappings,
        removeMapping: removeMapping,
        handleEvent: handleEvent,
        setupAutoIntegration: setupAutoIntegration,
        handlePerformanceMetric: handlePerformanceMetric,
        // Deprecated - kept for backward compatibility
        initBootState: initBootState,
        completeBootState: completeBootState,
        getUnifiedState: getUnifiedState,
        getIntegrationStatus: getIntegrationStatus,
        reset: reset,
        init: function() {
            var result = initIntegration();
            console.log('✅ RuntimeStateIntegration ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.RuntimeStateIntegration = window.runtimeStateIntegration;
    }
}
