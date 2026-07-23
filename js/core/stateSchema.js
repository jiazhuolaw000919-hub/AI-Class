/**
 * State Schema
 * Runtime State Schema Definition
 * Part 45.2 - State Registry + Schema
 */

// ============================================================
// SCHEMA STORE
// ============================================================

var _schemas = {};
var _schemaIds = [];

// ============================================================
// VALIDATION HELPERS
// ============================================================

function validateType(value, type) {
    if (type === 'string') return typeof value === 'string';
    if (type === 'number') return typeof value === 'number' && !isNaN(value);
    if (type === 'boolean') return typeof value === 'boolean';
    if (type === 'object') return typeof value === 'object' && value !== null;
    if (type === 'array') return Array.isArray(value);
    if (type === 'any') return true;
    if (type === 'null') return value === null;
    if (type === 'undefined') return value === undefined;
    return true;
}

function validateRequired(value, required) {
    if (!required) return true;
    return value !== undefined && value !== null;
}

// ============================================================
// SCHEMA API
// ============================================================

export function create(schemaId, definition) {
    if (!schemaId || typeof schemaId !== 'string') {
        console.warn('[State Schema] Invalid schemaId');
        return { success: false, error: 'Invalid schemaId' };
    }

    if (!definition || typeof definition !== 'object') {
        console.warn('[State Schema] Invalid definition for:', schemaId);
        return { success: false, error: 'Invalid definition' };
    }

    if (_schemas[schemaId]) {
        console.warn('[State Schema] Schema already exists:', schemaId);
        return { success: false, error: 'Schema already exists' };
    }

    var schema = {
        id: schemaId,
        fields: definition.fields || {},
        types: definition.types || {},
        required: definition.required || [],
        defaults: definition.defaults || {},
        validation: definition.validation || {},
        version: definition.version || '1.0.0',
        createdAt: new Date().toISOString()
    };

    _schemas[schemaId] = schema;
    _schemaIds.push(schemaId);

    if (isDebugMode()) {
        console.log('[State Schema] Schema Created:', schemaId, 'Version:', schema.version);
    }

    return { success: true, schema: schema };
}

export function get(schemaId) {
    return _schemas[schemaId] || null;
}

export function getAll() {
    var result = [];
    for (var i = 0; i < _schemaIds.length; i++) {
        result.push(_schemas[_schemaIds[i]]);
    }
    return result;
}

export function remove(schemaId) {
    if (!_schemas[schemaId]) {
        console.warn('[State Schema] Schema not found:', schemaId);
        return false;
    }

    delete _schemas[schemaId];
    var index = _schemaIds.indexOf(schemaId);
    if (index !== -1) {
        _schemaIds.splice(index, 1);
    }

    if (isDebugMode()) {
        console.log('[State Schema] Schema Removed:', schemaId);
    }

    return true;
}

export function validate(schemaId, value) {
    var schema = _schemas[schemaId];
    if (!schema) {
        return { valid: false, errors: ['Schema not found: ' + schemaId] };
    }

    var errors = [];

    // Check required fields
    for (var i = 0; i < schema.required.length; i++) {
        var field = schema.required[i];
        if (!validateRequired(value[field], true)) {
            errors.push('Required field missing: ' + field);
        }
    }

    // Check field types
    for (var key in schema.types) {
        if (schema.types.hasOwnProperty(key)) {
            if (value[key] !== undefined) {
                var type = schema.types[key];
                if (!validateType(value[key], type)) {
                    errors.push('Invalid type for field "' + key + '": expected ' + type);
                }
            }
        }
    }

    // Check validation rules
    for (var key in schema.validation) {
        if (schema.validation.hasOwnProperty(key)) {
            var rules = schema.validation[key];
            if (value[key] !== undefined) {
                var val = value[key];
                if (rules.min !== undefined && typeof val === 'number' && val < rules.min) {
                    errors.push('Field "' + key + '" below minimum: ' + rules.min);
                }
                if (rules.max !== undefined && typeof val === 'number' && val > rules.max) {
                    errors.push('Field "' + key + '" above maximum: ' + rules.max);
                }
                if (rules.pattern && typeof val === 'string' && !new RegExp(rules.pattern).test(val)) {
                    errors.push('Field "' + key + '" does not match pattern');
                }
                if (rules.enum && rules.enum.indexOf(val) === -1) {
                    errors.push('Field "' + key + '" not in allowed values: ' + rules.enum.join(', '));
                }
                if (rules.maxLength !== undefined && typeof val === 'string' && val.length > rules.maxLength) {
                    errors.push('Field "' + key + '" exceeds max length: ' + rules.maxLength);
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

export function getVersion(schemaId) {
    var schema = _schemas[schemaId];
    return schema ? schema.version : null;
}

export function count() {
    return _schemaIds.length;
}

// ============================================================
// DEBUG HELPERS
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

// ============================================================
// INITIALIZATION
// ============================================================

export function initSchema() {
    if (isDebugMode()) {
        console.log('[State Schema] Initialized');
    }
    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.stateSchema = {
        create: create,
        get: get,
        getAll: getAll,
        remove: remove,
        validate: validate,
        getVersion: getVersion,
        count: count,
        init: function() {
            var result = initSchema();
            console.log('✅ StateSchema ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StateSchema = window.stateSchema;
    }
}
