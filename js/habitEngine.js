// ===========================================
// habitEngine.js
// 习惯引擎 - 学习习惯追踪（Phase 22 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.HabitEngine = (function() {
    var _initialized = false;
    var _habits = [];

    // ===========================================
    // 习惯追踪
    // ===========================================
    function getTodayHabits() {
        var today = new Date().toDateString();
        try {
            var stored = LawAIApp.StorageEngine?.get?.('habit_tracker') || {};
            return stored[today] || { lessons: 0, reviews: 0, reflections: 0, completed: false };
        } catch (e) {
            return { lessons: 0, reviews: 0, reflections: 0, completed: false };
        }
    }

    function saveTodayHabits(habits) {
        var today = new Date().toDateString();
        try {
            var stored = LawAIApp.StorageEngine?.get?.('habit_tracker') || {};
            stored[today] = habits;
            LawAIApp.StorageEngine?.set?.('habit_tracker', stored);
        } catch (e) {}
    }

    function record(type) {
        var habits = getTodayHabits();
        if (type === 'lesson') habits.lessons = (habits.lessons || 0) + 1;
        else if (type === 'review') habits.reviews = (habits.reviews || 0) + 1;
        else if (type === 'reflection') habits.reflections = (habits.reflections || 0) + 1;
        
        // 检查是否完成每日目标（至少1节课）
        if (habits.lessons >= 1) habits.completed = true;
        
        saveTodayHabits(habits);
        LawAIApp.EventBus?.emit?.('HabitRecorded', { type: type, habits: habits });
        return habits;
    }

    function getWeekHistory() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('habit_tracker') || {};
            var days = Object.keys(stored);
            var last7 = days.slice(-7);
            var result = {};
            last7.forEach(function(day) {
                result[day] = stored[day];
            });
            return result;
        } catch (e) {
            return {};
        }
    }

    // ===========================================
    // 习惯分数
    // ===========================================
    function calculateScore() {
        var today = getTodayHabits();
        var week = getWeekHistory();
        var days = Object.keys(week);
        var completedDays = days.filter(function(d) { return week[d]?.completed; }).length;
        
        // 分数基于：今日完成 + 本周一致性 + 连续天数
        var todayBonus = today.completed ? 20 : 0;
        var consistencyBonus = Math.min(50, completedDays * 7);
        var streakBonus = 0;
        
        // 计算连续天数
        var sortedDays = days.sort();
        var streak = 0;
        var currentStreak = 0;
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var yesterdayStr = yesterday.toDateString();
        
        for (var i = sortedDays.length - 1; i >= 0; i--) {
            if (sortedDays[i] === yesterdayStr || i === sortedDays.length - 1) {
                if (week[sortedDays[i]]?.completed) {
                    currentStreak++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        streak = currentStreak;
        streakBonus = Math.min(30, streak * 3);

        return Math.min(100, todayBonus + consistencyBonus + streakBonus);
    }

    // ===========================================
    // 学习节奏分析
    // ===========================================
    function analyzeRhythm() {
        var week = getWeekHistory();
        var days = Object.keys(week);
        var totalLessons = 0;
        var activeDays = 0;
        
        days.forEach(function(day) {
            var d = week[day];
            if (d) {
                totalLessons += d.lessons || 0;
                if ((d.lessons || 0) > 0) activeDays++;
            }
        });

        return {
            preferredTime: 'morning', // 默认
            avgSessionLength: days.length > 0 ? Math.round(totalLessons / days.length) : 0,
            preferredDays: days,
            activeDays: activeDays,
            totalLessons: totalLessons,
            consistency: days.length > 0 ? Math.round((activeDays / days.length) * 100) : 0
        };
    }

    // ===========================================
    // 恢复目标
    // ===========================================
    function createRecoveryGoal() {
        var today = getTodayHabits();
        var week = getWeekHistory();
        var days = Object.keys(week);
        var completedDays = days.filter(function(d) { return week[d]?.completed; }).length;
        
        if (completedDays < 3) {
            return {
                type: 'recovery',
                message: 'You\'ve been less active this week. Try completing 1 lesson today to rebuild momentum.',
                target: 1,
                current: today.lessons || 0
            };
        }
        return null;
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;

        // 监听事件
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            record('lesson');
            calculateScore();
            LawAIApp.EventBus?.emit?.('HabitUpdated', { habits: getTodayHabits() });
        });

        LawAIApp.EventBus?.on?.('ReflectionGenerated', function() {
            record('reflection');
        });

        // 定期检查
        setInterval(function() {
            var rhythm = analyzeRhythm();
            try {
                LawAIApp.StorageEngine?.set?.('learning_rhythm', rhythm);
            } catch (e) {}
        }, 1800000);

        console.log('📊 HabitEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getScore: calculateScore,
        getRhythm: function() {
            try {
                return LawAIApp.StorageEngine?.get?.('learning_rhythm') || { preferredTime: 'unknown', avgSessionLength: 0, preferredDays: [] };
            } catch (e) {
                return { preferredTime: 'unknown', avgSessionLength: 0, preferredDays: [] };
            }
        },
        getTodayHabits: getTodayHabits,
        getWeekHistory: getWeekHistory,
        createRecoveryGoal: createRecoveryGoal,
        record: record,
        analyzeRhythm: analyzeRhythm
    };
})();

console.log('📊 HabitEngine V2.0 ready');
