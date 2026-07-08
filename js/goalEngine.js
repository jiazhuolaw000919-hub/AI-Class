// ===========================================
// goalEngine.js
// 学习目标引擎 - 目标驱动学习（Phase 30 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GoalEngine = (function() {
    var _initialized = false;
    var _goals = [];

    // ===========================================
    // 目标定义
    // ===========================================
    var GOAL_TYPES = {
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MILESTONE: 'milestone',
        CAREER: 'career'
    };

    // ===========================================
    // 目标管理
    // ===========================================
    function getActiveGoals() {
        _sync();
        return _goals.filter(function(g) {
            return g.status === 'active' || g.status === 'in_progress';
        });
    }

    function getAllGoals() {
        _sync();
        return _goals;
    }

    function createGoal(goalDef) {
        var goal = {
            goalId: 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: goalDef.type || GOAL_TYPES.DAILY,
            title: goalDef.title || 'Learning Goal',
            description: goalDef.description || '',
            target: goalDef.target || 1,
            currentValue: 0,
            progress: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: goalDef.expiresAt || null,
            metadata: goalDef.metadata || {}
        };
        
        _goals.push(goal);
        _save();
        LawAIApp.EventBus?.emit?.('GoalCreated', { goal: goal });
        return goal;
    }

    function updateProgress(goalId, progressData) {
        var goal = _goals.find(function(g) { return g.goalId === goalId; });
        if (!goal) return null;
        
        // 更新进度
        if (progressData.completedLessons !== undefined) {
            goal.currentValue = progressData.completedLessons;
        } else if (progressData.learningHours !== undefined) {
            goal.currentValue = progressData.learningHours;
        } else if (progressData.memoryStrength !== undefined) {
            goal.currentValue = progressData.memoryStrength;
        } else {
            goal.currentValue = (goal.currentValue || 0) + 1;
        }
        
        goal.progress = Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
        goal.updatedAt = new Date().toISOString();
        
        if (goal.progress >= 100) {
            goal.status = 'completed';
            LawAIApp.EventBus?.emit?.('GoalCompleted', { goal: goal });
        }
        
        _save();
        LawAIApp.EventBus?.emit?.('GoalUpdated', { goal: goal });
        return goal;
    }

    function getGoal(goalId) {
        _sync();
        return _goals.find(function(g) { return g.goalId === goalId; }) || null;
    }

    function getGoalTimeline(goalId) {
        var goal = getGoal(goalId);
        if (!goal) return null;
        
        var timeline = {
            goalId: goalId,
            title: goal.title,
            progress: goal.progress,
            target: goal.target,
            currentValue: goal.currentValue,
            status: goal.status,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt
        };
        
        return timeline;
    }

    function getFullTimeline() {
        var active = getActiveGoals();
        return active.map(function(g) {
            return getGoalTimeline(g.goalId);
        }).filter(function(t) { return t; });
    }

    function recommendGoal() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        
        if (completed.length < 5) {
            return {
                type: GOAL_TYPES.DAILY,
                title: 'Complete 5 Lessons',
                description: 'Build your foundation by completing 5 lessons',
                target: 5,
                current: completed.length
            };
        } else if (completed.length < 30) {
            return {
                type: GOAL_TYPES.MILESTONE,
                title: 'Reach 30 Lessons',
                description: 'Complete 30 lessons to unlock the Foundation milestone',
                target: 30,
                current: completed.length
            };
        } else if (xp < 500) {
            return {
                type: GOAL_TYPES.WEEKLY,
                title: 'Earn 500 XP',
                description: 'Keep learning to earn 500 XP',
                target: 500,
                current: xp
            };
        } else {
            return {
                type: GOAL_TYPES.CAREER,
                title: 'AI Practitioner',
                description: 'Complete 100 lessons to become an AI Practitioner',
                target: 100,
                current: completed.length
            };
        }
    }

    function checkGoalHealth() {
        var active = getActiveGoals();
        var unhealthy = [];
        
        active.forEach(function(goal) {
            var daysSinceUpdate = 0;
            if (goal.updatedAt) {
                daysSinceUpdate = Math.floor((Date.now() - new Date(goal.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
            }
            
            if (daysSinceUpdate > 7 && goal.progress < 50) {
                unhealthy.push({
                    goalId: goal.goalId,
                    title: goal.title,
                    issue: 'No progress in ' + daysSinceUpdate + ' days',
                    severity: daysSinceUpdate > 14 ? 'high' : 'medium'
                });
            }
        });
        
        return unhealthy;
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('goals');
            if (stored) _goals = stored;
        } catch (e) {}
        
        // 如果没有目标，创建默认
        if (_goals.length === 0) {
            var defaultGoal = {
                goalId: 'goal_default',
                type: GOAL_TYPES.DAILY,
                title: 'Complete Daily Lessons',
                description: 'Complete at least 1 lesson each day',
                target: 1,
                currentValue: 0,
                progress: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            _goals.push(defaultGoal);
            _save();
        }
    }

    function _save() {
        try {
            LawAIApp.StorageEngine?.set?.('goals', _goals);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        
        // 监听事件自动更新
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var active = getActiveGoals();
            active.forEach(function(goal) {
                if (goal.type === GOAL_TYPES.DAILY || goal.type === GOAL_TYPES.MILESTONE) {
                    var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
                    updateProgress(goal.goalId, {
                        completedLessons: progress.completedLessons?.length || 0
                    });
                }
            });
        });
        
        LawAIApp.EventBus?.on?.('XPUpdated', function(data) {
            var active = getActiveGoals();
            active.forEach(function(goal) {
                if (goal.type === GOAL_TYPES.WEEKLY) {
                    updateProgress(goal.goalId, {
                        learningHours: (LawAIApp.XPEngine?.getCurrentXP?.() || 0)
                    });
                }
            });
        });
        
        // 定期健康检查
        setInterval(function() {
            var unhealthy = checkGoalHealth();
            unhealthy.forEach(function(issue) {
                LawAIApp.EventBus?.emit?.('GoalHealthWarning', { issue: issue });
            });
        }, 86400000);
        
        console.log('🎯 GoalEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        createGoal: createGoal,
        updateProgress: updateProgress,
        getActiveGoals: getActiveGoals,
        getAllGoals: getAllGoals,
        getGoal: getGoal,
        getGoalTimeline: getGoalTimeline,
        getFullTimeline: getFullTimeline,
        recommendGoal: recommendGoal,
        checkHealth: checkGoalHealth,
        GOAL_TYPES: GOAL_TYPES
    };
})();

console.log('🎯 GoalEngine V2.0 ready');
