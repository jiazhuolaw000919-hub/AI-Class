/**
 * State Conflict Resolver
 * Runtime State Conflict Resolution Framework
 * Part 45.4 - State Conflict Resolution
 */

// ============================================================
// CONFLICT STATE
// ============================================================

var _conflictHistory = [];
var _maxHistory = 100;
var _isInitialized = false;

// ============================================================
// CONFLICT MODEL
// ============================================================

function createConflictRecord(stateId, sourceA, sourceB, oldValue, newValueA, newValueB, metadata) {
    return {
        id: generateConflictId(),
        stateId: stateId,
        sourceA: sourceA,
        sourceB: sourceB,
        oldValue: JSON.parse(JSON.stringify(oldValue || {})),
        newValueA: JSON.parse(JSON.stringify(newValueA || {})),
        newValueB: JSON.parse(JSON.stringify(newValueB || {})),
        resolvedValue: null,
        resolution: null,
        timestamp: new Date().toISOString(),
        resolvedAt: null,
        status: 'pending',
        metadata: metadata || {}
    };
}

function generateConflictId() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    var random = Math.random().toString(36).substring(2, 6);
    return 'conflict_' + timestamp + '_' + random;
}

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

function safeCall(fn, fallback) {
    try {
        return fn();
    } catch (e) {
        if (isDebugMode()) {
            console.warn('[Conflict Resolver] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

// ============================================================
// CONFLICT DETECTION
// ============================================================

export function detectConflict(stateId, source, newValue, currentValue, metadata) {
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Detecting conflict for:', stateId);
    }

    // If no current value, no conflict
    if (currentValue === undefined || currentValue === null) {
        return { hasConflict: false };
    }

    // Quick equality check
    var currentStr = JSON.stringify(currentValue);
    var newStr = JSON.stringify(newValue);

    if (currentStr === newStr) {
        return { hasConflict: false };
    }

    // Detect version conflict
    var versionConflict = false;
    if (currentValue._version !== undefined && newValue._version !== undefined) {
        if (currentValue._version !== newValue._version) {
            versionConflict = true;
        }
    }

    // Detect ownership conflict
    var ownershipConflict = false;
    if (metadata && metadata.previousOwner && metadata.previousOwner !== source) {
        ownershipConflict = true;
    }

    // Detect timestamp conflict
    var timestampConflict = false;
    if (currentValue._timestamp && newValue._timestamp) {
        if (new Date(currentValue._timestamp) > new Date(newValue._timestamp)) {
            timestampConflict = true;
        }
    }

    var hasConflict = versionConflict || ownershipConflict || timestampConflict || true; // Any difference is a potential conflict

    return {
        hasConflict: true,
        versionConflict: versionConflict,
        ownershipConflict: ownershipConflict,
        timestampConflict: timestampConflict,
        currentValue: currentValue,
        newValue: newValue,
        source: source
    };
}

// ============================================================
// RESOLUTION STRATEGIES
// ============================================================

export function resolveLatestVersion(conflict) {
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Resolving with Latest Version strategy');
    }

    // Compare versions
    var versionA = conflict.newValueA._version || 0;
    var versionB = conflict.newValueB._version || 0;

    if (versionA >= versionB) {
        return {
            resolvedValue: conflict.newValueA,
            strategy: 'latest_version',
            reason: 'Version ' + versionA + ' >= ' + versionB
        };
    } else {
        return {
            resolvedValue: conflict.newValueB,
            strategy: 'latest_version',
            reason: 'Version ' + versionB + ' > ' + versionA
        };
    }
}

export function resolveTimestampPriority(conflict) {
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Resolving with Timestamp Priority strategy');
    }

    var tsA = conflict.newValueA._timestamp || conflict.timestamp;
    var tsB = conflict.newValueB._timestamp || conflict.timestamp;

    if (new Date(tsA) >= new Date(tsB)) {
        return {
            resolvedValue: conflict.newValueA,
            strategy: 'timestamp_priority',
            reason: 'Timestamp ' + tsA + ' >= ' + tsB
        };
    } else {
        return {
            resolvedValue: conflict.newValueB,
            strategy: 'timestamp_priority',
            reason: 'Timestamp ' + tsB + ' > ' + tsA
        };
    }
}

export function resolveMerge(conflict) {
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Resolving with Merge strategy');
    }

    var merged = JSON.parse(JSON.stringify(conflict.oldValue || {}));

    // Merge strategy: combine both values, with conflict resolution for keys
    for (var key in conflict.newValueA) {
        if (conflict.newValueA.hasOwnProperty(key)) {
            // If both have same key, use the one with higher version or newer timestamp
            if (conflict.newValueB && conflict.newValueB[key] !== undefined) {
                var valA = conflict.newValueA[key];
                var valB = conflict.newValueB[key];

                // Compare versions if available
                if (conflict.newValueA._version && conflict.newValueB._version) {
                    if (conflict.newValueA._version >= conflict.newValueB._version) {
                        merged[key] = valA;
                    } else {
                        merged[key] = valB;
                    }
                } else {
                    // Default: keep existing value
                    merged[key] = merged[key] !== undefined ? merged[key] : valA;
                }
            } else {
                merged[key] = conflict.newValueA[key];
            }
        }
    }

    return {
        resolvedValue: merged,
        strategy: 'merge',
        reason: 'Merged values from both sources'
    };
}

