// ===========================================
// identityEngine.js
// 身份与宇宙引擎 - 用户档案、偏好、头像（Phase 15 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.IdentityEngine = (function() {
    var defaultProfile = {
        displayName: 'Explorer',
        title: 'New Explorer',
        knowledgeRank: 1,
        knowledgeScore: 0,
        consistencyScore: 0,
        learningStyle: 'balanced',
        favoriteAcademy: 'academy_ai',
        theme: 'dark',
        avatar: '🚀',
        createdAt: null,
        updatedAt: null,
        preferences: {
            dailyReminder: true,
            showStreak: true,
            soundEffects: true,
            compactMode: false
        },
        stats: {
            totalSessions: 0,
            totalTimeMinutes: 0,
            longestStreak: 0
        }
    };

    var profile = null;
    var _initialized = false;

    function load() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var stored = LawAIApp.StorageEngine.get('identity_profile', null);
                if (stored) {
                    // 合并默认值（保证新增字段存在）
                    profile = mergeDeep(defaultProfile, stored);
                } else {
                    profile = { ...defaultProfile };
                    profile.createdAt = new Date().toISOString();
                }
            } else {
                var val = localStorage.getItem('lawai_identity_profile');
                if (val) {
                    var parsed = JSON.parse(val);
                    profile = mergeDeep(defaultProfile, parsed);
                } else {
                    profile = { ...defaultProfile };
                    profile.createdAt = new Date().toISOString();
                }
            }
        } catch (e) {
            profile = { ...defaultProfile };
            profile.createdAt = new Date().toISOString();
        }
        profile.updatedAt = new Date().toISOString();
        save();
        _initialized = true;
        return profile;
    }

    function mergeDeep(target, source) {
        var result = { ...target };
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = mergeDeep(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }

    function save() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('identity_profile', profile);
            } else {
                localStorage.setItem('lawai_identity_profile', JSON.stringify(profile));
            }
        } catch (e) {
            console.warn('⚠️ Failed to save identity profile:', e);
        }
    }

    function update(key, value) {
        if (!profile) load();
        profile[key] = value;
        profile.updatedAt = new Date().toISOString();
        save();
        LawAIApp.EventBus?.emit?.('IdentityUpdated', { key: key, value: value, profile: profile });
    }

    function updatePreferences(key, value) {
        if (!profile) load();
        if (!profile.preferences) profile.preferences = { ...defaultProfile.preferences };
        profile.preferences[key] = value;
        profile.updatedAt = new Date().toISOString();
        save();
        LawAIApp.EventBus?.emit?.('PreferencesUpdated', { key: key, value: value });
    }

    function getProfile() {
        if (!profile) load();
        return { ...profile };
    }

    function getDisplayName() {
        if (!profile) load();
        return profile.displayName || 'Explorer';
    }

    function getAvatar() {
        if (!profile) load();
        return profile.avatar || '🚀';
    }

    function getTitle() {
        if (!profile) load();
        return profile.title || 'New Explorer';
    }

    function getLearningStyle() {
        if (!profile) load();
        return profile.learningStyle || 'balanced';
    }

    function updateStats() {
        if (!profile) load();
        if (!profile.stats) profile.stats = { ...defaultProfile.stats };
        profile.stats.totalSessions = (profile.stats.totalSessions || 0) + 1;
        profile.updatedAt = new Date().toISOString();
        save();
    }

    function updateTimeSpent(minutes) {
        if (!profile) load();
        if (!profile.stats) profile.stats = { ...defaultProfile.stats };
        profile.stats.totalTimeMinutes = (profile.stats.totalTimeMinutes || 0) + minutes;
        profile.updatedAt = new Date().toISOString();
        save();
    }

    function updateLongestStreak(streak) {
        if (!profile) load();
        if (!profile.stats) profile.stats = { ...defaultProfile.stats };
        if (streak > (profile.stats.longestStreak || 0)) {
            profile.stats.longestStreak = streak;
            profile.updatedAt = new Date().toISOString();
            save();
        }
    }

    function resetProfile() {
        profile = { ...defaultProfile };
        profile.createdAt = new Date().toISOString();
        profile.updatedAt = new Date().toISOString();
        save();
        console.log('🔄 Identity profile reset');
        return profile;
    }

    // 自动监听事件
    try {
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            var prog = LawAIApp.ProgressEngine?.getProgress?.() || {};
            var score = (prog.xp || 0) + 10;
            update('knowledgeScore', score);
        });

        LawAIApp.EventBus?.on?.('LevelUp', function(data) {
            update('knowledgeRank', data.newLevel || 1);
            var titles = ['New Explorer', 'AI Apprentice', 'AI Learner', 'AI Enthusiast', 
                         'AI Practitioner', 'AI Specialist', 'AI Expert', 'AI Master', 
                         'AI Grandmaster', 'AI Legend'];
            var title = titles[(data.newLevel || 1) - 1] || 'AI Legend';
            update('title', title);
        });

        LawAIApp.EventBus?.on?.('StreakUpdated', function(data) {
            update('consistencyScore', data.streak || 0);
            updateLongestStreak(data.streak || 0);
        });
    } catch (e) {}

    // 加载
    load();

    return {
        getProfile: getProfile,
        getDisplayName: getDisplayName,
        getAvatar: getAvatar,
        getTitle: getTitle,
        getLearningStyle: getLearningStyle,
        update: update,
        updatePreferences: updatePreferences,
        updateStats: updateStats,
        updateTimeSpent: updateTimeSpent,
        updateLongestStreak: updateLongestStreak,
        resetProfile: resetProfile,
        save: save
    };
})();

console.log('🆔 IdentityEngine V2.0 ready');
