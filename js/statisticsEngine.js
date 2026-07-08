// ===========================================
// statisticsEngine.js
// 统计引擎 - 将数据转化为指标（Phase 17 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.StatisticsEngine = {
    _initialized: false,
    _snapshot: null,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        
        // 监听数据变化
        LawAIApp.EventBus?.on?.('AnalyticsUpdated', function() {
            this._updateSnapshot();
        }.bind(this));
        
        LawAIApp.EventBus?.on?.('ProgressUpdated', function() {
            this._updateSnapshot();
        }.bind(this));
        
        LawAIApp.EventBus?.on?.('XPUpdated', function() {
            this._updateSnapshot();
        }.bind(this));
        
        // 初始生成
        this._updateSnapshot();
        
        console.log('📈 StatisticsEngine initialized');
        return this;
    },

    _updateSnapshot: function() {
        this._snapshot = this._generateSnapshot();
        LawAIApp.EventBus?.emit?.('StatisticsUpdated', { snapshot: this._snapshot });
    },

    _generateSnapshot: function() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        var level = LawAIApp.XPEngine?.getCurrentLevel?.() || 1;
        var streak = progress.streak || 0;
        var completed = progress.completedLessons?.length || 0;
        var total = progress.totalLessons || 365;
        
        return {
            level: level,
            xp: xp,
            streak: streak,
            completedLessons: completed,
            totalLessons: total,
            completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
            remainingLessons: Math.max(0, total - completed),
            currentStage: progress.currentStage || 'Foundation',
            timestamp: new Date().toISOString()
        };
    },

    getDashboardSnapshot: function() {
        if (!this._snapshot) {
            this._updateSnapshot();
        }
        return { ...this._snapshot };
    },

    getPortfolio: function() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        
        // 计算知识分布（按阶段）
        var stages = ['Foundation', 'Prompt Engineering', 'AI Tools', 'AI Development', 'Projects', 'AI Business'];
        var distribution = {};
        stages.forEach(function(s) { distribution[s] = 0; });
        
        completed.forEach(function(id) {
            var day = parseInt(id.replace('day-', ''));
            if (!isNaN(day)) {
                var stage = 'AI Business';
                if (day <= 30) stage = 'Foundation';
                else if (day <= 70) stage = 'Prompt Engineering';
                else if (day <= 120) stage = 'AI Tools';
                else if (day <= 220) stage = 'AI Development';
                else if (day <= 300) stage = 'Projects';
                distribution[stage] = (distribution[stage] || 0) + 1;
            }
        });
        
        return {
            distribution: distribution,
            total: completed.length,
            totalLessons: total,
            completionPercent: total > 0 ? Math.round((completed.length / total) * 100) : 0
        };
    },

    getHealth: function() {
        var snapshot = this.getDashboardSnapshot();
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        var level = snapshot.level || 1;
        var streak = snapshot.streak || 0;
        var percent = snapshot.completionPercent || 0;
        
        // 综合健康评分
        var score = 0;
        score += Math.min(30, percent * 0.3);
        score += Math.min(25, (level / 10) * 25);
        score += Math.min(25, (xp / 5000) * 25);
        score += Math.min(20, (streak / 30) * 20);
        
        return {
            overall: Math.min(100, Math.round(score)),
            level: level,
            streak: streak,
            completionPercent: percent,
            xp: xp,
            status: score >= 70 ? 'healthy' : score >= 40 ? 'moderate' : 'needs_attention'
        };
    },

    getReport: function(type) {
        type = type || 'daily';
        var snapshot = this.getDashboardSnapshot();
        var health = this.getHealth();
        
        if (type === 'weekly') {
            var weeklyData = this._getWeeklyData();
            return {
                type: 'weekly',
                snapshot: snapshot,
                health: health,
                weekly: weeklyData,
                generatedAt: new Date().toISOString()
            };
        }
        
        return {
            type: 'daily',
            snapshot: snapshot,
            health: health,
            generatedAt: new Date().toISOString()
        };
    },

    _getWeeklyData: function() {
        var history = LawAIApp.AnalyticsEngine?.getEventLog?.(100) || [];
        var completed = history.filter(function(e) { return e.type === 'lesson_completed'; });
        
        var daily = {};
        completed.forEach(function(e) {
            var day = e.timestamp ? new Date(e.timestamp).toDateString() : 'unknown';
            daily[day] = (daily[day] || 0) + 1;
        });
        
        var days = Object.keys(daily);
        var total = completed.length;
        var avg = days.length > 0 ? Math.round(total / days.length * 10) / 10 : 0;
        
        return {
            days: days,
            dailyCounts: daily,
            total: total,
            average: avg,
            bestDay: days.length > 0 ? Math.max.apply(null, Object.values(daily)) : 0
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.StatisticsEngine && typeof LawAIApp.StatisticsEngine.init === 'function') {
        LawAIApp.StatisticsEngine.init();
        console.log('✅ StatisticsEngine auto-initialized');
    }
}, 300);

console.log('📈 StatisticsEngine V2.0 ready');