export function resolveManual(conflict, resolvedValue) {
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Manual resolution applied');
    }

    return {
        resolvedValue: resolvedValue,
        strategy: 'manual',
        reason: 'Manually resolved by developer'
    };
}

// ============================================================
// RESOLVER API
// ============================================================

export function resolveConflict(conflict, strategy, manualValue) {
    if (!conflict) {
        return { success: false, error: 'No conflict provided' };
    }

    if (isDebugMode()) {
        console.log('[Conflict Resolver] Resolving conflict:', conflict.id || 'unknown');
    }

    var result;

    switch (strategy) {
        case 'latest_version':
            result = resolveLatestVersion(conflict);
            break;
        case 'timestamp_priority':
            result = resolveTimestampPriority(conflict);
            break;
        case 'merge':
            result = resolveMerge(conflict);
            break;
        case 'manual':
            if (manualValue === undefined) {
                return { success: false, error: 'Manual value required for manual strategy' };
            }
            result = resolveManual(conflict, manualValue);
            break;
        default:
            // Default to latest version
            result = resolveLatestVersion(conflict);
    }

    // Update conflict record
    conflict.resolvedValue = result.resolvedValue;
    conflict.resolution = result;
    conflict.resolvedAt = new Date().toISOString();
    conflict.status = 'resolved';

    // Store in history
    _conflictHistory.push(JSON.parse(JSON.stringify(conflict)));
    if (_conflictHistory.length > _maxHistory) {
        _conflictHistory = _conflictHistory.slice(-_maxHistory);
    }

    if (isDebugMode()) {
        console.log('[Conflict Resolver] Conflict resolved:', strategy, 'Status:', conflict.status);
    }

    return {
        success: true,
        conflict: conflict,
        resolvedValue: result.resolvedValue,
        strategy: result.strategy,
        reason: result.reason
    };
}

export function createConflict(stateId, sourceA, sourceB, oldValue, newValueA, newValueB, metadata) {
    var conflict = createConflictRecord(stateId, sourceA, sourceB, oldValue, newValueA, newValueB, metadata);

    if (isDebugMode()) {
        console.log('[Conflict Resolver] Conflict created:', conflict.id, 'State:', stateId);
    }

    return conflict;
}

export function getConflicts(status) {
    if (status) {
        return _conflictHistory.filter(function(c) { return c.status === status; });
    }
    return _conflictHistory.slice();
}

export function getPendingConflicts() {
    return getConflicts('pending');
}

export function getResolvedConflicts() {
    return getConflicts('resolved');
}

export function getConflict(id) {
    for (var i = 0; i < _conflictHistory.length; i++) {
        if (_conflictHistory[i].id === id) {
            return _conflictHistory[i];
        }
    }
    return null;
}

export function getConflictsByState(stateId) {
    return _conflictHistory.filter(function(c) { return c.stateId === stateId; });
}

export function getConflictCount() {
    return _conflictHistory.length;
}

export function clearConflicts() {
    _conflictHistory = [];
    if (isDebugMode()) {
        console.log('[Conflict Resolver] Conflicts cleared');
    }
}

// ============================================================
// AUTO-RESOLUTION
// ============================================================

export function autoResolveConflicts() {
    var pending = getPendingConflicts();
    var resolved = 0;

    for (var i = 0; i < pending.length; i++) {
        var conflict = pending[i];

        // Auto-resolve based on available data
        var result = resolveConflict(conflict, 'latest_version');
        if (result.success) {
            resolved++;
        }
    }

    if (isDebugMode()) {
        console.log('[Conflict Resolver] Auto-resolved:', resolved, 'conflicts');
    }

    return { resolved: resolved, total: pending.length };
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initResolver() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[Conflict Resolver] Initialized');
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.stateConflictResolver = {
        detectConflict: detectConflict,
        resolveConflict: resolveConflict,
        createConflict: createConflict,
        getConflicts: getConflicts,
        getPendingConflicts: getPendingConflicts,
        getResolvedConflicts: getResolvedConflicts,
        getConflict: getConflict,
        getConflictsByState: getConflictsByState,
        getConflictCount: getConflictCount,
        clearConflicts: clearConflicts,
        autoResolveConflicts: autoResolveConflicts,
        init: function() {
            var result = initResolver();
            console.log('✅ StateConflictResolver ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StateConflictResolver = window.stateConflictResolver;
    }
}
