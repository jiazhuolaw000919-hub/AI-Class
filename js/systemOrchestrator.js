// ===========================================
// systemOrchestrator.js
// 系统编排器 - 全局状态管理 + 学习循环（Phase 60 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemOrchestrator = {
    initialized: false,
    ready: false,
    runtimeTimer: null,
    _retryCount: 0,
    _maxRetries: 10,

    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        console.log('🧠 SystemOrchestrator V4.0');

        // 启动依赖检查
        this._waitForDependencies();
    },

    _waitForDependencies: function() {
        var self = this;

        // 检查关键依赖
        var deps = ['EventBus', 'LearningStateManager', 'SystemComposer'];
        var allReady = true;

        for (var i = 0; i < deps.length; i++) {
            if (!LawAIApp[deps[i]]) {
                allReady = false;
                break;
            }
        }

        if (!allReady) {
            this._retryCount++;
            if (this._retryCount > this._maxRetries) {
                console.warn('⚠️ Dependencies not ready after ' + this._maxRetries + ' retries, starting anyway');
                this._bindEvents();
                this.start();
                return;
            }
            console.log('⏳ Waiting for dependencies (attempt ' + this._retryCount + ')...');
            setTimeout(function() {
                self._waitForDependencies();
            }, 300);
            return;
        }

        console.log('✅ Dependencies ready');
        this._bindEvents();
        this.start();
    },

    _bindEvents: function() {
        var self = this;

        var refresh = function() {
            try {
                if (LawAIApp.LearningStateManager && typeof LawAIApp.LearningStateManager.refresh === 'function') {
                    LawAIApp.LearningStateManager.refresh();
                }
                self._refreshUI();
            } catch (e) {
                console.warn('Refresh error:', e);
            }
        };

        var events = [
            'LessonCompleted',
            'QuizCompleted',
            'PracticeCompleted',
            'ProjectFinished',
            'GoalUpdated',
            'MemoryUpdated',
            'StreakMilestone',
            'XPUpdated',
            'ProgressUpdated'
        ];

        for (var i = 0; i < events.length; i++) {
            if (LawAIApp.EventBus && typeof LawAIApp.EventBus.on === 'function') {
                LawAIApp.EventBus.on(events[i], refresh);
            } else {
                // 备选：使用自定义事件
                window.addEventListener(events[i], refresh);
            }
        }

        this._refreshState = refresh;
    },

    start: function() {
        if (this.ready) return;
        this.ready = true;

        var payload = {
            boot: LawAIApp.bootStatus || {},
            safeMode: LawAIApp.bootStatus?.safeMode || false,
            timestamp: Date.now()
        };

        // 触发系统就绪事件
        var events = ['SYSTEM_READY', 'LEARNING_SYSTEM_READY'];
        for (var i = 0; i < events.length; i++) {
            try {
                window.dispatchEvent(new CustomEvent(events[i], { detail: payload }));
            } catch (e) {}
        }

        this._refreshUI();
        this._startRuntimeLoop();

        console.log('🧠 Runtime LIVE');
    },

    _refreshUI: function() {
        try {
            var state = null;
            if (LawAIApp.LearningStateManager && typeof LawAIApp.LearningStateManager.getState === 'function') {
                state = LawAIApp.LearningStateManager.getState();
            }
            window.dispatchEvent(new CustomEvent('LEARNING_UI_REFRESH', {
                detail: { state: state }
            }));
        } catch (e) {
            // 静默处理
        }
    },

    _startRuntimeLoop: function() {
        if (this.runtimeTimer) return;

        this.runtimeTimer = setInterval(function() {
            this._refreshUI();
        }.bind(this), 3000);
    },

    triggerLearningLoop: function(lessonId, result) {
        var loop = LawAIApp.LearningLoopEngine;
        var state = null;
        if (LawAIApp.LearningStateManager && typeof LawAIApp.LearningStateManager.getState === 'function') {
            state = LawAIApp.LearningStateManager.getState();
        }

        if (!loop || !state) {
            console.warn('⚠️ LearningLoopEngine or LearningStateManager not available');
            return;
        }

        if (result === 'completed') {
            if (typeof loop.recordSuccess === 'function') {
                loop.recordSuccess(lessonId);
            }
        } else {
            if (typeof loop.recordFailure === 'function') {
                loop.recordFailure(lessonId);
            }
        }

        if (typeof loop.adapt === 'function') {
            loop.adapt();
        }

        this._refreshUI();
    },

    getStatus: function() {
        return {
            initialized: this.initialized,
            ready: this.ready,
            retryCount: this._retryCount,
            dependencies: {
                EventBus: !!LawAIApp.EventBus,
                LearningStateManager: !!LawAIApp.LearningStateManager,
                SystemComposer: !!LawAIApp.SystemComposer,
                ProgressEngine: !!LawAIApp.ProgressEngine
            }
        };
    },

    destroy: function() {
        if (this.runtimeTimer) {
            clearInterval(this.runtimeTimer);
            this.runtimeTimer = null;
        }
        this.ready = false;
        this.initialized = false;
        console.log('🧹 SystemOrchestrator destroyed');
    }
};

// 监听 SYSTEM_READY 事件启动其他引擎
window.addEventListener('SYSTEM_READY', function(e) {
    try {
        if (LawAIApp.EngineBinder && typeof LawAIApp.EngineBinder.init === 'function') {
            LawAIApp.EngineBinder.init(e.detail);
        }
        if (LawAIApp.LayoutEngineV2 && typeof LawAIApp.LayoutEngineV2.init === 'function') {
            LawAIApp.LayoutEngineV2.init(e.detail);
        }
        if (LawAIApp.ExperienceComposer && typeof LawAIApp.ExperienceComposer.init === 'function') {
            LawAIApp.ExperienceComposer.init(e.detail);
        }
    } catch (err) {
        console.warn('Engine init error:', err);
    }
});

// 自动初始化
setTimeout(function() {
    if (LawAIApp.SystemOrchestrator && typeof LawAIApp.SystemOrchestrator.init === 'function') {
        LawAIApp.SystemOrchestrator.init();
    }
}, 100);

console.log('🧠 SystemOrchestrator V4.0 ready');
