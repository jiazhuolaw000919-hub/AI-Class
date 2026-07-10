// ================================================================
// ENGINE: StorageEngine
// LAYER: Infrastructure Layer
// DOMAIN: Persistent Storage Abstraction
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Provides a unified abstraction layer for persistent storage.
//   Currently uses localStorage, but designed for future migration
//   to Supabase, IndexedDB, or cloud storage without changing API.
//
// PUBLIC API
// ================================================================
//   get(key, defaultValue)          -> any
//   set(key, value)                 -> boolean
//   remove(key)                     -> void
//   getAllKeys()                    -> array
//   getStatus()                     -> Status object
//
// DEPENDENCIES
// ================================================================
//   - None (standalone engine)
//   - Uses browser localStorage as backend
//   - Future backends can be swapped without API changes
//
// STORAGE
// ================================================================
//   - Prefix: 'lawai_'
//   - All keys are prefixed to avoid collisions
//   - Values are JSON-stringified
//   - Example: 'lawai_progress' -> '{"completedLessons":[...]}'
//
// EVENTS
// ================================================================
//   - None (passive engine, no events emitted)
//
// FUTURE COMPATIBILITY
// ================================================================
//   - New backends can be added without changing public API
//   - get() and set() signatures must remain stable
//   - getAllKeys() must always return an array
//   - Migration path: implement adapters for IndexedDB, Supabase
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.StorageEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'StorageEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Infrastructure Layer',
    _domain: 'Persistent Storage Abstraction',

    prefix: 'lawai_',

    // ============================================================
    // PUBLIC API
    // ============================================================

    get: function(key, defaultValue) {
        if (defaultValue === undefined) defaultValue = null;
        try {
            const raw = localStorage.getItem(this.prefix + key);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set: function(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove: function(key) {
        localStorage.removeItem(this.prefix + key);
    },

    // 批量获取所有以某个前缀开头的键（用于收藏等）
    getAllKeys: function() {
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .map(k => k.slice(this.prefix.length));
    },

    // ============================================================
    // ENGINE STATUS
    // ============================================================
    getStatus: function() {
        var keys = this.getAllKeys();
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            prefix: this.prefix,
            totalKeys: keys.length,
            keys: keys.slice(0, 10), // Limit to 10 for readability
            localStorageAvailable: typeof localStorage !== 'undefined'
        };
    }
};
