// ===========================================
// authService.js
// 用户认证系统：注册、登录、会话管理（Season 4 Chapter 4 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AuthService = {
    _initialized: false,
    _currentUser: null,
    _usersKey: 'auth_users',
    _sessionKey: 'auth_session',

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        // 尝试恢复会话
        this._currentUser = this._getSession();

        if (this._currentUser) {
            console.log('🔐 Session restored for:', this._currentUser.name);
            LawAIApp.EventBus?.emit?.('UserLoggedIn', this._currentUser);
        }

        console.log('🔐 AuthService initialized');
        return this;
    },

    _getUsers: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(this._usersKey, []);
            }
            var val = localStorage.getItem('lawai_' + this._usersKey);
            return val ? JSON.parse(val) : [];
        } catch (e) {
            return [];
        }
    },

    _saveUsers: function(users) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(this._usersKey, users);
                return;
            }
            localStorage.setItem('lawai_' + this._usersKey, JSON.stringify(users));
        } catch (e) {}
    },

    _getSession: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var session = LawAIApp.StorageEngine.get(this._sessionKey, null);
                if (session) return session;
            }
            var val = localStorage.getItem('lawai_' + this._sessionKey);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            return null;
        }
    },

    _saveSession: function(user) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(this._sessionKey, user);
                return;
            }
            localStorage.setItem('lawai_' + this._sessionKey, JSON.stringify(user));
        } catch (e) {}
    },

    _removeSession: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.remove === 'function') {
                LawAIApp.StorageEngine.remove(this._sessionKey);
                return;
            }
            localStorage.removeItem('lawai_' + this._sessionKey);
        } catch (e) {}
    },

    signUp: async function(email, password, name) {
        name = name || email.split('@')[0] || 'User';

        var users = this._getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                return { success: false, error: 'Email already registered' };
            }
        }

        var newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: name,
            email: email,
            password: password,
            xp: 0,
            level: 1,
            streak: 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this._saveUsers(users);

        // 同步到数据库
        try {
            await LawAIApp.Database.from('users').insert(newUser);
        } catch (e) {}

        // 自动登录
        return this.signIn(email, password);
    },

    signIn: async function(email, password) {
        var users = this._getUsers();
        var user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                user = users[i];
                break;
            }
        }

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // 移除密码
        var sessionUser = { ...user };
        delete sessionUser.password;

        this._currentUser = sessionUser;
        this._saveSession(sessionUser);

        LawAIApp.EventBus?.emit?.('UserLoggedIn', sessionUser);
        return { success: true, user: sessionUser };
    },

    signOut: function() {
        this._currentUser = null;
        this._removeSession();
        LawAIApp.EventBus?.emit?.('UserLoggedOut');
        return { success: true };
    },

    getCurrentUser: function() {
        if (!this._currentUser) {
            this._currentUser = this._getSession();
        }
        return this._currentUser;
    },

    isLoggedIn: function() {
        return !!this.getCurrentUser();
    },

    updateUser: function(updates) {
        var current = this.getCurrentUser();
        if (!current) return { success: false, error: 'Not logged in' };

        var users = this._getUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === current.id) {
                users[i] = { ...users[i], ...updates };
                break;
            }
        }

        this._saveUsers(users);

        var updatedUser = { ...current, ...updates };
        delete updatedUser.password;
        this._currentUser = updatedUser;
        this._saveSession(updatedUser);

        LawAIApp.EventBus?.emit?.('UserUpdated', updatedUser);
        return { success: true, user: updatedUser };
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            loggedIn: this.isLoggedIn(),
            user: this.getCurrentUser()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AuthService && typeof LawAIApp.AuthService.init === 'function') {
        LawAIApp.AuthService.init();
    }
}, 200);

console.log('🔐 AuthService V2.0 ready');
