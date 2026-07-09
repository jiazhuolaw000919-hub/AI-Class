// ===========================================
// userApi.js
// 用户相关 API：创建、查询、更新 XP（Season 4 Chapter 2 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.UserApi = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('👤 UserApi initialized');
        return this;
    },

    createUser: async function(name, email) {
        email = email || null;
        var result = await LawAIApp.Database.from('users').insert({
            name: name,
            email: email,
            xp: 0,
            level: 1,
            streak: 0
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        var user = result.data[0];
        if (LawAIApp.IdentityEngine && typeof LawAIApp.IdentityEngine.update === 'function') {
            LawAIApp.IdentityEngine.update('displayName', user.name);
        }

        LawAIApp.EventBus?.emit?.('UserCreated', user);
        return { success: true, user: user };
    },

    getUser: async function(userId) {
        var result = await LawAIApp.Database.from('users').eq('id', userId).select();
        if (result.error) {
            return { success: false, user: null, error: result.error };
        }
        return { success: true, user: result.data?.[0] || null, error: null };
    },

    getUserByEmail: async function(email) {
        var result = await LawAIApp.Database.from('users').eq('email', email).select();
        if (result.error) {
            return { success: false, user: null, error: result.error };
        }
        return { success: true, user: result.data?.[0] || null, error: null };
    },

    updateXp: async function(userId, xpAmount) {
        var userResult = await this.getUser(userId);
        if (!userResult.success || !userResult.user) {
            return { success: false, error: 'User not found' };
        }

        var currentUser = userResult.user;
        var newXp = (currentUser.xp || 0) + xpAmount;
        var newLevel = Math.floor(newXp / 500) + 1;

        var result = await LawAIApp.Database.from('users').update({
            id: userId,
            xp: newXp,
            level: newLevel
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        LawAIApp.EventBus?.emit?.('UserXpUpdated', {
            userId: userId,
            xp: newXp,
            level: newLevel
        });

        return { success: true, xp: newXp, level: newLevel };
    },

    updateStreak: async function(userId, streak) {
        var result = await LawAIApp.Database.from('users').update({
            id: userId,
            streak: streak || 1
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        LawAIApp.EventBus?.emit?.('UserStreakUpdated', {
            userId: userId,
            streak: streak || 1
        });

        return { success: true, streak: streak || 1 };
    },

    getAllUsers: async function() {
        var result = await LawAIApp.Database.from('users').select();
        if (result.error) {
            return { success: false, users: [], error: result.error };
        }
        return { success: true, users: result.data || [], error: null };
    },

    deleteUser: async function(userId) {
        var result = await LawAIApp.Database.from('users').delete('id', userId);
        if (result.error) {
            return { success: false, error: result.error };
        }
        LawAIApp.EventBus?.emit?.('UserDeleted', { userId: userId });
        return { success: true };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.UserApi && typeof LawAIApp.UserApi.init === 'function') {
        LawAIApp.UserApi.init();
    }
}, 150);

console.log('👤 UserApi V2.0 ready');
