// ===========================================
// xpEngine.js
// XP 引擎 - 经验值、等级、里程碑（Phase 14 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.XPEngine = (function() {
    // 等级配置
    var LEVEL_CONFIG = [
        { level: 1, xpRequired: 0, title: 'New Explorer' },
        { level: 2, xpRequired: 100, title: 'AI Apprentice' },
        { level: 3, xpRequired: 250, title: 'AI Learner' },
        { level: 4, xpRequired: 500, title: 'AI Enthusiast' },
        { level: 5, xpRequired: 800, title: 'AI Practitioner' },
        { level: 6, xpRequired: 1200, title: 'AI Specialist' },
        { level: 7, xpRequired: 1800, title: 'AI Expert' },
        { level: 8, xpRequired: 2500, title: 'AI Master' },
        { level: 9, xpRequired: 3500, title: 'AI Grandmaster' },
        { level: 10, xpRequired: 5000, title: 'AI Legend' }
    ];

    // 里程碑配置
    var MILESTONES = [
        { xp: 100, label: '100 XP', icon: '⭐' },
        { xp: 500, label: '500 XP', icon: '🌟' },
        { xp: 1000, label: '1000 XP', icon: '🏅' },
        { xp: 2500, label: '2500 XP', icon: '👑' },
        { xp: 5000, label: '5000 XP', icon: '💎' }
    ];

    var _lastMilestoneIndex = -1;
    var _debugMode = false;

    function getXPData() {
        var defaults = { totalXP: 0, lifetimeXP: 0, currentLevel: 1, currentLevelTitle: 'New Explorer' };
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get('xp_data', defaults);
            }
            var val = localStorage.getItem('lawai_xp_data');
            return val ? JSON.parse(val) : defaults;
        } catch (e) {
            return defaults;
        }
    }

    function saveXPData(data) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('xp_data', data);
                return true;
            }
            localStorage.setItem('lawai_xp_data', JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    function getLevelInfo(xp) {
        var level = 1;
        var title = 'New Explorer';
        for (var i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
            if (xp >= LEVEL_CONFIG[i].xpRequired) {
                level = LEVEL_CONFIG[i].level;
                title = LEVEL_CONFIG[i].title;
                break;
            }
        }
        // 计算下一级所需 XP
        var nextLevelXP = 0;
        for (var j = 0; j < LEVEL_CONFIG.length; j++) {
            if (LEVEL_CONFIG[j].level === level + 1) {
                nextLevelXP = LEVEL_CONFIG[j].xpRequired;
                break;
            }
        }
        // 计算当前等级进度
        var currentLevelXP = 0;
        for (var k = 0; k < LEVEL_CONFIG.length; k++) {
            if (LEVEL_CONFIG[k].level === level) {
                currentLevelXP = LEVEL_CONFIG[k].xpRequired;
                break;
            }
        }
        var progress = nextLevelXP > currentLevelXP ? 
            Math.min(100, Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)) : 
            100;

        return {
            level: level,
            title: title,
            xp: xp,
            xpRequired: nextLevelXP,
            progress: progress,
            isMaxLevel: level >= LEVEL_CONFIG.length
        };
    }

    function checkMilestones(xp) {
        var unlocked = [];
        for (var i = 0; i < MILESTONES.length; i++) {
            if (xp >= MILESTONES[i].xp && i > _lastMilestoneIndex) {
                unlocked.push(MILESTONES[i]);
                _lastMilestoneIndex = i;
            }
        }
        return unlocked;
    }

    function awardXP(source, lessonId, customMultiplier) {
        customMultiplier = customMultiplier || 1.0;
        var baseXP = 20; // 默认每节课 20 XP
        
        // 尝试从 LessonEngine 获取真实 XP
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.split('-')[1]);
                if (!isNaN(day)) {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                    if (lesson && lesson.xpReward) {
                        baseXP = lesson.xpReward;
                    }
                }
            }
        } catch (e) {}

        // 连续签到加成
        var streakBonus = 0;
        try {
            var streak = LawAIApp.ProgressEngine?.getStreak?.() || 0;
            if (streak >= 7) streakBonus = 5;
            if (streak >= 14) streakBonus = 10;
            if (streak >= 30) streakBonus = 20;
        } catch (e) {}

        var finalXP = Math.round((baseXP + streakBonus) * customMultiplier);
        var data = getXPData();
        var previousLevel = data.currentLevel || 1;
        var previousXP = data.totalXP || 0;

        data.totalXP += finalXP;
        data.lifetimeXP += finalXP;

        var levelInfo = getLevelInfo(data.totalXP);
        data.currentLevel = levelInfo.level;
        data.currentLevelTitle = levelInfo.title;

        saveXPData(data);

        // 同步到 ProgressEngine
        try {
            var prog = LawAIApp.ProgressEngine?.getProgress?.() || {};
            prog.xp = data.totalXP;
            if (LawAIApp.ProgressEngine?.saveProgress) {
                LawAIApp.ProgressEngine.saveProgress(prog);
            }
        } catch (e) {}

        // 检查里程碑
        var milestones = checkMilestones(data.totalXP);
        milestones.forEach(function(m) {
            LawAIApp.EventBus?.emit?.('MilestoneUnlocked', { milestone: m, totalXP: data.totalXP });
            if (_debugMode) console.log('🏆 Milestone unlocked:', m.label);
        });

        // 检查等级提升
        var leveledUp = data.currentLevel > previousLevel;
        if (leveledUp) {
            LawAIApp.EventBus?.emit?.('LevelUp', { 
                newLevel: data.currentLevel, 
                title: data.currentLevelTitle,
                totalXP: data.totalXP,
                previousLevel: previousLevel
            });
            if (_debugMode) console.log('🎉 Level up! Level', data.currentLevel);
        }

        // 发布事件
        LawAIApp.EventBus?.emit?.('XPAwarded', { 
            lessonId: lessonId, 
            source: source,
            baseXP: baseXP, 
            streakBonus: streakBonus,
            finalXP: finalXP, 
            totalXP: data.totalXP 
        });
        LawAIApp.EventBus?.emit?.('XPUpdated', { 
            totalXP: data.totalXP, 
            level: data.currentLevel,
            levelTitle: data.currentLevelTitle,
            progress: levelInfo.progress
        });

        return {
            baseXP: baseXP,
            streakBonus: streakBonus,
            finalXP: finalXP,
            totalXP: data.totalXP,
            leveledUp: leveledUp,
            newLevel: data.currentLevel,
            milestones: milestones
        };
    }

    function getCurrentXP() {
        return getXPData().totalXP || 0;
    }

    function getLifetimeXP() {
        return getXPData().lifetimeXP || 0;
    }

    function getCurrentLevel() {
        return getXPData().currentLevel || 1;
    }

    function getCurrentLevelTitle() {
        return getXPData().currentLevelTitle || 'New Explorer';
    }

    function getLevelInfoForXP(xp) {
        return getLevelInfo(xp || getCurrentXP());
    }

    function getXPProgress() {
        var data = getXPData();
        return getLevelInfo(data.totalXP || 0);
    }

    function getMilestones() {
        return MILESTONES.slice();
    }

    function getUnlockedMilestones() {
        var xp = getCurrentXP();
        var unlocked = [];
        for (var i = 0; i < MILESTONES.length; i++) {
            if (xp >= MILESTONES[i].xp) {
                unlocked.push(MILESTONES[i]);
            }
        }
        return unlocked;
    }

    function resetXP() {
        var defaults = { totalXP: 0, lifetimeXP: 0, currentLevel: 1, currentLevelTitle: 'New Explorer' };
        saveXPData(defaults);
        _lastMilestoneIndex = -1;
        console.log('🔄 XP reset');
        return defaults;
    }

    function setDebugMode(enabled) {
        _debugMode = enabled;
    }

    // 自动监听 LessonCompleted 事件
    try {
        LawAIApp.EventBus?.on?.('LessonCompleted', function(payload) {
            var lessonId = payload?.lessonId;
            if (lessonId) {
                awardXP('lesson_completion', lessonId);
            }
        });
    } catch (e) {}

    return {
        awardXP: awardXP,
        getCurrentXP: getCurrentXP,
        getLifetimeXP: getLifetimeXP,
        getCurrentLevel: getCurrentLevel,
        getCurrentLevelTitle: getCurrentLevelTitle,
        getLevelInfo: getLevelInfoForXP,
        getXPProgress: getXPProgress,
        getMilestones: getMilestones,
        getUnlockedMilestones: getUnlockedMilestones,
        resetXP: resetXP,
        setDebugMode: setDebugMode,
        LEVEL_CONFIG: LEVEL_CONFIG,
        MILESTONES: MILESTONES
    };
})();

console.log('⭐ XPEngine V2.0 ready');
