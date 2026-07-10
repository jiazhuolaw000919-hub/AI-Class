// ================================================================
// runtimeProfiler.js – Runtime Profiler V1.0.0
// 测量启动性能、引擎加载时间、渲染时间
// 开发者工具，不影响用户体验
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
        lesson: 0
    },
    _startTime: 0,

    /**
     * 启动 Profiler
     */
    init: function() {
        if (!this._enabled) return;
        this._startTime = performance.now();
        this.mark('profiler_init');
        console.log('📊 RuntimeProfiler initialized');
    },

    /**
     * 标记一个时间点
     */
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

    /**
     * 测量两个标记之间的时间
     */
    measure: function(name, startMark, endMark) {
        if (!this._enabled) return;
        var start = this._marks[startMark];
        var end = this._marks[endMark];
        if (!start || !end) {
            console.warn('⚠️ Profiler: Mark not found', startMark, endMark);
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

    /**
     * 记录引擎加载时间
     */
    recordEngine: function(name, startTime, endTime) {
        if (!this._enabled) return;
        var duration = endTime - startTime;
        this._measures['engine_' + name] = {
            start: 'engine_' + name + '_start',
            end: 'engine_' + name + '_end',
            duration: Math.round(duration),
            engine: name
        };
        return duration;
    },

    /**
     * 记录存储操作
     */
    recordStorageRead: function() {
        if (!this._enabled) return;
        this._storageReads++;
    },

    recordStorageWrite: function() {
        if (!this._enabled) return;
        this._storageWrites++;
    },

    /**
     * 记录事件
     */
    recordEvent: function(eventName) {
        if (!this._enabled) return;
        if (!this._eventBusEvents[eventName]) {
            this._eventBusEvents[eventName] = 0;
        }
        this._eventBusEvents[eventName]++;
    },

    recordListener: function() {
        if (!this._enabled) return;
        this._eventBusListeners++;
    },

    /**
     * 记录渲染
     */
    recordRender: function(page) {
        if (!this._enabled) return;
        if (this._renderCounts[page] !== undefined) {
            this._renderCounts[page]++;
        }
    },

    /**
     * 获取所有测量数据
     */
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
            totalTime: Math.round(performance.now() - this._startTime)
        };
    },

    /**
     * 生成报告（由 RuntimeReport 调用）
     */
    getReportData: function() {
        var data = this.getData();
        var engines = {};
        var totalDuration = 0;

        // 提取引擎时间
        for (var key in data.measures) {
            if (key.startsWith('engine_')) {
                var engineName = key.replace('engine_', '');
                engines[engineName] = data.measures[key].duration;
                totalDuration += data.measures[key].duration;
            }
        }

        // 找出最慢的引擎
        var slowest = null;
        var slowestTime = 0;
        for (var name in engines) {
            if (engines[name] > slowestTime) {
                slowestTime = engines[name];
                slowest = name;
            }
        }

        // 计算阶段时间
        var stages = {
            critical: 0,
            ux: 0,
            intelligence: 0,
            background: 0
        };

        // 从 timeline 中提取阶段时间
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

        return {
            totalTime: data.totalTime,
            engines: engines,
            slowestEngine: slowest,
            slowestTime: slowestTime,
            stages: stages,
            storageReads: data.storageReads,
            storageWrites: data.storageWrites,
            eventBusEvents: data.eventBusEvents,
            renderCounts: data.renderCounts
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
            lesson: 0
        };
        this._startTime = performance.now();
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

console.log('📊 RuntimeProfiler V1.0.0 ready');
