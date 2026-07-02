// moduleStorage.js
LawAIApp.ModuleStorage = {
  _getAll() {
    let list = LawAIApp.StorageEngine.get('module_list');
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = JSON.parse(JSON.stringify(LawAIApp.ModuleData.modules));
      LawAIApp.StorageEngine.set('module_list', list);
    }
    list.forEach(m => {
      m.createdAt = m.createdAt || new Date().toISOString();
      m.updatedAt = m.updatedAt || new Date().toISOString();
    });
    return list;
  },

  _saveAll(list) {
    LawAIApp.StorageEngine.set('module_list', list);
  },

  // 获取启用的已发布模块
  getActiveModules() {
    return this._getAll().filter(m => m.status === 'published' && m.enabled);
  },

  // 搜索
  search(query) {
    const q = query.toLowerCase();
    return this._getAll().filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q)) ||
      m.learningObjectives.some(o => o.toLowerCase().includes(q)) ||
      m.skillsEarned.some(s => s.toLowerCase().includes(q))
    );
  },

  // 收藏
  toggleFavorite(moduleId) {
    let favs = LawAIApp.StorageEngine.get('favorite_modules', []);
    const idx = favs.indexOf(moduleId);
    if (idx === -1) favs.push(moduleId);
    else favs.splice(idx, 1);
    LawAIApp.StorageEngine.set('favorite_modules', favs);
    const list = this._getAll();
    const mod = list.find(m => m.id === moduleId);
    if (mod) {
      mod.favorite = idx === -1;
      this._saveAll(list);
    }
    return favs;
  },

  isFavorite(moduleId) {
    const favs = LawAIApp.StorageEngine.get('favorite_modules', []);
    return favs.includes(moduleId);
  },

  // 书签
  toggleBookmark(moduleId) {
    let bm = LawAIApp.StorageEngine.get('bookmarked_modules', []);
    const idx = bm.indexOf(moduleId);
    if (idx === -1) bm.push(moduleId);
    else bm.splice(idx, 1);
    LawAIApp.StorageEngine.set('bookmarked_modules', bm);
    const list = this._getAll();
    const mod = list.find(m => m.id === moduleId);
    if (mod) {
      mod.bookmark = idx === -1;
      this._saveAll(list);
    }
    return bm;
  },

  isBookmarked(moduleId) {
    const bm = LawAIApp.StorageEngine.get('bookmarked_modules', []);
    return bm.includes(moduleId);
  },

  // 更新进度
  updateProgress(moduleId, progress, completedLessons) {
    const list = this._getAll();
    const mod = list.find(m => m.id === moduleId);
    if (mod) {
      mod.progress = progress;
      mod.completedLessons = completedLessons;
      mod.updatedAt = new Date().toISOString();
      this._saveAll(list);
    }
    // 同时存储到单独的进度对象
    const allProgress = LawAIApp.StorageEngine.get('module_progress', {});
    allProgress[moduleId] = { progress, completedLessons };
    LawAIApp.StorageEngine.set('module_progress', allProgress);
  },

  getProgress(moduleId) {
    const allProgress = LawAIApp.StorageEngine.get('module_progress', {});
    return allProgress[moduleId] || { progress: 0, completedLessons: 0 };
  }
};
