// ===========================================
// adaptiveLearning.js
// 自适应学习编排器 - 最佳下一步行动（Phase 34 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AdaptiveLearning = (function() {
    var _initialized = false;
    var _dailyPlan = null;

    // ===========================================
    // 每日计划
    // ===========================================
    function generateDailyPlan() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var nextDay = Math.min(completed.length + 1, total);
        
        var recommendations = LawAIApp.RecommendationEngine?.getActiveRecommendations?.() || [];
        
        _dailyPlan = {
            date: new Date().toISOString().split('T')[0],
            recommendedLesson: 'day-' + nextDay,
            recommendedActivities: [],
            recommendations: recommendations.slice(0, 2),
            priority: 'learning',
            estimatedMinutes: 30,
            completed: false
        };
        
        // 添加复习建议
        var memoryReviews = LawAIApp.MemoryEngine?.getTodayReviews?.() || [];
        if (memoryReviews.length > 0) {
            _dailyPlan.recommendedActivities.push({
                type: 'review',
                lessonId: memoryReviews[0],
                description: 'Review ' + memoryReviews[0]
            });
        }
        
        // 添加练习建议
        var practiceHistory = LawAIApp.PracticeEngine?.getHistory?.() || [];
        if (practiceHistory.length > 0) {
            var lastLesson = practiceHistory[practiceHistory.length - 1]?.lessonId;
            if (lastLesson) {
                _dailyPlan.recommendedActivities.push({
                    type: 'practice',
                    lessonId: lastLesson,
                    description: 'Practice ' + lastLesson
                });
            }
        }
        
        try {
            LawAIApp.StorageEngine?.set?.('daily_plan', _dailyPlan);
        } catch (e) {}
        
        LawAIApp.EventBus?.emit?.('DailyPlanGenerated', { plan: _dailyPlan });
        return _dailyPlan;
    }

    function getTodaysPlan() {
        if (!_dailyPlan) {
            try {
                var stored = LawAIApp.StorageEngine?.get?.('daily_plan');
                var today = new Date().toISOString().split('T')[0];
                if (stored && stored.date === today) {
                    _dailyPlan = stored;
                    return _dailyPlan;
                }
            } catch (e) {}
            return generateDailyPlan();
        }
        return _dailyPlan;
    }

    // ===========================================
    // 推荐
    // ===========================================
    function generateRecommendations(limit) {
        limit = limit || 5;
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var weakSkills = LawAIApp.SkillEngine?.getWeakestSkills?.(3) || [];
        
        var recommendations = [];
        
        // 1. 下一课推荐
        var nextDay = Math.min(completed.length + 1, total);
        recommendations.push({
            id: 'rec_next_lesson',
            type: 'lesson',
            title: 'Day ' + nextDay,
            description: 'Continue your learning journey',
            priority: 'high'
        });
        
        // 2. 弱点推荐
        weakSkills.forEach(function(skill, index) {
            if (skill && skill.title) {
                recommendations.push({
                    id: 'rec_skill_' + index,
                    type: 'skill',
                    title: 'Improve ' + skill.title,
                    description: 'Focus on your weakest skill area',
                    priority: 'medium'
                });
            }
        });
        
        // 3. 复习推荐
        var reviews = LawAIApp.MemoryEngine?.getTodayReviews?.() || [];
        if (reviews.length > 0) {
            recommendations.push({
                id: 'rec_review',
                type: 'review',
                title: 'Review Session',
                description: 'Review ' + reviews.length + ' lesson(s) today',
                priority: 'medium'
            });
        }
        
        // 4. 项目推荐
        var projectRec = LawAIApp.ProjectEngine?.recommend?.() || null;
        if (projectRec) {
            recommendations.push({
                id: 'rec_project',
                type: 'project',
                title: projectRec.title || 'Start a Project',
                description: projectRec.description || 'Apply your learning',
                priority: 'low'
            });
        }
        
        return recommendations.slice(0, limit);
    }

    // ===========================================
    // 缺口检测
    // ===========================================
    function getGapReport(lessonId) {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var lesson = null;
        
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                }
            }
        } catch (e) {}
        
        if (!lesson) return { gaps: ['Lesson not found'] };
        
        var gaps = [];
        var prerequisites = lesson.prerequisites || [];
        prerequisites.forEach(function(req) {
            if (!completed.includes(req)) {
                gaps.push({
                    lessonId: req,
                    reason: 'Prerequisite not completed'
                });
            }
        });
        
        return {
            lessonId: lessonId,
            gaps: gaps,
            ready: gaps.length === 0
        };
    }

    // ===========================================
    // 学习平衡
    // ===========================================
    function calculateBalance() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var skills = LawAIApp.SkillEngine?.getAll?.() || [];
        var practices = LawAIApp.PracticeEngine?.getHistory?.() || [];
        var projects = LawAIApp.ProjectEngine?.getCompletedProjects?.() || [];
        
        var categories = ['learning', 'practice', 'review', 'project'];
        var scores = {
            learning: Math.min(100, completed.length * 2),
            practice: Math.min(100, practices.length * 5),
            review: 50,
            project: Math.min(100, projects.length * 20)
        };
        
        // 检查平衡性
        var avg = (scores.learning + scores.practice + scores.review + scores.project) / 4;
        var balance = {
            scores: scores,
            average: Math.round(avg),
            imbalance: Object.keys(scores).filter(function(k) {
                return Math.abs(scores[k] - avg) > 30;
            })
        };
        
        return balance;
    }

    function suggestActivity() {
        var balance = calculateBalance();
        var lowest = Object.keys(balance.scores).reduce(function(a, b) {
            return balance.scores[a] < balance.scores[b] ? a : b;
        });
        
        var suggestions = {
            learning: { type: 'lesson', message: 'Complete your next lesson to balance your learning' },
            practice: { type: 'practice', message: 'Practice a recent lesson to improve retention' },
            review: { type: 'review', message: 'Review a previous lesson to reinforce knowledge' },
            project: { type: 'project', message: 'Start a project to apply your skills' }
        };
        
        return suggestions[lowest] || suggestions.learning;
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        generateDailyPlan();
        
        // 监听事件更新计划
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            generateDailyPlan();
            calculateBalance();
        });
        
        LawAIApp.EventBus?.on?.('PracticeCompleted', function() {
            calculateBalance();
        });
        
        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            generateDailyPlan();
            calculateBalance();
        });
        
        console.log('🎯 AdaptiveLearning initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getTodaysPlan: getTodaysPlan,
        generateDailyPlan: generateDailyPlan,
        getRecommendations: generateRecommendations,
        getGapReport: getGapReport,
        getBalance: calculateBalance,
        suggestActivity: suggestActivity
    };
})();

console.log('🎯 AdaptiveLearning V2.0 ready');
