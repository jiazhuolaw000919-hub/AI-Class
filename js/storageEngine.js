// storageEngine.js
// 统一 LocalStorage 操作，方便未来切换为 Supabase 或 IndexedDB

// ============================================================
// 🛡️ 保险杠：确保 LawAIApp 全局对象存在（防止加载顺序报错）
// ============================================================
window.LawAIApp = window.LawAIApp || {};

LawAIApp.StorageEngine = {
  prefix: 'lawai_',

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  // 批量获取所有以某个前缀开头的键（用于收藏等）
  getAllKeys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => k.slice(this.prefix.length));
  }
};
