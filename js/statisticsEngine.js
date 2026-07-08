// ===========================================
// recommendationEngine.js
// 推荐引擎 - 个性化学习推荐（Phase 18 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RecommendationEngine = (function() {
    var _activeRecommendations = [];
    var _history = [];
    var _maxHistory = 100;
    var _initialized = false;

    // ===========================================
    // 推荐规则
    // ===========================================
    function generateRecommendations() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var streak = progress.streak || 0;
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        var level = LawAIApp.XPEngine?.getCurrentLevel?.() || 1;

        var recommendations = [];

        // 规则1：如果有连续签到，推荐下一课
        if (streak >= 3 && completed.length < total) {
            var nextDay = Math.min(completed.length + 1, total);
            recommendations.push({
                id: 'rec_' + Date.now() + '_1',
                type: 'lesson',
                title: 'Continue Your Streak',
                description: 'Complete Day ' + nextDay + ' to maintain your ' + streak + '-day streak!',
                action: 'pages/lesson.html',
                priority: 'high',
                icon: '🔥'
            });
        }

        // 规则2：如果 XP 低，推荐基础课程
        if (xp < 100 && completed.length < 20) {
            recommendations.push({
                id: 'rec_' + Date.now() + '_2',
                type: 'focus',
                title: 'Build Your Foundation',
                description: 'Focus on completing the first 30 lessons to build your AI foundation.',
                action: 'pages/academy.html',
                priority: 'medium',
                icon: '🏛️'
            });
        }

        // 规则3：推荐复习（如果有已完成课程）
        if (completed.length > 5) {
            var randomLesson = completed[Math.floor(Math.random() * completed.length)];
            recommendations.push({
                id: 'rec_' + Date.now() + '_3',
                type: 'review',
                title: 'Review Session',
                description: 'Revisit ' + randomLesson + ' to reinforce your learning.',
                action: 'pages/lesson.html?lesson=' + randomLesson,
                priority: 'low',
                icon: '🔄'
            });
        }

        // 规则4：里程碑推荐
        if (completed.length >= 10 && completed.length < 20) {
            recommendations.push({
                id: 'rec_' + Date.now() + '_4',
                type: 'milestone',
                title: 'Almost at 20 Lessons!',
                description: 'Complete ' + (20 - completed.length) + ' more lessons to reach your first major milestone.',
                action: 'pages/academy.html',
                priority: 'medium',
                icon: '🏅'
            });
        }

        // 规则5：连续签到奖励提醒
        if (streak > 0 && streak % 7 === 0) {
            recommendations.push({
                id: 'rec_' + Date.now() + '_5',
                type: 'reward',
                title: 'Streak Milestone!',
                description: 'You\'ve achieved a ' + streak + '-day streak! Keep going for bonus XP!',
                action: '#',
                priority: 'high',
                icon: '🎁'
            });
        }

        // 限制推荐数量
        return recommendations.slice(0, 5);
    }

    function generateAndStore() {
        console.log('🔄 Generating recommendations...');
        var newRecs = generateRecommendations();
        
        // 合并推荐（去重）
        var existingIds = _activeRecommendations.map(function(r) { return r.id; });
        newRecs.forEach(function(rec) {
            if (existingIds.indexOf(rec.id) === -1) {
                _activeRecommendations.push(rec);
            }
        });
        
        // 限制活跃推荐数量
        if (_activeRecommendations.length > 10) {
            _activeRecommendations = _activeRecommendations.slice(0, 10);
        }
        
        LawAIApp.EventBus?.emit?.('RecommendationGenerated', {
            active: _activeRecommendations
        });
        
        return _activeRecommendations;
    }

    // ===========================================
    // 公共 API
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        // 监听事件
        LawAIApp.EventBus?.on?.('AnalyticsUpdated', generateAndStore);
        LawAIApp.EventBus?.on?.('ProgressUpdated', generateAndStore);
        LawAIApp.EventBus?.on?.('LessonCompleted', generateAndStore);
        LawAIApp.EventBus?.on?.('XPUpdated', generateAndStore);
        
        // 初始生成
        generateAndStore();
        
        console.log('📌 RecommendationEngine initialized');
    }

    function getActiveRecommendations() {
        return _activeRecommendations.slice();
    }

    function accept(id) {
        var rec = _activeRecommendations.find(function(r) { return r.id === id; });
        if (rec) {
            rec.accepted = true;
            rec.acceptedAt = new Date().toISOString();
            _history.push(rec);
            if (_history.length > _maxHistory) {
                _history = _history.slice(-_maxHistory);
            }
            _activeRecommendations = _activeRecommendations.filter(function(r) { return r.id !== id; });
            LawAIApp.EventBus?.emit?.('RecommendationAccepted', { id: id });
            console.log('✅ Recommendation accepted:', id);
        }
        return rec;
    }

    function dismiss(id) {
        var rec = _activeRecommendations.find(function(r) { return r.id === id; });
        if (rec) {
            rec.dismissed = true;
            rec.dismissedAt = new Date().toISOString();
            _history.push(rec);
            if (_history.length > _maxHistory) {
                _history = _history.slice(-_maxHistory);
            }
            _activeRecommendations = _activeRecommendations.filter(function(r) { return r.id !== id; });
            LawAIApp.EventBus?.emit?.('RecommendationDismissed', { id: id });
            console.log('📌 Recommendation dismissed:', id);
        }
        return rec;
    }

    function getHistory() {
        return _history.slice();
    }

    function refresh() {
        return generateAndStore();
    }

    function clearAll() {
        _activeRecommendations = [];
        _history = [];
        console.log('🔄 All recommendations cleared');
    }

    // ===========================================
    // 自动初始化
    // ===========================================
    setTimeout(init, 400);

    return {
        init: init,
        getActiveRecommendations: getActiveRecommendations,
        accept: accept,
        dismiss: dismiss,
        getHistory: getHistory,
        refresh: refresh,
        clearAll: clearAll
    };
})();

console.log('📌 RecommendationEngine V2.0 ready');
