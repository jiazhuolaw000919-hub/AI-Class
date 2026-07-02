// packRegistry.js
LawAIApp.PackRegistry = {
  _key: 'installed_packs',
  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, []);
  },
  _save(list) { LawAIApp.StorageEngine.set(this._key, list); },

  // 注册一个已安装的包
  register(packManifest) {
    const list = this._getAll();
    if (list.find(p => p.packId === packManifest.packId)) return false;
    list.push({ ...packManifest, installedAt: new Date().toISOString(), status: 'active' });
    this._save(list);
    LawAIApp.EventBus.emit('PackInstalled', { packId: packManifest.packId });
    return true;
  },

  // 更新包的元数据
  update(packId, updates) {
    const list = this._getAll();
    const pack = list.find(p => p.packId === packId);
    if (!pack) return false;
    Object.assign(pack, updates, { updatedAt: new Date().toISOString() });
    this._save(list);
    LawAIApp.EventBus.emit('PackUpdated', { packId });
    return true;
  },

  // 移除包
  remove(packId) {
    const list = this._getAll().filter(p => p.packId !== packId);
    this._save(list);
    LawAIApp.EventBus.emit('PackRemoved', { packId });
    return true;
  },

  // 获取所有已安装包
  getInstalled() {
    return this._getAll();
  },

  // 检查包是否已安装
  isInstalled(packId) {
    return this._getAll().some(p => p.packId === packId);
  }
};
