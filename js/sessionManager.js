// ===========================================
// sessionManager.js
// 会话管理器：处理 token 模拟、自动恢复、超时
// ===========================================
LawAIApp.SessionManager = {
  _tokenKey: 'auth_token',
  _expiryKey: 'auth_expiry',

  // 创建模拟 token
  createSession(userId) {
    const token = 'tok_' + userId + '_' + Date.now();
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1天后过期
    LawAIApp.StorageEngine.set(this._tokenKey, token);
    LawAIApp.StorageEngine.set(this._expiryKey, expiry);
    return token;
  },

  // 验证 token 是否有效
  validateSession() {
    const token = LawAIApp.StorageEngine.get(this._tokenKey);
    const expiry = LawAIApp.StorageEngine.get(this._expiryKey);
    if (!token || !expiry || Date.now() > expiry) {
      this.clearSession();
      return false;
    }
    return true;
  },

  // 恢复会话（页面刷新时调用）
  restoreSession() {
    if (this.validateSession()) {
      const user = LawAIApp.AuthService.getCurrentUser();
      if (user) {
        LawAIApp.EventBus.emit('SessionRestored', user);
        return user;
      }
    }
    return null;
  },

  // 清除会话
  clearSession() {
    LawAIApp.StorageEngine.remove(this._tokenKey);
    LawAIApp.StorageEngine.remove(this._expiryKey);
    LawAIApp.AuthService.signOut();
  }
};

// 页面加载时尝试恢复会话
window.addEventListener('load', () => {
  setTimeout(() => LawAIApp.SessionManager.restoreSession(), 1000);
});
