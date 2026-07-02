// memoryTracker.js
LawAIApp.MemoryTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('memory_tracker', {});
  },
  _save(store) { LawAIApp.StorageEngine.set('memory_tracker', store); },

  // 获取或初始化某个知识点的记忆数据
  getOrCreate(lessonId) {
    const store = this._getStore();
    if (!store[lessonId]) {
      store[lessonId] = {
        lessonId,
        strength: 50,            // 初始强度
        lastStudied: null,
        lastReview: null,
        reviewCount: 0,
        state: 'learning',       // forgotten, weak, learning, stable, strong, mastered
        nextReviewDate: null
      };
      this._save(store);
    }
    return store[lessonId];
  },

  // 更新记忆强度（根据遗忘曲线和最近操作）
  updateStrength(lessonId, newStrength, newState = null) {
    const store = this._getStore();
    if (!store[lessonId]) return;
    store[lessonId].strength = Math.min(100, Math.max(0, newStrength));
    if (newState) store[lessonId].state = newState;
    store[lessonId].lastStudied = new Date().toISOString();
    this._save(store);
  },

  // 记录复习完成
  recordReview(lessonId) {
    const store = this._getStore();
    if (!store[lessonId]) this.getOrCreate(lessonId);
    store[lessonId].lastReview = new Date().toISOString();
    store[lessonId].reviewCount += 1;
    this._save(store);
  },

  // 获取所有记忆数据
  getAll() {
    return this._getStore();
  }
};
