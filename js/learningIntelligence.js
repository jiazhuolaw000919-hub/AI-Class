// ===========================================
// learningIntelligence.js
// 学习智能引擎 - 学习档案与洞察（Phase 33 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LearningIntelligence = (function() {
    var _initialized = false;
    var _profile = null;
    var _health = null;
    var _insights = [];

    // ===========================================
    // 构建学习档案
    // ===========================================
    function buildProfile() {
        var identity = LawAIApp.IdentityEngine?.getProfile?.() || {};
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var rhythm = LawAIApp.HabitEngine?.getRhythm?.() || {};
        var skills = LawAIApp.SkillEngine?.getAll?.() || [];
        
        _profile = {
            profileId: identity.displayName || 'Explorer',
            learningStyle: identity.learningStyle || 'balanced',
            focusDuration: rhythm.avgSessionLength || 15,
            bestLearningTime: detectBestTime(),
            preferredDifficulty: 'Intermediate',
            memoryRetention: calculateRetention(),
            practicePreference: getPracticeFrequency() > 2 ? 'high' : 'low',
            averageSession: rhythm.avgSessionLength || 15,
            efficiency: calculateEfficiency(),
            totalLessons: progress.completedLessons?.length || 0,
            totalXP: LawAIApp.XPEngine?.getCurrentXP?.() || 0,
            skillCount: skills.length
        };
        
        try {
            LawAIApp.StorageEngine?.set?.('learning_profile', _profile);
        } catch (e) {}
        
        return _profile;
    }

    function getProfile() {
        if (!_profile) {
            try {
                var stored = LawAIApp.StorageEngine?.get?.('learning_profile');
                if (stored) {
                    _profile = stored;
                    return _profile;
                }
            } catch (e) {}
            return buildProfile();
        }
        return _profile;
    }

    // ===========================================
    // 学习健康
    // ===========================================
    function getOverallHealth() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var streak = progress.streak || 0;
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        
        var metrics = {
            completion: total > 0 ? (completed.length / total) * 100 : 0,
            consistency: Math.min(100, streak * 3),
            engagement: Math.min(100, (xp / 100) * 10),
            balance: 70 // 默认平衡
        };
        
        var overall = Math.round((metrics.completion * 0.4 + metrics.consistency * 0.3 + metrics.engagement * 0.3));
        
        _health = {
            overall: Math.min(100, overall),
            metrics: metrics,
            status: overall >= 70 ? 'healthy' : overall >= 40 ? 'moderate' : 'needs_attention',
            timestamp: new Date().toISOString()
        };
        
        try {
            LawAIApp.StorageEngine?.set?.('learning_health', _health);
        } catch (e) {}
        
        LawAIApp.EventBus?.emit?.('HealthUpdated', _health);
        return _health;
    }

    function getHealth() {
        if (!_health) {
            try {
                var stored = LawAIApp.StorageEngine?.get?.('learning_health');
                if (stored) {
                    _health = stored;
                    return _health;
                }
            } catch (e) {}
            return getOverallHealth();
        }
        return _health;
    }

    // ===========================================
    // 洞察生成
    // ===========================================
    function generateInsights() {
        var health = getHealth();
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var streak = progress.streak || 0;
        var completed = progress.completedLessons || [];
        var insights = [];
        
        if (health.overall < 40) {
            insights.push('⚡ Consider reducing daily load to avoid burnout.');
        } else if (health.overall > 80) {
            insights.push('🌟 Great learning health! Keep up the consistency.');
        } else {
            insights.push('📈 You\'re on the right track. Keep learning!');
        }
        
        if (streak > 7) {
            insights.push('🔥 You\'re on a ' + streak + '-day streak! Amazing consistency.');
        } else if (streak > 0 && streak < 7) {
            insights.push('🌱 Keep building your streak! ' + streak + ' days so far.');
        } else {
            insights.push('🌱 Start your learning streak today!');
        }
        
        if (completed.length > 0 && completed.length < 10) {
            insights.push('📚 You\'ve completed ' + completed.length + ' lessons. Keep going!');
        } else if (completed.length >= 10 && completed.length < 50) {
            insights.push('📚 You\'re building momentum! ' + completed.length + ' lessons completed.');
        } else if (completed.length >= 50) {
            insights.push('🏆 Impressive! ' + completed.length + ' lessons completed!');
        }
        
        // 检测风险
        var lastActive = progress.lastActive;
        if (lastActive) {
            var daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 3) {
                insights.push('⚠️ You haven\'t learned in ' + daysSince + ' days. Come back soon!');
            }
        }
        
        _insights = insights;
        try {
            LawAIApp.StorageEngine?.set?.('ai_insights', insights);
        } catch (e) {}
        
        LawAIApp.EventBus?.emit?.('InsightGenerated', { insights: insights });
        return insights;
    }

    function getInsights() {
        if (_insights.length === 0) {
            try {
                var stored = LawAIApp.StorageEngine?.get?.('ai_insights');
                if (stored) {
                    _insights = stored;
                    return _insights;
                }
            } catch (e) {}
            return generateInsights();
        }
        return _insights;
    }

    // ===========================================
    // 预测
    // ===========================================
    function getPredictions() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        
        var dailyRate = 1; // 默认每天1课
        if (completed.length > 0) {
            var days = Math.max(1, Math.floor((Date.now() - new Date(progress.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
            dailyRate = Math.max(0.1, completed.length / days);
        }
        
        var remaining = Math.max(0, total - completed.length);
        var daysToCompletion = dailyRate > 0 ? Math.round(remaining / dailyRate) : 365;
        
        var completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysToCompletion);
        
        var levelInfo = LawAIApp.XPEngine?.getLevelInfo?.(xp) || { level: 1, progress: 0 };
        var nextLevelXP = 0;
        var levelConfig = LawAIApp.XPEngine?.LEVEL_CONFIG || [];
        for (var i = 0; i < levelConfig.length; i++) {
            if (levelConfig[i].level === (levelInfo.level || 1) + 1) {
                nextLevelXP = levelConfig[i].xpRequired;
                break;
            }
        }
        var xpToNextLevel = nextLevelXP - xp;
        var daysToNextLevel = dailyRate > 0 ? Math.round(xpToNextLevel / (dailyRate * 20)) : 30;
        
        return {
            completion: {
                daysRemaining: daysToCompletion,
                estimatedDate: completionDate.toISOString().split('T')[0]
            },
            nextLevel: {
                currentLevel: levelInfo.level || 1,
                xpToNext: Math.max(0, xpToNextLevel),
                estimatedDays: Math.max(0, daysToNextLevel)
            }
        };
    }

    // ===========================================
    // 辅助方法
    // ===========================================
    function detectBestTime() {
        // 简化版：基于习惯数据
        var rhythm = LawAIApp.HabitEngine?.getRhythm?.() || {};
        return rhythm.preferredTime || 'morning';
    }

    function calculateRetention() {
        var memory = LawAIApp.MemoryEngine?.getAll?.() || {};
        var keys = Object.keys(memory);
        if (keys.length === 0) return 50;
        
        var totalStrength = 0;
        for (var key in memory) {
            totalStrength += memory[key].strength || 50;
        }
        return Math.round(totalStrength / keys.length);
    }

    function getPracticeFrequency() {
        var history = LawAIApp.PracticeEngine?.getHistory?.() || [];
        var days = Math.max(1, Math.floor(Date.now() / (1000 * 60 * 60 * 24)));
        return history.length / days;
    }

    function calculateEfficiency() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        if (completed.length === 0) return 50;
        return Math.min(100, Math.round((xp / (completed.length * 20)) * 100));
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        buildProfile();
        getOverallHealth();
        generateInsights();
        
        // 监听事件更新
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            buildProfile();
            getOverallHealth();
            generateInsights();
        });
        
        LawAIApp.EventBus?.on?.('PracticeCompleted', function() {
            buildProfile();
            getOverallHealth();
            generateInsights();
        });
        
        console.log('🧠 LearningIntelligence initialized');
    }

    setTimeout(init, 400);

    return {
        init: init,
        getProfile: getProfile,
        getHealth: getHealth,
        getInsights: getInsights,
        getPredictions: getPredictions,
        buildProfile: buildProfile,
        generateInsights: generateInsights
    };
})();

console.log('🧠 LearningIntelligence V2.0 ready');
