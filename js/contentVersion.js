// contentVersion.js
LawAIApp.ContentVersion = {
  _getStore() {
    return LawAIApp.StorageEngine.get('content_versions', {});
  },
  _save(store) { LawAIApp.StorageEngine.set('content_versions', store); },

  // 为内容创建新版本
  createVersion(contentId, versionType, changes) {
    const store = this._getStore();
    if (!store[contentId]) store[contentId] = { history: [] };
    const current = LawAIApp.ContentRegistry.get(contentId);
    const major = store[contentId].history.filter(v => v.versionType === 'major').length + 1;
    const minor = store[contentId].history.filter(v => v.versionType === 'minor').length + 1;
    const version = {
      versionId: `${contentId}_v${major}.${minor}`,
      contentId,
      versionType,
      major,
      minor,
      changes,
      snapshot: { ...current }, // 存储当前快照
      createdAt: new Date().toISOString()
    };
    store[contentId].history.push(version);
    if (current) {
      current.version = `${major}.${minor}`;
      LawAIApp.ContentRegistry.register(current);
    }
    this._save(store);
    return version;
  },

  // 获取版本历史
  getHistory(contentId) {
    return this._getStore()[contentId]?.history || [];
  }
};
