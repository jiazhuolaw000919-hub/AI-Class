// ================================================================
// runtimeReport.js – Runtime Report V1.0.0
// 在控制台生成性能报告
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.RuntimeReport = {
    _generated: false,

    /**
     * 生成并输出报告
     */
    generate: function() {
        var profiler = LawAIApp.DevTools.RuntimeProfiler;
        if (!profiler) {
            console.warn('⚠️ RuntimeProfiler not available');
            return;
        }

        var data = profiler.getReportData();
        this._generated = true;

        console.log('%c=====================================', 'font-weight:bold;color:#4a9eff;');
        console.log('%c    LAW AI RUNTIME REPORT           ', 'font-weight:bold;color:#4a9eff;');
        console.log('%c=====================================', 'font-weight:bold;color:#4a9eff;');
        console.log('');

        // 1. 引擎加载时间
        console.log('%c📦 Engine Loading Times', 'font-weight:bold;color:#e2e8f0;');
        var engines = data.engines;
        var engineNames = Object.keys(engines);
        if (engineNames.length > 0) {
            var sorted = engineNames.sort(function(a, b) {
                return engines[b] - engines[a];
            });
            for (var i = 0; i < sorted.length; i++) {
                var name = sorted[i];
                var time = engines[name];
                var color = time > 100 ? '#ef4444' : time > 50 ? '#f59e0b' : '#22c55e';
                console.log(
                    '  ' + name.padEnd(20) + 
                    '%c' + time + 'ms',
                    'color:' + color + ';font-weight:' + (time > 100 ? 'bold' : 'normal') + ';'
                );
            }
        } else {
            console.log('  %c(No engine timing data collected)', 'color:#64748b;');
        }
        console.log('');

        // 2. 最慢引擎
        console.log('%c🐢 Slowest Engine', 'font-weight:bold;color:#e2e8f0;');
        if (data.slowestEngine) {
            console.log(
                '  ' + data.slowestEngine + 
                '  %c' + data.slowestTime + 'ms',
                'color:#ef4444;font-weight:bold;'
            );
        } else {
            console.log('  %c(No data)', 'color:#64748b;');
        }
        console.log('');

        // 3. 启动阶段
        console.log('%c📋 Startup Stages', 'font-weight:bold;color:#e2e8f0;');
        var stages = data.stages;
        var stageColors = {
            critical: '#4a9eff',
            ux: '#22c55e',
            intelligence: '#8b5cf6',
            background: '#f59e0b'
        };
        var stageLabels = {
            critical: 'Critical',
            ux: 'UX',
            intelligence: 'Intelligence',
            background: 'Background'
        };
        for (var stage in stages) {
            var label = stageLabels[stage] || stage;
            var time = stages[stage] || 0;
            var color = stageColors[stage] || '#64748b';
            console.log(
                '  ' + label.padEnd(14) + 
                '%c' + time + 'ms',
                'color:' + color + ';'
            );
        }
        console.log('');

        // 4. 存储操作
        console.log('%c💾 Storage Operations', 'font-weight:bold;color:#e2e8f0;');
        console.log('  Reads:  ' + data.storageReads);
        console.log('  Writes: ' + data.storageWrites);
        console.log('');

        // 5. 事件总线
        console.log('%c📡 EventBus', 'font-weight:bold;color:#e2e8f0;');
        console.log('  Listeners: ' + data.eventBusListeners);
        var events = data.eventBusEvents || {};
        var eventNames = Object.keys(events);
        if (eventNames.length > 0) {
            console.log('  Events:');
            for (var i = 0; i < Math.min(eventNames.length, 10); i++) {
                var ev = eventNames[i];
                console.log('    ' + ev + ': ' + events[ev]);
            }
            if (eventNames.length > 10) {
                console.log('    ... and ' + (eventNames.length - 10) + ' more');
            }
        }
        console.log('');

        // 6. 渲染次数
        console.log('%c🔄 Render Counts', 'font-weight:bold;color:#e2e8f0;');
        var renderCounts = data.renderCounts || {};
        for (var page in renderCounts) {
            console.log('  ' + page.padEnd(12) + renderCounts[page]);
        }
        console.log('');

        // 7. 总启动时间
        console.log('%c⏱️ Total Startup Time', 'font-weight:bold;color:#e2e8f0;');
        var total = data.totalTime || 0;
        var totalColor = total > 500 ? '#ef4444' : total > 200 ? '#f59e0b' : '#22c55e';
        console.log(
            '  %c' + total + 'ms',
            'font-size:18px;font-weight:bold;color:' + totalColor + ';'
        );
        console.log('');

        console.log('%c=====================================', 'font-weight:bold;color:#4a9eff;');
        console.log('%c  Report generated at: ' + new Date().toLocaleTimeString(), 'color:#64748b;');
        console.log('%c=====================================', 'font-weight:bold;color:#4a9eff;');

        return data;
    },

    /**
     * 检查是否已生成报告
     */
    isGenerated: function() {
        return this._generated;
    }
};

console.log('📊 RuntimeReport V1.0.0 ready');
