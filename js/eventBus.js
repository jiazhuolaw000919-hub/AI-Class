// ===========================================
// eventBus.js
// 事件总线引擎 - 支持优先级、通配符（Phase 12 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EventBus = (function() {
    var listeners = {};
    var wildcardListeners = [];
    var history = [];
    var maxHistory = 100;
    var debugMode = false;

    // 优先级常量
    var Priority = {
        LOW: 10,
        NORMAL: 50,
        HIGH: 80,
        CRITICAL: 100
    };

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
        Priority: Priority
    };
})();

console.log('📡 EventBus V2.0 ready');
