// ===========================================
// workspaceEngine.js
// 知识工作空间引擎 - 学习工作区（Phase 27 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.WorkspaceEngine = (function() {
    var _initialized = false;

    // ===========================================
    // 工作区状态
    // ===========================================
    function get(lessonId) {
        try {
            var key = 'workspace_' + lessonId;
            var stored = LawAIApp.StorageEngine?.get?.(key);
            if (stored) return stored;
            
            // 创建默认工作区
            var ws = {
                workspaceId: 'ws_' + Date.now(),
                lessonId: lessonId,
                layout: 'default',
                widgets: ['lesson', 'summary', 'notebook', 'resources'],
                pinnedWidgets: [],
                focusMode: 'study',
                lastOpened: new Date().toISOString(),
                sessionState: {
                    scrollPosition: 0,
                    openResources: [],
                    notebookText: '',
                    practiceProgress: {}
                }
            };
            LawAIApp.StorageEngine?.set?.(key, ws);
            return ws;
        } catch (e) {
            return {
                workspaceId: 'ws_fallback',
                lessonId: lessonId,
                layout: 'default',
                widgets: ['lesson', 'summary', 'notebook', 'resources'],
                pinnedWidgets: [],
                focusMode: 'study',
                lastOpened: new Date().toISOString(),
                sessionState: {}
            };
        }
    }

    function save(lessonId, workspace) {
        try {
            var key = 'workspace_' + lessonId;
            workspace.lastOpened = new Date().toISOString();
            LawAIApp.StorageEngine?.set?.(key, workspace);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ===========================================
    // 工作区操作
    // ===========================================
    function open(lessonId) {
        var ws = get(lessonId);
        ws.lastOpened = new Date().toISOString();
        save(lessonId, ws);
        LawAIApp.EventBus?.emit?.('WorkspaceOpened', { workspace: ws, lessonId: lessonId });
        return ws;
    }

    function close(lessonId, sessionState) {
        var ws = get(lessonId);
        if (sessionState) {
            ws.sessionState = { ...ws.sessionState, ...sessionState };
        }
        save(lessonId, ws);
        LawAIApp.EventBus?.emit?.('WorkspaceClosed', { lessonId: lessonId });
    }

    function restoreLastSession() {
        try {
            var keys = LawAIApp.StorageEngine?.getAllKeys?.() || [];
            var wsKeys = keys.filter(function(k) { return k.startsWith('workspace_'); });
            
            if (wsKeys.length === 0) return null;
            
            var workspaces = wsKeys
                .map(function(k) { return LawAIApp.StorageEngine?.get?.(k); })
                .filter(function(w) { return w; });
            
            workspaces.sort(function(a, b) {
                return new Date(b.lastOpened || 0) - new Date(a.lastOpened || 0);
            });
            
            return workspaces[0] || null;
        } catch (e) {
            return null;
        }
    }

    function setFocusMode(lessonId, mode) {
        var validModes = ['focus', 'study', 'practice', 'research', 'review', 'custom'];
        if (validModes.indexOf(mode) === -1) return;
        
        var ws = get(lessonId);
        ws.focusMode = mode;
        save(lessonId, ws);
        
        LawAIApp.EventBus?.emit?.('FocusModeChanged', { lessonId: lessonId, mode: mode });
    }

    // ===========================================
    // 布局管理
    // ===========================================
    function changeLayout(lessonId, layout) {
        var validLayouts = ['default', 'focus', 'practice', 'review', 'research'];
        if (validLayouts.indexOf(layout) === -1) return;
        
        var ws = get(lessonId);
        ws.layout = layout;
        save(lessonId, ws);
    }

    function applyLayout(lessonId, layout) {
        changeLayout(lessonId, layout);
    }

    // ===========================================
    // 小部件管理
    // ===========================================
    function addWidget(lessonId, widgetType) {
        var ws = get(lessonId);
        if (ws.widgets.indexOf(widgetType) === -1) {
            ws.widgets.push(widgetType);
            save(lessonId, ws);
        }
    }

    function removeWidget(lessonId, widgetType) {
        var ws = get(lessonId);
        ws.widgets = ws.widgets.filter(function(w) { return w !== widgetType; });
        save(lessonId, ws);
    }

    function togglePinWidget(lessonId, widgetType) {
        var ws = get(lessonId);
        var index = ws.pinnedWidgets.indexOf(widgetType);
        if (index === -1) {
            ws.pinnedWidgets.push(widgetType);
        } else {
            ws.pinnedWidgets.splice(index, 1);
        }
        save(lessonId, ws);
    }

    // ===========================================
    // 搜索
    // ===========================================
    function search(query) {
        try {
            var keys = LawAIApp.StorageEngine?.getAllKeys?.() || [];
            var wsKeys = keys.filter(function(k) { return k.startsWith('workspace_'); });
            var results = [];
            var q = query.toLowerCase();
            
            wsKeys.forEach(function(k) {
                var ws = LawAIApp.StorageEngine?.get?.(k);
                if (ws && ws.lessonId && ws.lessonId.indexOf(q) !== -1) {
                    results.push(ws);
                }
            });
            
            return results;
        } catch (e) {
            return [];
        }
    }

    // ===========================================
    // 资源推荐
    // ===========================================
    function getRecommendedResources(lessonId) {
        return LawAIApp.ResourceEngine?.getRecommendation?.(lessonId) || null;
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        console.log('🧩 WorkspaceEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        get: get,
        save: save,
        open: open,
        close: close,
        restoreLast: restoreLastSession,
        setMode: setFocusMode,
        changeLayout: changeLayout,
        applyLayout: applyLayout,
        addWidget: addWidget,
        removeWidget: removeWidget,
        togglePinWidget: togglePinWidget,
        search: search,
        getRecommendedResources: getRecommendedResources
    };
})();

console.log('🧩 WorkspaceEngine V2.0 ready');
