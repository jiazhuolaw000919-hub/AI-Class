// ===========================================
// mentorEngine.js
// AI 导师引擎 - 学习伙伴与建议（Phase 21 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MentorEngine = (function() {
    var _initialized = false;
    var _memory = {
        recentContext: { lastInteraction: null, lastLesson: null },
        strengths: [],
        weaknesses: [],
        conversationHistory: []
    };
    var _goals = [];

    // ===========================================
    // 内存管理（替代 MentorMemory）
    // ===========================================
    function getMemory() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('mentor_memory');
            if (stored) {
                _memory = { ..._memory, ...stored };
            }
        } catch (e) {}
        return _memory;
    }

    function saveMemory() {
        try {
            LawAIApp.StorageEngine?.set?.('mentor_memory', _memory);
        } catch (e) {}
    }

    function updateContext(lessonId) {
        _memory.recentContext.lastInteraction = new Date().toISOString();
        _memory.recentContext.lastLesson = lessonId;
        saveMemory();
    }

    function refreshStrengths() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        
        if (completed.length === 0) {
            _memory.strengths = ['Starting your journey'];
            _memory.weaknesses = ['No lessons completed yet'];
            return;
        }

        // 分析已完成课程
        var categories = {};
        completed.forEach(function(id) {
            var day = parseInt(id.replace('day-', ''));
            if (isNaN(day)) return;
            var cat = 'General';
            if (day <= 30) cat = 'Foundation';
            else if (day <= 70) cat = 'Prompt Engineering';
            else if (day <= 120) cat = 'AI Tools';
            else if (day <= 220) cat = 'AI Development';
            else if (day <= 300) cat = 'Projects';
            else cat = 'AI Business';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        var sorted = Object.entries(categories).sort(function(a, b) { return b[1] - a[1]; });
        _memory.strengths = sorted.slice(0, 2).map(function(s) { return s[0]; });
        _memory.weaknesses = sorted.slice(-2).map(function(s) { return s[0]; });
        
        if (_memory.strengths.length === 0) {
            _memory.strengths = ['Building foundation'];
        }
        saveMemory();
    }

    // ===========================================
    // 目标管理（替代 MentorGoals）
    // ===========================================
    function getActiveGoals() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('mentor_goals');
            if (stored) return stored;
        } catch (e) {}
        return _goals;
    }

    function saveGoals(goals) {
        _goals = goals;
        try {
            LawAIApp.StorageEngine?.set?.('mentor_goals', goals);
        } catch (e) {}
    }

    function generateDailyGoal() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var nextDay = Math.min(completed.length + 1, 365);
        
        var goal = {
            id: 'goal_' + Date.now(),
            type: 'daily',
            description: 'Complete Day ' + nextDay,
            target: 1,
            currentValue: 0,
            progress: 0,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        
        var goals = getActiveGoals();
        goals.push(goal);
        saveGoals(goals);
        return goal;
    }

    function updateGoalProgress(goalId, increment) {
        increment = increment || 1;
        var goals = getActiveGoals();
        var goal = goals.find(function(g) { return g.id === goalId; });
        if (goal) {
            goal.currentValue = (goal.currentValue || 0) + increment;
            goal.progress = Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
            saveGoals(goals);
        }
    }

    // ===========================================
    // 主动检查
    // ===========================================
    function proactiveCheck() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var streak = progress.streak || 0;
        var completed = progress.completedLessons || [];
        
        // 检查连续签到
        if (completed.length > 0) {
            var memory = getMemory();
            var lastInteraction = memory.recentContext.lastInteraction;
            if (lastInteraction) {
                var hoursSince = (Date.now() - new Date(lastInteraction).getTime()) / 3600000;
                if (hoursSince > 24 && streak > 0) {
                    console.log('🧠 Mentor: Don\'t forget to keep your streak going!');
                    LawAIApp.EventBus?.emit?.('MentorReminder', { 
                        type: 'streak', 
                        message: 'Keep your ' + streak + '-day streak alive!' 
                    });
                }
            }
        }

        // 检查每日目标
        var goals = getActiveGoals();
        var dailyGoals = goals.filter(function(g) { return g.type === 'daily' && g.progress < 100; });
        if (dailyGoals.length === 0 && completed.length < 365) {
            generateDailyGoal();
        }

        refreshStrengths();
    }

    // ===========================================
    // 对话
    // ===========================================
    function sendMessage(message) {
        var response = {
            message: message,
            reply: '',
            timestamp: new Date().toISOString()
        };

        var lower = message.toLowerCase();
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var streak = progress.streak || 0;

        if (lower.includes('streak') || lower.includes('daily')) {
            response.reply = 'You\'re on a ' + streak + '-day streak! Keep showing up daily to build momentum. 🎯';
        } else if (lower.includes('progress') || lower.includes('how')) {
            var pct = progress.completionPercent || 0;
            response.reply = 'You\'ve completed ' + completed.length + ' lessons (' + pct + '%). ' + 
                           'Your strengths are: ' + (_memory.strengths.join(', ') || 'building foundation') + '. Keep going! 🚀';
        } else if (lower.includes('help') || lower.includes('suggest')) {
            response.reply = 'Try completing your daily goal. Your next lesson is Day ' + Math.min(completed.length + 1, 365) + '.';
        } else if (lower.includes('thank')) {
            response.reply = 'You\'re welcome! Keep learning and growing. 🌱';
        } else {
            response.reply = 'That\'s a great question! Try focusing on your next lesson to keep making progress. 📚';
        }

        _memory.conversationHistory.push(response);
        saveMemory();
        return response;
    }

    // ===========================================
    // 反思
    // ===========================================
    function getLastReflection() {
        try {
            return LawAIApp.StorageEngine?.get?.('mentor_reflection') || null;
        } catch (e) {
            return null;
        }
    }

    function generateWeeklyReflection() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var streak = progress.streak || 0;
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;

        var reflection = {
            id: 'ref_' + Date.now(),
            type: 'weekly',
            summary: 'This week you completed ' + completed.length + ' lessons.',
            achievements: 'Streak: ' + streak + ' days, XP: ' + xp,
            nextSteps: 'Continue with Day ' + Math.min(completed.length + 1, 365),
            createdAt: new Date().toISOString()
        };

        try {
            LawAIApp.StorageEngine?.set?.('mentor_reflection', reflection);
        } catch (e) {}

        LawAIApp.EventBus?.emit?.('ReflectionGenerated', reflection);
        return reflection;
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;

        // 监听事件
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            updateContext(data.lessonId);
            refreshStrengths();
            var goals = getActiveGoals();
            var dailyGoals = goals.filter(function(g) { return g.type === 'daily'; });
            dailyGoals.forEach(function(g) {
                updateGoalProgress(g.id);
            });
        });

        LawAIApp.EventBus?.on?.('ProgressUpdated', function() {
            refreshStrengths();
        });

        // 定期检查
        setInterval(proactiveCheck, 3600000); // 每小时
        proactiveCheck(); // 启动时检查一次

        console.log('🧠 MentorEngine initialized');
    }

    // 自动初始化
    setTimeout(init, 300);

    // ===========================================
    // 公共 API
    // ===========================================
    return {
        init: init,
        talk: sendMessage,
        getReflection: getLastReflection,
        generateReflection: generateWeeklyReflection,
        getMemory: getMemory,
        getGoals: getActiveGoals,
        addGoal: function(type, desc, target) {
            var goal = {
                id: 'goal_' + Date.now(),
                type: type || 'custom',
                description: desc || 'Custom goal',
                target: target || 1,
                currentValue: 0,
                progress: 0,
                createdAt: new Date().toISOString()
            };
            var goals = getActiveGoals();
            goals.push(goal);
            saveGoals(goals);
            return goal;
        },
        refreshStrengths: refreshStrengths,
        generateDailyGoal: generateDailyGoal,
        proactiveCheck: proactiveCheck
    };
})();

console.log('🧠 MentorEngine V2.0 ready');
