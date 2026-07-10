// ================================================================
// runtimeProfiler.js – Runtime Profiler V1.1.0
// 自动采集所有运行时数据，无需手动打点
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.RuntimeProfiler = {
    _enabled: true,
    _marks: {},
    _measures: {},
    _timeline: [],
    _storageReads: 0,
    _storageWrites: 0,
    _eventBusEvents: {},
    _eventBusListeners: 0,
    _renderCounts: {
        dashboard: 0,
        academy: 0,
        lesson: 0,
        settings: 0,
        profile: 0
    },
    _startTime: 0,
    _frozen: false,
    _totalTime: 0,
    _engines: {},
    _engineOrder: [],
    _pendingPromises: 0,
    _completedPromises: 0,
    _rejectedPromises: 0,

    /**
     * 启动 Profiler
     */
    init: function() {
        if (!this._enabled) return;
        this._startTime = performance.now();
        this._frozen = false;
        this.mark('profiler_init');
        console.log('📊 RuntimeProfiler V1.1.0 initialized');
    },

    // ============================================================
    // ⏱️ STARTUP TIMER — 启动计时器
    // ============================================================

    /**
     * 冻结启动计时（在启动完成时调用）
     */
    freeze: function() {
        if (this._frozen) return;
        this._frozen = true;
        this._totalTime = Math.round(performance.now() - this._startTime);
        this.mark('profiler_frozen');
        console.log('📊 RuntimeProfiler frozen at', this._totalTime + 'ms');
    },

    /**
     * 获取总启动时间（冻结后返回固定值）
     */
    getTotalTime: function() {
        if (this._frozen) {
            return this._totalTime;
        }
        return Math.round(performance.now() - this._startTime);
    },

    // ============================================================
    // 🏷️ ENGINE REGISTRATION — 引擎自动注册
    // ============================================================

    /**
     * 注册一个引擎
     */
    registerEngine: function(name, startTime) {
        if (!this._enabled) return;
        if (this._engines[name]) {
            // 如果已存在，更新时间
            this._engines[name].lastSeen = Date.now();
            return;
        }
        this._engines[name] = {
            name: name,
            registeredAt: startTime || performance.now(),
            lastSeen: Date.now(),
            duration: 0
        };
        this._engineOrder.push(name);
        console.log('📊 Engine registered:', name);
    },

    /**
     * 记录引擎加载完成
     */
    engineLoaded: function(name, endTime) {
        if (!this._enabled) return;
        if (this._engines[name]) {
            var start = this._engines[name].registeredAt;
            this._engines[name].duration = Math.round((endTime || performance.now()) - start);
            this._engines[name].loaded = true;
            this.measure(
                'engine_' + name,
                'engine_start_' + name,
                'engine_end_' + name
            );
        }
    },

    /**
     * 获取所有引擎数据
     */
    getEngines: function() {
        var result = {};
        for (var name in this._engines) {
            result[name] = this._engines[name].duration || 0;
        }
        return result;
    },

    /**
     * 获取引擎加载顺序
     */
    getEngineOrder: function() {
        return this._engineOrder.slice();
    },

    // ============================================================
    // 💾 STORAGE INSTRUMENTATION — 存储自动计数
    // ============================================================

    recordStorageRead: function() {
        if (!this._enabled) return;
        this._storageReads++;
    },

    recordStorageWrite: function() {
        if (!this._enabled) return;
        this._storageWrites++;
    },

    // ============================================================
    // 📡 EVENT INSTRUMENTATION — 事件自动计数
    // ============================================================

    recordEventRegistration: function(eventName) {
        if (!this._enabled) return;
        this._eventBusListeners++;
        if (!this._eventBusEvents[eventName]) {
            this._eventBusEvents[eventName] = { listeners: 0, emitted: 0 };
        }
        this._eventBusEvents[eventName].listeners++;
    },

    recordEventEmission: function(eventName) {
        if (!this._enabled) return;
        if (!this._eventBusEvents[eventName]) {
            this._eventBusEvents[eventName] = { listeners: 0, emitted: 0 };
        }
        this._eventBusEvents[eventName].emitted++;
    },

    // ============================================================
    // 🔄 RENDER INSTRUMENTATION — 渲染自动计数
    // ============================================================

    recordRender: function(page) {
        if (!this._enabled) return;
        if (this._renderCounts[page] !== undefined) {
            this._renderCounts[page]++;
        } else {
            this._renderCounts[page] = 1;
        }
    },

    // ============================================================
    // 📦 PROMISE INSTRUMENTATION — Promise 追踪
    // ============================================================

    recordPromisePending: function() {
        if (!this._enabled) return;
        this._pendingPromises++;
    },

    recordPromiseCompleted: function() {
        if (!this._enabled) return;
        this._pendingPromises--;
        this._completedPromises++;
    },

    recordPromiseRejected: function() {
        if (!this._enabled) return;
        this._pendingPromises--;
        this._rejectedPromises++;
    },

    // ============================================================
    // 📍 MARK & MEASURE — 标记和测量（保留）
    // ============================================================

    mark: function(name, data) {
        if (!this._enabled) return;
        var mark = {
            name: name,
            timestamp: performance.now(),
            data: data || {}
        };
        this._marks[name] = mark;
        this._timeline.push(mark);
        return mark;
    },

    measure: function(name, startMark, endMark) {
        if (!this._enabled) return;
        var start = this._marks[startMark];
        var end = this._marks[endMark];
        if (!start || !end) {
            // 尝试用引擎数据补充
            if (name.startsWith('engine_')) {
                var engineName = name.replace('engine_', '');
                if (this._engines[engineName]) {
                    var duration = this._engines[engineName].duration;
                    this._measures[name] = {
                        start: startMark,
                        end: endMark,
                        duration: duration,
                        engine: engineName
                    };
                    return duration;
                }
            }
            return;
        }
        var duration = end.timestamp - start.timestamp;
        this._measures[name] = {
            start: startMark,
            end: endMark,
            duration: Math.round(duration)
        };
        return duration;
    },

    // ============================================================
    // 📊 DATA COLLECTION — 数据收集
    // ============================================================

    getData: function() {
        return {
            marks: this._marks,
            measures: this._measures,
            timeline: this._timeline,
            storageReads: this._storageReads,
            storageWrites: this._storageWrites,
            eventBusEvents: this._eventBusEvents,
            eventBusListeners: this._eventBusListeners,
            renderCounts: this._renderCounts,
            totalTime: this.getTotalTime(),
            engines: this._engines,
            engineOrder: this._engineOrder,
            pendingPromises: this._pendingPromises,
            completedPromises: this._completedPromises,
            rejectedPromises: this._rejectedPromises,
            frozen: this._frozen
        };
    },

    /**
     * 生成报告数据（由 RuntimeReport 调用）
     */
    getReportData: function() {
        var data = this.getData();
        var engines = {};
        var totalDuration = 0;

        // 提取引擎时间
        for (var name in data.engines) {
            var eng = data.engines[name];
            engines[name] = eng.duration || 0;
            totalDuration += eng.duration || 0;
        }

        // 找出最慢的引擎
        var slowest = null;
        var slowestTime = 0;
        for (var n in engines) {
            if (engines[n] > slowestTime) {
                slowestTime = engines[n];
                slowest = n;
            }
        }

        // 计算阶段时间
        var stages = {
            critical: 0,
            ux: 0,
            intelligence: 0,
            background: 0
        };

        var timeline = data.timeline;
        for (var i = 0; i < timeline.length - 1; i++) {
            var current = timeline[i];
            var next = timeline[i + 1];
            if (current.name === 'stage_critical_start' && next.name === 'stage_critical_end') {
                stages.critical = Math.round(next.timestamp - current.timestamp);
            }
            if (current.name === 'stage_ux_start' && next.name === 'stage_ux_end') {
                stages.ux = Math.round(next.timestamp - current.timestamp);
            }
            if (current.name === 'stage_intelligence_start' && next.name === 'stage_intelligence_end') {
                stages.intelligence = Math.round(next.timestamp - current.timestamp);
            }
            if (current.name === 'stage_background_start' && next.name === 'stage_background_end') {
                stages.background = Math.round(next.timestamp - current.timestamp);
            }
        }

        // 总事件数
        var totalEvents = 0;
        for (var ev in data.eventBusEvents) {
            totalEvents += data.eventBusEvents[ev].emitted || 0;
        }

        return {
            totalTime: data.totalTime,
            engines: engines,
            slowestEngine: slowest,
            slowestTime: slowestTime,
            stages: stages,
            storageReads: data.storageReads,
            storageWrites: data.storageWrites,
            eventBusEvents: data.eventBusEvents,
            eventBusListeners: data.eventBusListeners,
            totalEvents: totalEvents,
            renderCounts: data.renderCounts,
            engineOrder: data.engineOrder,
            frozen: data.frozen
        };
    },

    /**
     * 重置所有数据
     */
    reset: function() {
        this._marks = {};
        this._measures = {};
        this._timeline = [];
        this._storageReads = 0;
        this._storageWrites = 0;
        this._eventBusEvents = {};
        this._eventBusListeners = 0;
        this._renderCounts = {
            dashboard: 0,
            academy: 0,
            lesson: 0,
            settings: 0,
            profile: 0
        };
        this._startTime = performance.now();
        this._frozen = false;
        this._totalTime = 0;
        this._engines = {};
        this._engineOrder = [];
        this._pendingPromises = 0;
        this._completedPromises = 0;
        this._rejectedPromises = 0;
        this.mark('profiler_reset');
        console.log('📊 RuntimeProfiler reset');
    },

    /**
     * 启用/禁用
     */
    setEnabled: function(enabled) {
        this._enabled = enabled;
        if (enabled) {
            this.reset();
            console.log('📊 RuntimeProfiler enabled');
        } else {
            console.log('📊 RuntimeProfiler disabled');
        }
    }
};

// 自动初始化
if (LawAIApp.DevTools) {
    LawAIApp.DevTools.RuntimeProfiler.init();
}

console.log('📊 RuntimeProfiler V1.1.0 ready');
