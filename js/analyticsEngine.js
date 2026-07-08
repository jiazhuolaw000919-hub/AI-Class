// ===========================================
// analyticsEngine.js
// 分析引擎 - 收集学习行为数据（Phase 16 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AnalyticsEngine = {
    _initialized: false,
    _cache: {},

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        
        // 监听学习事件
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            this._recordEvent('lesson_completed', data);
        }.bind(this));
        
        LawAIApp.EventBus?.on?.('XPUpdated', function(data) {
            this._recordEvent('xp_updated', data);
        }.bind(this));
        
        LawAIApp.EventBus?.on?.('StreakUpdated', function(data) {
            this._recordEvent('streak_updated', data);
        }.bind(this));
        
        console.log('📊 AnalyticsEngine initialized');
        return this;
    },

    _recordEvent: function(type, data) {
        var event = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: type,
            data: data || {},
            timestamp: new Date().toISOString()
        };
        
        try {
            var history = this._getEventHistory();
            history.push(event);
            if (history.length > 1000) {
                history = history.slice(-500);
            }
            this._saveEventHistory(history);
        } catch (e) {
            console.warn('⚠️ Failed to record event:', e);
        }
        
        LawAIApp.EventBus?.emit?.('AnalyticsEventRecorded', event);
    },

    _getEventHistory: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get('analytics_events', []);
            }
            var val = localStorage.getItem('lawai_analytics_events');
            return val ? JSON.parse(val) : [];
        } catch (e) {
            return [];
        }
    },

    _saveEventHistory: function(history) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('analytics_events', history);
                return;
            }
            localStorage.setItem('lawai_analytics_events', JSON.stringify(history));
        } catch (e) {
            console.warn('⚠️ Failed to save event history:', e);
        }
    },

    getMetrics: function() {
        var history = this._getEventHistory();
        var totalLessons = history.filter(function(e) { return e.type === 'lesson_completed'; }).length;
        var totalXP = 0;
        history.filter(function(e) { return e.type === 'xp_updated'; }).forEach(function(e) {
            totalXP = e.data?.totalXP || totalXP;
        });
        
        return {
            totalLessons: totalLessons,
            totalXP: totalXP,
            totalEvents: history.length,
            lastEvent: history.length > 0 ? history[history.length - 1] : null,
            knowledge: { knowledgeScore: totalLessons * 2 + Math.min(totalXP / 10, 100) },
            consistency: { currentStreak: LawAIApp.ProgressEngine?.getStreak?.() || 0 }
        };
    },

    refresh: function() {
        console.log('🔄 AnalyticsEngine refreshing...');
        var metrics = this.getMetrics();
        LawAIApp.EventBus?.emit?.('AnalyticsUpdated', metrics);
        return metrics;
    },

    getEventLog: function(limit) {
        limit = limit || 20;
        var history = this._getEventHistory();
        return history.slice(-limit).reverse();
    },

    getKnowledgeScore: function() {
        var metrics = this.getMetrics();
        return metrics.knowledge.knowledgeScore || 0;
    },

    getConsistencyScore: function() {
        var metrics = this.getMetrics();
        return metrics.consistency.currentStreak || 0;
    },

    clearHistory: function() {
        this._saveEventHistory([]);
        console.log('🔄 Analytics history cleared');
    },

    // 获取学习统计
    getStats: function() {
        var history = this._getEventHistory();
        var completed = history.filter(function(e) { return e.type === 'lesson_completed'; });
        var byDay = {};
        completed.forEach(function(e) {
            var day = e.timestamp ? new Date(e.timestamp).toDateString() : 'unknown';
            byDay[day] = (byDay[day] || 0) + 1;
        });
        
        return {
            totalLessons: completed.length,
            totalEvents: history.length,
            dailyActivity: byDay,
            activeDays: Object.keys(byDay).length,
            averageDaily: Object.keys(byDay).length > 0 ? 
                Math.round(completed.length / Object.keys(byDay).length * 10) / 10 : 0
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AnalyticsEngine && typeof LawAIApp.AnalyticsEngine.init === 'function') {
        LawAIApp.AnalyticsEngine.init();
        console.log('✅ AnalyticsEngine auto-initialized');
    }
}, 200);

console.log('📊 AnalyticsEngine V2.0 ready');
