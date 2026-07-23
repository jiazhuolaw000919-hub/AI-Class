/**
 * State Persistence
 * Runtime State Persistence & Recovery Framework
 * Part 45.5 - State Persistence & Recovery
 */

// ============================================================
// PERSISTENCE STATE
// ============================================================

var _snapshots = [];
var _maxSnapshots = 10;
var _isInitialized = false;
var _currentSnapshotId = null;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getEngine() {
    return LawAIApp.StateSyncEngine || window.stateSyncEngine;
}

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
            console.warn('[State Persistence] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

function generateSnapshotId() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    var random = Math.random().toString(36).substring(2, 6);
    return 'snapshot_' + timestamp + '_' + random;
}

// ============================================================
// SNAPSHOT MODEL
// ============================================================

function createSnapshot(states, metadata) {
    var stateVersion = '1.0.0';
    try {
        var manifest = getManifest();
        if (manifest && typeof manifest.getManifestVersion === 'function') {
            stateVersion = manifest.getManifestVersion();
        }
    } catch (e) { /* ignore */ }

    return {
        snapshotId: generateSnapshotId(),
        timestamp: new Date().toISOString(),
        stateVersion: stateVersion,
        states: JSON.parse(JSON.stringify(states || {})),
        metadata: metadata || {},
        stateCount: Object.keys(states || {}).length
    };
}

// ============================================================
// SNAPSHOT MANAGEMENT
// ============================================================

export function saveSnapshot(metadata) {
    var engine = getEngine();
    if (!engine) {
        if (isDebugMode()) {
            console.warn('[State Persistence] Engine not available');
        }
        return { success: false, error: 'Engine not available' };
    }

    // Get all current states
    var states = safeCall(function() {
        if (typeof engine.getAll === 'function') {
            return engine.getAll();
        }
        return {};
    }, {});

    if (Object.keys(states).length === 0) {
        if (isDebugMode()) {
            console.warn('[State Persistence] No states to save');
        }
        return { success: false, error: 'No states to save' };
    }

    var snapshot = createSnapshot(states, metadata);

    _snapshots.push(snapshot);
    _currentSnapshotId = snapshot.snapshotId;

    // Trim snapshots
    if (_snapshots.length > _maxSnapshots) {
        _snapshots = _snapshots.slice(-_maxSnapshots);
    }

    if (isDebugMode()) {
        console.log('[State Persistence] Snapshot Saved:', snapshot.snapshotId);
        console.log('[State Persistence] States:', snapshot.stateCount);
    }

    return {
        success: true,
        snapshotId: snapshot.snapshotId,
        stateCount: snapshot.stateCount,
        timestamp: snapshot.timestamp
    };
}

export function getSnapshots() {
    return _snapshots.slice();
}

export function getSnapshot(snapshotId) {
    for (var i = 0; i < _snapshots.length; i++) {
        if (_snapshots[i].snapshotId === snapshotId) {
            return JSON.parse(JSON.stringify(_snapshots[i]));
        }
    }
    return null;
}

export function getLatestSnapshot() {
    if (_snapshots.length === 0) return null;
    return JSON.parse(JSON.stringify(_snapshots[_snapshots.length - 1]));
}

export function getCurrentSnapshotId() {
    return _currentSnapshotId;
}

export function clearSnapshots() {
    _snapshots = [];
    _currentSnapshotId = null;
    if (isDebugMode()) {
        console.log('[State Persistence] Snapshots cleared');
    }
}

// ============================================================
// RECOVERY SYSTEM
// ============================================================

export function recover(snapshotId) {
    var snapshot = snapshotId ? getSnapshot(snapshotId) : getLatestSnapshot();
    if (!snapshot) {
        if (isDebugMode()) {
            console.warn('[State Persistence] No snapshot available for recovery');
        }
        return { success: false, error: 'No snapshot available' };
    }

    if (isDebugMode()) {
        console.log('[State Persistence] Recovery started from snapshot:', snapshot.snapshotId);
    }

    var engine = getEngine();
    if (!engine) {
        return { success: false, error: 'Engine not available' };
    }

    var states = snapshot.states;
    var recovered = 0;
    var failed = 0;

    for (var stateId in states) {
        if (states.hasOwnProperty(stateId)) {
            var value = states[stateId];
            var result = safeCall(function() {
                if (typeof engine.update === 'function') {
                    return engine.update(stateId, value, 'StatePersistence', {
                        recovery: true,
                        snapshotId: snapshot.snapshotId
                    });
                }
                return null;
            }, null);

            if (result && result.success) {
                recovered++;
            } else {
                failed++;
                if (isDebugMode()) {
                    console.warn('[State Persistence] Failed to recover state:', stateId);
                }
            }
        }
    }

    if (isDebugMode()) {
        console.log('[State Persistence] Recovery completed');
        console.log('[State Persistence] Recovered:', recovered, 'Failed:', failed);
    }

    return {
        success: true,
        snapshotId: snapshot.snapshotId,
        recovered: recovered,
        failed: failed,
        total: Object.keys(states).length
    };
}

export function autoRecover() {
    if (_snapshots.length === 0) {
        if (isDebugMode()) {
            console.log('[State Persistence] No snapshots for auto-recovery');
        }
        return { success: false, error: 'No snapshots available' };
    }

    return recover();
}

