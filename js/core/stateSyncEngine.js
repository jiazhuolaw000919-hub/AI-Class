/**
 * State Sync Engine
 * Runtime State Synchronization Engine
 * Part 45.3 - State Sync Engine
 */

// ============================================================
// ENGINE STATE
// ============================================================

var _states = {};
var _listeners = {};
var _history = [];
var _maxHistory = 100;
var _isInitialized = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getRegistry() {
    return LawAIApp.StateRegistry || window.stateRegistry;
}

function getSchema() {
    return LawAIApp.StateSchema || window.stateSchema;
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
            console.warn('[State Sync Engine] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

function generateUpdateId() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    var random = Math.random().toString(36).substring(2, 6);
    return 'sync_' + timestamp + '_' + random;
}

function getDefaultValue(schemaId) {
    var schema = getSchema();
    if (!schema) return {};
    var schemaDef = safeCall(function() {
        if (typeof schema.get === 'function') {
            return schema.get(schemaId);
        }
        return null;
    }, null);
    if (schemaDef && schemaDef.defaults) {
        return JSON.parse(JSON.stringify(schemaDef.defaults));
    }
    return {};
}

function validateAgainstSchema(schemaId, value) {
    var schema = getSchema();
    if (!schema) return { valid: true, errors: [] };
    return safeCall(function() {
        if (typeof schema.validate === 'function') {
            return schema.validate(schemaId, value);
        }
        return { valid: true, errors: [] };
    }, { valid: true, errors: [] });
}

// ============================================================
// BROADCAST SYSTEM
// ============================================================

function broadcast(stateId, oldValue, newValue, source, metadata) {
    var event = {
        type: 'STATE_CHANGED',
        payload: {
            stateId: stateId,
            oldValue: oldValue,
            newValue: newValue,
            source: source || 'unknown',
            timestamp: new Date().toISOString(),
            metadata: metadata || {}
        }
    };

    // Store in history
    _history.push(event.payload);
    if (_history.length > _maxHistory) {
        _history = _history.slice(-_maxHistory);
    }

    // Notify listeners
    if (_listeners[stateId]) {
        var listeners = _listeners[stateId];
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i](event.payload);
            } catch (e) {
                if (isDebugMode()) {
                    console.warn('[State Sync Engine] Listener error:', e.message);
                }
            }
        }
    }

    // Also broadcast to global listeners
    if (_listeners['*']) {
        var globalListeners = _listeners['*'];
        for (var i = 0; i < globalListeners.length; i++) {
            try {
                globalListeners[i](event.payload);
            } catch (e) {
                if (isDebugMode()) {
                    console.warn('[State Sync Engine] Global listener error:', e.message);
                }
            }
        }
    }

    if (isDebugMode()) {
        console.log('[State Sync Engine] Broadcast:', stateId, 'Source:', source);
    }
}

// ============================================================
// CORE API
// ============================================================

export function update(stateId, value, source, metadata) {
    if (!stateId) {
        console.warn('[State Sync Engine] update() called without stateId');
        return { success: false, error: 'Missing stateId' };
    }

    if (value === undefined || value === null) {
        console.warn('[State Sync Engine] update() called with invalid value');
        return { success: false, error: 'Invalid value' };
    }

    if (isDebugMode()) {
        console.log('[State Sync Engine] Update Request:', stateId, 'Source:', source || 'unknown');
    }

    // 1. Check if state exists
    var registry = getRegistry();
    if (!registry) {
        return { success: false, error: 'Registry not available' };
    }

    var stateDef = safeCall(function() {
        if (typeof registry.get === 'function') {
            return registry.get(stateId);
        }
        return null;
    }, null);

    if (!stateDef) {
        console.warn('[State Sync Engine] State not found:', stateId);
        return { success: false, error: 'State not found: ' + stateId };
    }

    // 2. Check ownership
    if (source && stateDef.owner !== source) {
        console.warn('[State Sync Engine] Ownership violation:', stateId, 'Owner:', stateDef.owner, 'Source:', source);
        return { success: false, error: 'Ownership violation: ' + stateDef.owner + ' owns this state' };
    }

    // 3. Validate against schema
    if (stateDef.schema) {
        var validation = validateAgainstSchema(stateDef.schema, value);
        if (!validation.valid) {
            console.warn('[State Sync Engine] Schema validation failed:', stateId, validation.errors.join('; '));
            return { success: false, error: 'Schema validation failed: ' + validation.errors.join('; ') };
        }
    }

    // 4. Get old value
    var oldValue = _states[stateId] !== undefined ? _states[stateId] : getDefaultValue(stateDef.schema);

    // 5. Apply update
    _states[stateId] = JSON.parse(JSON.stringify(value));

    // 6. Broadcast
    broadcast(stateId, oldValue, value, source || stateDef.owner, metadata);

    if (isDebugMode()) {
        console.log('[State Sync Engine] Update Applied:', stateId);
    }

    return {
        success: true,
        stateId: stateId,
        oldValue: oldValue,
        newValue: value,
        source: source || stateDef.owner,
        timestamp: new Date().toISOString()
    };
}

