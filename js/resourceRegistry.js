// resourceRegistry.js
LawAIApp.ResourceRegistry = {
  _getStore() {
    return LawAIApp.StorageEngine.get('resource_list', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('resource_list', list); },

  // 添加资源
  add(resource) {
    const list = this._getStore();
    resource.resourceId = 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
    resource.createdAt = new Date().toISOString();
    resource.updatedAt = new Date().toISOString();
    list.push(resource);
    this._save(list);
    LawAIApp.EventBus.emit('ResourceAdded', { resource });
    return resource;
  },

  // 更新资源
  update(resourceId, updates) {
    const list = this._getStore();
    const idx = list.findIndex(r => r.resourceId === resourceId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    this._save(list);
    LawAIApp.EventBus.emit('ResourceUpdated', { resource: list[idx] });
    return list[idx];
  },

  // 标记废弃
  deprecate(resourceId) {
    this.update(resourceId, { status: 'deprecated' });
    LawAIApp.EventBus.emit('ResourceDeprecated', { resourceId });
  },

  // 获取全部资源（可选按课程过滤）
  getAll(lessonId = null) {
    const list = this._getStore();
    return lessonId ? list.filter(r => r.lessonId === lessonId) : list;
  },

  getById(resourceId) {
    return this._getStore().find(r => r.resourceId === resourceId) || null;
  }
};