// ============================================================
// MIGRATION SUPPORT
// ============================================================

export function migrate(snapshotId, targetVersion) {
    var snapshot = snapshotId ? getSnapshot(snapshotId) : getLatestSnapshot();
    if (!snapshot) {
        return { success: false, error: 'No snapshot available' };
    }

    var currentVersion = snapshot.stateVersion;
    if (currentVersion === targetVersion) {
        if (isDebugMode()) {
            console.log('[State Persistence] Already at target version:', targetVersion);
        }
        return { success: true, message: 'Already at target version' };
    }

    if (isDebugMode()) {
        console.log('[State Persistence] Migration:', currentVersion, '→', targetVersion);
    }

    // For now, just update the version
    // Future: more complex migration logic
    snapshot.stateVersion = targetVersion;
    snapshot.metadata.migrated = true;
    snapshot.metadata.previousVersion = currentVersion;
    snapshot.metadata.migratedAt = new Date().toISOString();

    return {
        success: true,
        from: currentVersion,
        to: targetVersion,
        snapshotId: snapshot.snapshotId
    };
}

// ============================================================
// BACKUP & RESTORE
// ============================================================

export function exportSnapshot(snapshotId) {
    var snapshot = snapshotId ? getSnapshot(snapshotId) : getLatestSnapshot();
    if (!snapshot) {
        return null;
    }

    return JSON.stringify(snapshot, null, 2);
}

export function importSnapshot(snapshotData) {
    try {
        var snapshot = typeof snapshotData === 'string' ? JSON.parse(snapshotData) : snapshotData;
        if (!snapshot.snapshotId || !snapshot.states) {
            return { success: false, error: 'Invalid snapshot format' };
        }

        // Validate states
        var registry = getRegistry();
        if (registry) {
            var registeredStates = safeCall(function() {
                if (typeof registry.getAll === 'function') {
                    return registry.getAll();
                }
                return [];
            }, []);

            var stateIds = registeredStates.map(function(s) { return s.id; });
            for (var stateId in snapshot.states) {
                if (snapshot.states.hasOwnProperty(stateId)) {
                    if (stateIds.indexOf(stateId) === -1) {
                        if (isDebugMode()) {
                            console.warn('[State Persistence] Unknown state in snapshot:', stateId);
                        }
                    }
                }
            }
        }

        _snapshots.push(snapshot);
        _currentSnapshotId = snapshot.snapshotId;

        if (isDebugMode()) {
            console.log('[State Persistence] Snapshot imported:', snapshot.snapshotId);
        }

        return { success: true, snapshotId: snapshot.snapshotId };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ============================================================
// AUTO-SAVE
// ============================================================

var _autoSaveInterval = null;
var _autoSaveEnabled = false;

export function enableAutoSave(intervalMs) {
    intervalMs = intervalMs || 30000; // Default 30 seconds

    if (_autoSaveInterval) {
        clearInterval(_autoSaveInterval);
    }

    _autoSaveEnabled = true;
    _autoSaveInterval = setInterval(function() {
        saveSnapshot({ auto: true, interval: intervalMs });
    }, intervalMs);

    if (isDebugMode()) {
        console.log('[State Persistence] Auto-save enabled:', intervalMs + 'ms');
    }
}

export function disableAutoSave() {
    if (_autoSaveInterval) {
        clearInterval(_autoSaveInterval);
        _autoSaveInterval = null;
    }
    _autoSaveEnabled = false;

    if (isDebugMode()) {
        console.log('[State Persistence] Auto-save disabled');
    }
}

export function isAutoSaveEnabled() {
    return _autoSaveEnabled;
}

// ============================================================
// STATISTICS
// ============================================================

export function getStats() {
    var stats = {
        totalSnapshots: _snapshots.length,
        currentSnapshotId: _currentSnapshotId,
        maxSnapshots: _maxSnapshots,
        autoSaveEnabled: _autoSaveEnabled,
        latestSnapshot: null
    };

    if (_snapshots.length > 0) {
        var latest = _snapshots[_snapshots.length - 1];
        stats.latestSnapshot = {
            id: latest.snapshotId,
            timestamp: latest.timestamp,
            stateCount: latest.stateCount,
            version: latest.stateVersion
        };
    }

    return stats;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initPersistence() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[State Persistence] Initialized');
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.statePersistence = {
        saveSnapshot: saveSnapshot,
        getSnapshots: getSnapshots,
        getSnapshot: getSnapshot,
        getLatestSnapshot: getLatestSnapshot,
        getCurrentSnapshotId: getCurrentSnapshotId,
        clearSnapshots: clearSnapshots,
        recover: recover,
        autoRecover: autoRecover,
        migrate: migrate,
        exportSnapshot: exportSnapshot,
        importSnapshot: importSnapshot,
        enableAutoSave: enableAutoSave,
        disableAutoSave: disableAutoSave,
        isAutoSaveEnabled: isAutoSaveEnabled,
        getStats: getStats,
        init: function() {
            var result = initPersistence();
            console.log('✅ StatePersistence ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StatePersistence = window.statePersistence;
    }
}
