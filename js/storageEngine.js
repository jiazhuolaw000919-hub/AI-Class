// ================================================================
// ENGINE: StorageEngine
// LAYER: Infrastructure Layer
// DOMAIN: Persistent Storage Abstraction
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.0.2 — Synchronous Initialization
// ================================================================
//
// PURPOSE
// ================================================================
//   Provides a unified abstraction layer for persistent storage.
//   Supports schema versioning, data migration, import/export,
//   and backup/restore functionality.
//   Currently uses localStorage, designed for future cloud migration.
//
// PUBLIC API
// ================================================================
//   get(key, defaultValue)          -> any
//   set(key, value)                 -> boolean
//   remove(key)                     -> void
//   getAllKeys()                    -> array
//   getWithSchema(key)              -> { data, schemaVersion }
//   setWithSchema(key, data, version) -> boolean
//   migrate(key, migrationFn)       -> boolean
//   exportAll()                     -> string (JSON)
//   importAll(jsonString)           -> boolean
//   createBackup()                  -> string (JSON)
//   restoreBackup(jsonString)       -> boolean
//   getStatus()                     -> Status object
//
// DEPENDENCIES
// ================================================================
//   - None (standalone engine)
//
// STORAGE
// ================================================================
//   - Prefix: 'lawai_'
//   - Schema version tracking: 'lawai_meta_schema_versions'
//
// EVENTS
// ================================================================
//   - None (passive engine)
//
// FUTURE COMPATIBILITY
// ================================================================
//   - Support IndexedDB adapter
//   - Support Supabase adapter
//   - Cloud sync capabilities
//   - Offline-first architecture
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.StorageEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'StorageEngine',
    _engineVersion: '2.0.2',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Infrastructure Layer',
    _domain: 'Persistent Storage Abstraction',

    prefix: 'lawai_',
    _schemaVersions: {},
    _initialized: false,

    // ============================================================
    // Profiler 辅助
    // ============================================================
    _recordRead: function() {
        try {
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler.recordStorageRead();
            }
        } catch (e) {}
    },

    _recordWrite: function() {
        try {
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler.recordStorageWrite();
            }
        } catch (e) {}
    },

    // ============================================================
    // INIT (同步初始化)
    // ============================================================
    init: function() {
        if (this._initialized) return this;
        this._initialized = true;
        this._loadSchemaVersions();
        console.log('💾 StorageEngine v' + this._engineVersion + ' initialized');
        return this;
    },

    // ============================================================
    // SCHEMA VERSION MANAGEMENT
    // ============================================================
    _getVersionKey: function() {
        return this.prefix + 'meta_schema_versions';
    },

    _loadSchemaVersions: function() {
        try {
            var raw = localStorage.getItem(this._getVersionKey());
            this._schemaVersions = raw ? JSON.parse(raw) : {};
        } catch (e) {
            this._schemaVersions = {};
        }
    },

    _saveSchemaVersions: function() {
        try {
            localStorage.setItem(this._getVersionKey(), JSON.stringify(this._schemaVersions));
        } catch (e) {}
    },

    getSchemaVersion: function(key) {
        return this._schemaVersions[key] || null;
    },

    setSchemaVersion: function(key, version) {
        this._schemaVersions[key] = version;
        this._saveSchemaVersions();
    },

    // ============================================================
    // CORE API（带 Profiler 埋点）
    // ============================================================

    get: function(key, defaultValue) {
        this._recordRead();
        if (defaultValue === undefined) defaultValue = null;
        try {
            var raw = localStorage.getItem(this.prefix + key);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set: function(key, value) {
        this._recordWrite();
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove: function(key) {
        this._recordWrite();
        localStorage.removeItem(this.prefix + key);
    },

    getAllKeys: function() {
        this._recordRead();
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .map(k => k.slice(this.prefix.length));
    },

    // ============================================================
    // SCHEMA-AWARE API
    // ============================================================

    getWithSchema: function(key) {
        this._recordRead();
        var data = this.get(key, null);
        var version = this.getSchemaVersion(key);
        return {
            data: data,
            schemaVersion: version,
            exists: data !== null
        };
    },

    setWithSchema: function(key, data, version) {
        this._recordWrite();
        var result = this.set(key, data);
        if (result && version !== undefined) {
            this.setSchemaVersion(key, version);
        }
        return result;
    },

    // ============================================================
    // MIGRATION
    // ============================================================

    migrate: function(key, migrationFn) {
        var current = this.getWithSchema(key);
        if (!current.exists) {
            console.warn('⚠️ No data found for migration:', key);
            return false;
        }

        try {
            var migrated = migrationFn(current.data, current.schemaVersion);
            var newVersion = current.schemaVersion + 1;
            this.setWithSchema(key, migrated, newVersion);
            console.log('✅ Migration complete for', key, 'v' + current.schemaVersion + ' → v' + newVersion);
            return true;
        } catch (err) {
            console.error('❌ Migration failed for', key, err);
            return false;
        }
    },

    // ============================================================
    // BACKUP & RESTORE
    // ============================================================

    exportAll: function() {
        var allData = {};
        var keys = this.getAllKeys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key === 'meta_schema_versions') continue;
            allData[key] = {
                data: this.get(key, null),
                schemaVersion: this.getSchemaVersion(key)
            };
        }

        allData['_meta_schema_versions'] = {
            data: this._schemaVersions,
            schemaVersion: 1
        };

        return JSON.stringify({
            exportedAt: new Date().toISOString(),
            version: this._engineVersion,
            data: allData
        }, null, 2);
    },

    importAll: function(jsonString) {
        try {
            var backup = JSON.parse(jsonString);
            if (!backup.data) {
                console.error('❌ Invalid backup format');
                return false;
            }

            var count = 0;
            for (var key in backup.data) {
                if (key === '_meta_schema_versions') {
                    this._schemaVersions = backup.data[key].data || {};
                    this._saveSchemaVersions();
                    count++;
                    continue;
                }
                var entry = backup.data[key];
                if (entry.data !== undefined) {
                    this.set(key, entry.data);
                    if (entry.schemaVersion !== undefined) {
                        this.setSchemaVersion(key, entry.schemaVersion);
                    }
                    count++;
                }
            }

            console.log('✅ Imported ' + count + ' keys from backup');
            return true;
        } catch (err) {
            console.error('❌ Import failed:', err);
            return false;
        }
    },

    createBackup: function() {
        var backup = this.exportAll();
        try {
            localStorage.setItem(this.prefix + 'backup_latest', backup);
        } catch (e) {}
        return backup;
    },

    restoreBackup: function(jsonString) {
        return this.importAll(jsonString);
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        var keys = this.getAllKeys();
        var totalKeys = keys.length;
        var versionedKeys = 0;
        for (var i = 0; i < keys.length; i++) {
            if (this.getSchemaVersion(keys[i]) !== null) versionedKeys++;
        }

        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            prefix: this.prefix,
            totalKeys: totalKeys,
            versionedKeys: versionedKeys,
            keys: keys.slice(0, 10),
            localStorageAvailable: typeof localStorage !== 'undefined',
            initialized: this._initialized
        };
    }
};

// ============================================================
// 🔥 同步初始化 (移除 setTimeout 延迟)
// ============================================================
LawAIApp.StorageEngine.init();

console.log('💾 StorageEngine V2.0.2 ready (sync init)');
