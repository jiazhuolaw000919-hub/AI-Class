// versionHistory.js
LawAIApp.VersionHistory = {
  _key: 'content_versions',
  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, {});
  },
  _save(store) { LawAIApp.StorageEngine.set(this._key, store); },

  // 记录一次版本变更
  record(contentId, fromVersion, toVersion, changeType, summary, breakingChange = false) {
    const store = this._getAll();
    if (!store[contentId]) store[contentId] = [];
    const entry = {
      evolutionId: `evo_${contentId}_${Date.now()}`,
      contentId,
      fromVersion,
      toVersion,
      changeType,
      summary,
      breakingChange,
      publishedAt: new Date().toISOString()
    };
    store[contentId].push(entry);
    this._save(store);
    LawAIApp.EventBus.emit('EvolutionRecorded', entry);
    return entry;
  },

  // 获取某个内容的所有版本历史
  getHistory(contentId) {
    const store = this._getAll();
    return store[contentId] || [];
  }
};
