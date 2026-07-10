// ================================================================
// performanceCollector.js – Performance Collector V1.0.0
// 收集引擎加载时间、启动阶段时间
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.PerformanceCollector = {
    _startTimes: {},
    _endTimes: {},
    _collecting: false,

    /**
     * 开始收集
     */
    start: function() {
        if (this._collecting) return;
        this._collecting = true;
        this._startTimes = {};
        this._endTimes = {};
        console.log('📊 PerformanceCollector started');
    },

    /**
     * 开始计时
     */
    startTimer: function(id) {
        if (!this._collecting) return;
        this._startTimes[id] = performance.now();
        if (LawAIApp.DevTools.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.mark('timer_start_' + id);
        }
    },

    /**
     * 结束计时
     */
    endTimer: function(id) {
        if (!this._collecting) return;
        this._endTimes[id] = performance.now();
        var duration = this._endTimes[id] - this._startTimes[id];
        if (LawAIApp.DevTools.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.mark('timer_end_' + id);
            LawAIApp.DevTools.RuntimeProfiler.measure(
                'timer_' + id,
                'timer_start_' + id,
                'timer_end_' + id
            );
        }
        return Math.round(duration);
    },

    /**
     * 记录引擎加载
     */
    recordEngine: function(name, startTime, endTime) {
        if (!this._collecting) return;
        if (LawAIApp.DevTools.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.recordEngine(name, startTime, endTime);
        }
    },

    /**
     * 获取所有记录
     */
    getRecords: function() {
        return {
            startTimes: this._startTimes,
            endTimes: this._endTimes
        };
    },

    /**
     * 停止收集
     */
    stop: function() {
        this._collecting = false;
        console.log('📊 PerformanceCollector stopped');
    },

    /**
     * 是否在收集中
     */
    isCollecting: function() {
        return this._collecting;
    }
};

console.log('📊 PerformanceCollector V1.0.0 ready');