export function get(stateId) {
    if (!stateId) {
        console.warn('[State Sync Engine] get() called without stateId');
        return null;
    }

    if (_states[stateId] !== undefined) {
        return JSON.parse(JSON.stringify(_states[stateId]));
    }

    // Try to get default from schema
    var registry = getRegistry();
    if (registry) {
        var stateDef = safeCall(function() {
            if (typeof registry.get === 'function') {
                return registry.get(stateId);
            }
            return null;
        }, null);

        if (stateDef && stateDef.schema) {
            var defaultValue = getDefaultValue(stateDef.schema);
            _states[stateId] = defaultValue;
            return JSON.parse(JSON.stringify(defaultValue));
        }
    }

    return null;
}

export function getAll() {
    var result = {};
    for (var key in _states) {
        if (_states.hasOwnProperty(key)) {
            result[key] = JSON.parse(JSON.stringify(_states[key]));
        }
    }
    return result;
}

export function sync() {
    if (isDebugMode()) {
        console.log('[State Sync Engine] Syncing all states...');
    }

    var registry = getRegistry();
    if (!registry) {
        return { success: false, error: 'Registry not available' };
    }

    var states = safeCall(function() {
        if (typeof registry.getAll === 'function') {
            return registry.getAll();
        }
        return [];
    }, []);

    var synced = 0;
    for (var i = 0; i < states.length; i++) {
        var stateDef = states[i];
        if (stateDef.enabled && _states[stateDef.id] === undefined) {
            var defaultValue = getDefaultValue(stateDef.schema);
            _states[stateDef.id] = defaultValue;
            synced++;
        }
    }

    if (isDebugMode()) {
        console.log('[State Sync Engine] Sync complete, initialized:', synced);
    }

    return { success: true, synced: synced };
}

// ============================================================
// SUBSCRIPTION SYSTEM
// ============================================================

export function subscribe(stateId, callback) {
    if (!stateId) {
        console.warn('[State Sync Engine] subscribe() called without stateId');
        return false;
    }

    if (typeof callback !== 'function') {
        console.warn('[State Sync Engine] subscribe() called without callback');
        return false;
    }

    if (!_listeners[stateId]) {
        _listeners[stateId] = [];
    }

    _listeners[stateId].push(callback);

    if (isDebugMode()) {
        console.log('[State Sync Engine] Subscriber added:', stateId, 'Total:', _listeners[stateId].length);
    }

    return true;
}

export function unsubscribe(stateId, callback) {
    if (!stateId || !_listeners[stateId]) {
        return false;
    }

    if (callback) {
        var index = _listeners[stateId].indexOf(callback);
        if (index !== -1) {
            _listeners[stateId].splice(index, 1);
            if (isDebugMode()) {
                console.log('[State Sync Engine] Subscriber removed:', stateId);
            }
            return true;
        }
        return false;
    }

    // Remove all listeners for this state
    delete _listeners[stateId];
    if (isDebugMode()) {
        console.log('[State Sync Engine] All subscribers removed:', stateId);
    }
    return true;
}

export function subscribeGlobal(callback) {
    return subscribe('*', callback);
}

export function unsubscribeGlobal(callback) {
    return unsubscribe('*', callback);
}

export function getListeners(stateId) {
    if (stateId && _listeners[stateId]) {
        return _listeners[stateId].length;
    }
    if (stateId) {
        return 0;
    }
    var total = 0;
    for (var key in _listeners) {
        if (_listeners.hasOwnProperty(key)) {
            total += _listeners[key].length;
        }
    }
    return total;
}

// ============================================================
// HISTORY
// ============================================================

export function getHistory(stateId, limit) {
    limit = limit || 20;
    var history = _history;

    if (stateId) {
        history = history.filter(function(h) { return h.stateId === stateId; });
    }

    return history.slice(-limit);
}

export function getLastChange(stateId) {
    var history = getHistory(stateId, 1);
    return history.length > 0 ? history[0] : null;
}

export function clearHistory() {
    _history = [];
    if (isDebugMode()) {
        console.log('[State Sync Engine] History cleared');
    }
}

// ============================================================
// RESET
// ============================================================

export function reset() {
    _states = {};
    _history = [];
    _listeners = {};
    if (isDebugMode()) {
        console.log('[State Sync Engine] Reset complete');
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initEngine() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    // Sync default states
    sync();

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[State Sync Engine] Initialized');
        console.log('[State Sync Engine] States:', Object.keys(_states).length);
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.stateSyncEngine = {
        update: update,
        get: get,
        getAll: getAll,
        sync: sync,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        subscribeGlobal: subscribeGlobal,
        unsubscribeGlobal: unsubscribeGlobal,
        getListeners: getListeners,
        getHistory: getHistory,
        getLastChange: getLastChange,
        clearHistory: clearHistory,
        reset: reset,
        init: function() {
            var result = initEngine();
            console.log('✅ StateSyncEngine ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StateSyncEngine = window.stateSyncEngine;
    }
}
