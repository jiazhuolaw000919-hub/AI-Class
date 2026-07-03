// lpsRegistry.js
LawAIApp.LPSRegistry = {
  _key: 'installed_learning_packs',
  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, []);
  },
  _save(list) { LawAIApp.StorageEngine.set(this._key, list); },

  // 注册一个已安装的学习包
  register(manifest) {
    const list = this._getAll();
    const existing = list.findIndex(p => p.packId === manifest.packId);
    const now = new Date().toISOString();
    if (existing !== -1) {
      list[existing] = { ...manifest, installedAt: list[existing].installedAt || now, updatedAt: now };
    } else {
      list.push({ ...manifest, installedAt: now, updatedAt: now });
    }
    this._save(list);
    LawAIApp.EventBus.emit('PackRegistered', { packId: manifest.packId });
    return true;
  },

  // 获取已安装包列表
  getInstalledPacks() {
    return this._getAll();
  },

  // 检查是否已安装
  isInstalled(packId) {
    return this._getAll().some(p => p.packId === packId);
  },

  // 卸载包
  uninstall(packId) {
    const list = this._getAll().filter(p => p.packId !== packId);
    this._save(list);
    LawAIApp.EventBus.emit('PackUninstalled', { packId });
  }
};
