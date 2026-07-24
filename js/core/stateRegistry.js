/**
 * State Registry
 * Runtime State Registry Manager
 * Part 45.2 - State Registry + Schema
 */

import { create as createSchema, validate as validateSchema } from './stateSchema.js';

// ============================================================
// REGISTRY STORE
// ============================================================

var _states = {};
var _stateIds = [];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isDebugMode() {
    try {
        var manifest = LawAIApp.StateSyncManifest || window.stateSyncManifest;
        if (manifest && typeof manifest.isDebugMode === 'function') {
            return manifest.isDebugMode();
        }
    } catch (e) { /* ignore */ }
    return false;
}

function getDefaultOwners() {
    try {
        var manifest = LawAIApp.StateSyncManifest || window.stateSyncManifest;
        if (manifest && typeof manifest.getDefaultOwners === 'function') {
            return manifest.getDefaultOwners();
        }
    } catch (e) { /* ignore */ }
    return {};
}

// ============================================================
// VALIDATION
// ============================================================

export function validateState(state) {
    var errors = [];

    if (!state) {
        errors.push('State is null or undefined');
        return errors;
    }

    // Required: id
    if (!state.id || typeof state.id !== 'string' || state.id.trim() === '') {
        errors.push('Missing or invalid id');
    }

    // Required: owner
    if (!state.owner || typeof state.owner !== 'string' || state.owner.trim() === '') {
        errors.push('Missing or invalid owner');
    }

    // Required: schema
    if (!state.schema || typeof state.schema !== 'string' || state.schema.trim() === '') {
        errors.push('Missing or invalid schema');
    }

    // Optional: version
    if (state.version && typeof state.version !== 'string') {
        errors.push('Version must be a string');
    }

    // Optional: enabled
    if (state.enabled !== undefined && typeof state.enabled !== 'boolean') {
        errors.push('Enabled must be a boolean');
    }

    // Check if schema exists
    if (state.schema) {
        var schema = LawAIApp.StateSchema ? LawAIApp.StateSchema.get(state.schema) : null;
        if (!schema) {
            errors.push('Schema not found: ' + state.schema);
        }
    }

    return errors;
}

// ============================================================
// CORE API
// ============================================================

export function register(state) {
    var errors = validateState(state);
    if (errors.length > 0) {
        console.warn('[State Registry] Registration failed:', errors.join('; '));
        return { success: false, errors: errors };
    }

    // Check for duplicate
    if (_states[state.id]) {
        console.warn('[State Registry] Duplicate state, registration rejected:', state.id);
        return { success: false, errors: ['Duplicate state: ' + state.id] };
    }

    // Store state
    _states[state.id] = {
        id: state.id,
        owner: state.owner,
        schema: state.schema,
        version: state.version || '1.0.0',
        enabled: state.enabled !== undefined ? state.enabled : true,
        registeredAt: new Date().toISOString()
    };

    _stateIds.push(state.id);

    if (isDebugMode()) {
        console.log('[State Registry] State Registered:', state.id, 'Owner:', state.owner);
    }

    return { success: true, state: _states[state.id] };
}

export function get(stateId) {
    return _states[stateId] || null;
}

export function getAll() {
    var result = [];
    for (var i = 0; i < _stateIds.length; i++) {
        result.push(_states[_stateIds[i]]);
    }
    return result;
}

export function getEnabled() {
    var result = [];
    for (var i = 0; i < _stateIds.length; i++) {
        var s = _states[_stateIds[i]];
        if (s.enabled) {
            result.push(s);
        }
    }
    return result;
}

export function getByOwner(owner) {
    var result = [];
    for (var i = 0; i < _stateIds.length; i++) {
        var s = _states[_stateIds[i]];
        if (s.owner === owner) {
            result.push(s);
        }
    }
    return result;
}

export function remove(stateId) {
    if (!_states[stateId]) {
        console.warn('[State Registry] State not found for removal:', stateId);
        return false;
    }

    delete _states[stateId];
    var index = _stateIds.indexOf(stateId);
    if (index !== -1) {
        _stateIds.splice(index, 1);
    }

    if (isDebugMode()) {
        console.log('[State Registry] State Removed:', stateId);
    }

    return true;
}

export function isRegistered(stateId) {
    return !!_states[stateId];
}

export function isEnabled(stateId) {
    var state = _states[stateId];
    return state ? state.enabled : false;
}

export function count() {
    return _stateIds.length;
}

export function clear() {
    _states = {};
    _stateIds = [];
    if (isDebugMode()) {
        console.log('[State Registry] Registry cleared');
    }
}

// ============================================================
// DEFAULT STATES
// ============================================================

function registerDefaultStates() {
    var defaultOwners = getDefaultOwners();

    // Register default schema for states
    var schema = LawAIApp.StateSchema || window.stateSchema;
    if (schema && typeof schema.create === 'function') {
        // Create default schemas if they don't exist
        if (!schema.get('runtime.state')) {
            schema.create('runtime.state', {
                fields: { status: 'string', ready: 'boolean' },
                types: { status: 'string', ready: 'boolean' },
                required: ['status', 'ready'],
                defaults: { status: 'idle', ready: false },
                version: '1.0.0'
            });
        }

        if (!schema.get('session.state')) {
            schema.create('session.state', {
                fields: { active: 'boolean', userId: 'string', sessionId: 'string' },
                types: { active: 'boolean', userId: 'string', sessionId: 'string' },
                required: ['active'],
                defaults: { active: false },
                version: '1.0.0'
            });
        }

        if (!schema.get('learning.state')) {
            schema.create('learning.state', {
                fields: { currentLesson: 'string', progress: 'number', completed: 'boolean' },
                types: { currentLesson: 'string', progress: 'number', completed: 'boolean' },
                required: ['progress'],
                defaults: { progress: 0, completed: false },
                validation: { progress: { min: 0, max: 100 } },
                version: '1.0.0'
            });
        }

        if (!schema.get('module.state')) {
            schema.create('module.state', {
                fields: { loaded: 'boolean', ready: 'boolean', name: 'string' },
                types: { loaded: 'boolean', ready: 'boolean', name: 'string' },
                required: ['loaded'],
                defaults: { loaded: false, ready: false },
                version: '1.0.0'
            });
        }
    }

    // Default states
    var defaultStates = [
        { id: 'runtime.state', owner: defaultOwners.module || 'Runtime', schema: 'runtime.state' },
        { id: 'session.state', owner: defaultOwners.session || 'SessionManager', schema: 'session.state' },
        { id: 'learning.state', owner: defaultOwners.learning || 'LearningEngine', schema: 'learning.state' },
        { id: 'module.state', owner: defaultOwners.module || 'Runtime', schema: 'module.state' }
    ];

    var registeredCount = 0;
    for (var i = 0; i < defaultStates.length; i++) {
        var result = register(defaultStates[i]);
        if (result.success) {
            registeredCount++;
        }
    }

    if (isDebugMode()) {
        console.log('[State Registry] Default states registered:', registeredCount);
    }

    return registeredCount;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initRegistry() {
    // Register default schemas and states
    registerDefaultStates();

    if (isDebugMode()) {
        console.log('[State Registry] Initialized, States:', count());
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.stateRegistry = {
        register: register,
        get: get,
        getAll: getAll,
        getEnabled: getEnabled,
        getByOwner: getByOwner,
        remove: remove,
        isRegistered: isRegistered,
        isEnabled: isEnabled,
        count: count,
        clear: clear,
        init: function() {
            var result = initRegistry();
            console.log('✅ StateRegistry ready (' + count() + ' states registered)');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StateRegistry = window.stateRegistry;
    }
}
