// ===========================================
// authService.js
// 认证服务：处理用户注册、登录、登出
// ===========================================
LawAIApp.AuthService = {
  _currentUser: null,
  _usersKey: 'auth_users',
  _sessionKey: 'auth_session',

  // 注册新用户
  async signUp(email, password, name) {
    const users = LawAIApp.StorageEngine.get(this._usersKey, []);
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      password, // 仅模拟，生产环境不存储明文
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    LawAIApp.StorageEngine.set(this._usersKey, users);

    // 同步到数据库层
    await LawAIApp.Database.from('users').insert(newUser);

    // 自动登录
    return this.signIn(email, password);
  },

  // 用户登录
  async signIn(email, password) {
    const users = LawAIApp.StorageEngine.get(this._usersKey, []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    this._currentUser = { ...user, password: undefined };
    LawAIApp.StorageEngine.set(this._sessionKey, this._currentUser);
    LawAIApp.EventBus.emit('UserLoggedIn', this._currentUser);
    return { success: true, user: this._currentUser };
  },

  // 登出
  signOut() {
    this._currentUser = null;
    LawAIApp.StorageEngine.remove(this._sessionKey);
    LawAIApp.EventBus.emit('UserLoggedOut');
  },

  // 获取当前会话用户
  getCurrentUser() {
    if (!this._currentUser) {
      this._currentUser = LawAIApp.StorageEngine.get(this._sessionKey, null);
    }
    return this._currentUser;
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!this.getCurrentUser();
  }
};
