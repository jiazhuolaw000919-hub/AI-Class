// ================================================================
// ENGINE: EventBus
// LAYER: Infrastructure Layer
// DOMAIN: Event Communication & Pub/Sub
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Provides a centralized event communication system.
//   Decouples engines by enabling publish/subscribe pattern.
//   Supports priority-based ordering, wildcard listeners,
//   and event history for debugging.
//
// PUBLIC API
// ================================================================
//   on(event, callback, priority)          -> void
//   once(event, callback, priority)        -> void
//   off(event, callback)                   -> void
//   emit(event, data)                      -> void
//   onWildcard(callback)                   -> void
//   offWildcard(callback)                  -> void
//   getHistory()                           -> array
//   clearHistory()                         -> void
//   setDebugMode(enabled)                  -> void
//   getAllEvents()                         -> array
//   getListenerCount(event)                -> number
//   clearAll()                             -> void
//   getStatus()                            -> Status object
//
//   Priority Constants:
//   - Priority.LOW      = 10
//   - Priority.NORMAL   = 50 (default)
//   - Priority.HIGH     = 80
//   - Priority.CRITICAL = 100
//
// DEPENDENCIES
// ================================================================
//   - None (standalone engine)
//
// STORAGE
// ================================================================
//   - None (in-memory only)
//   - Event history is kept in memory for debugging
//   - Max history: 100 entries
//
// EVENTS
// ================================================================
//   EMITTED:
//   - All events are emitted by external engines
//   - EventBus itself does not emit events (passive infrastructure)
//
//   CONSUMED:
//   - All events are consumed via on() and onWildcard()
//   - Each engine declares its consumed events in its Canon
//
// FUTURE COMPATIBILITY
// ================================================================
//   - New priorities can be added to Priority object
//   - Event history max can be configurable
//   - Wildcard pattern matching can be extended
//   - Existing event names must remain stable
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EventBus = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'EventBus';
    var _engineVersion = '2.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Infrastructure Layer';
    var _domain = 'Event Communication & Pub/Sub';

    // ============================================================
    // INTERNAL STATE
    // ============================================================
    var listeners = {};
    var wildcardListeners = [];
    var history = [];
    var maxHistory = 100;
    var debugMode = false;

    // ============================================================
    // PRIORITY CONSTANTS
    // ============================================================
    var Priority = {
        LOW: 10,
        NORMAL: 50,
        HIGH: 80,
        CRITICAL: 100
    };

    // ============================================================
    // PUBLIC API
    // ============================================================

    function on(event, callback, priority) {
        priority = priority || Priority.NORMAL;
        if (!listeners[event]) listeners[event] = [];
        
        // 按优先级插入
        var entry = { callback: callback, priority: priority };
        var list = listeners[event];
        var inserted = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].priority < priority) {
                list.splice(i, 0, entry);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            list.push(entry);
        }
    }

    function once(event, callback, priority) {
        var wrapper = function(data) {
            callback(data);
            off(event, wrapper);
        };
        on(event, wrapper, priority);
    }

    function off(event, callback) {
        if (!listeners[event]) return;
        if (callback) {
            listeners[event] = listeners[event].filter(function(entry) {
                return entry.callback !== callback;
            });
        } else {
            delete listeners[event];
        }
    }

    function onWildcard(callback) {
        wildcardListeners.push(callback);
    }

    function offWildcard(callback) {
        wildcardListeners = wildcardListeners.filter(function(cb) { return cb !== callback; });
    }

    function emit(event, data) {
        // 记录历史
        var entry = { event: event, data: data, timestamp: Date.now() };
        history.push(entry);
        if (history.length > maxHistory) {
            history.shift();
        }

        if (debugMode) {
            console.log('📡 EventBus emit:', event, data);
        }

        // 触发通配符监听器
        wildcardListeners.forEach(function(cb) {
            try { cb(event, data); } catch (e) { console.error('EventBus wildcard error:', e); }
        });

        // 触发普通监听器
        if (!listeners[event]) return;
        var list = listeners[event];
        for (var i = 0; i < list.length; i++) {
            try {
                list[i].callback(data);
            } catch (e) {
                console.error('EventBus error on ' + event + ':', e);
            }
        }
    }

    function getHistory() {
        return history.slice();
    }

    function clearHistory() {
        history = [];
    }

    function setDebugMode(enabled) {
        debugMode = enabled;
    }

    function getAllEvents() {
        return Object.keys(listeners);
    }

    function getListenerCount(event) {
        if (!listeners[event]) return 0;
        return listeners[event].length;
    }

    function clearAll() {
        listeners = {};
        wildcardListeners = [];
        history = [];
    }

    // ============================================================
    // ENGINE STATUS
    // ============================================================
    function getStatus() {
        var allEvents = getAllEvents();
        var totalListeners = 0;
        allEvents.forEach(function(ev) {
            totalListeners += getListenerCount(ev);
        });
        totalListeners += wildcardListeners.length;

        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            totalEvents: allEvents.length,
            totalListeners: totalListeners,
            wildcardListeners: wildcardListeners.length,
            historySize: history.length,
            maxHistory: maxHistory,
            debugMode: debugMode,
            events: allEvents.slice(0, 10) // Limit to 10 for readability
        };
    }

    // ============================================================
    // EXPORTS
    // ============================================================
    return {
        on: on,
        once: once,
        off: off,
        emit: emit,
        onWildcard: onWildcard,
        offWildcard: offWildcard,
        getHistory: getHistory,
        clearHistory: clearHistory,
        setDebugMode: setDebugMode,
        getAllEvents: getAllEvents,
        getListenerCount: getListenerCount,
        clearAll: clearAll,
        getStatus: getStatus,
        Priority: Priority
    };
})();

console.log('📡 EventBus V2.0 ready');
