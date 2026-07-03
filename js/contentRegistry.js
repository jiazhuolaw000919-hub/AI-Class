// contentRegistry.js
LawAIApp.ContentRegistry = {
  _getStore() {
    return LawAIApp.StorageEngine.get('content_registry', {});
  },
  _save(store) { LawAIApp.StorageEngine.set('content_registry', store); },

  // 注册一个内容条目（如果已存在则更新）
  register(contentObject) {
    const store = this._getStore();
    const id = contentObject.contentId;
    if (!id) return null;
    store[id] = {
      ...contentObject,
      registeredAt: store[id]?.registeredAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this._save(store);
    LawAIApp.EventBus.emit('ContentCreated', { contentId: id });
    return store[id];
  },

  // 获取单个内容条目
  get(contentId) {
    return this._getStore()[contentId] || null;
  },

  // 按类型或学院过滤
  filter({ type, academyId, courseId, status } = {}) {
    const store = this._getStore();
    return Object.values(store).filter(item => {
      if (type && item.type !== type) return false;
      if (academyId && item.academyId !== academyId) return false;
      if (courseId && item.courseId !== courseId) return false;
      if (status && item.status !== status) return false;
      return true;
    });
  },

  // 移除条目（标记为归档而不是删除）
  archive(contentId) {
    const store = this._getStore();
    if (store[contentId]) {
      store[contentId].status = 'archived';
      store[contentId].archivedAt = new Date().toISOString();
      this._save(store);
      LawAIApp.EventBus.emit('ContentArchived', { contentId });
    }
  }
};
