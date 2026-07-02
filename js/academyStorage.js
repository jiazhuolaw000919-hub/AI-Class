// academyStorage.js
LawAIApp.AcademyStorage = {
  // 初始化/获取完整 academy 列表（从 storage 或默认数据）
  _getAll() {
    let list = LawAIApp.StorageEngine.get('academy_list');
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = LawAIApp.AcademyData.academies.map(a => ({ ...a }));
      LawAIApp.StorageEngine.set('academy_list', list);
    }
    // 确保每个对象都有兼容别名
    list.forEach(a => {
      a.title = a.title || a.name;
      a.totalLessons = a.totalLessons ?? a.estimatedLessons;
    });
    return list;
  },

  _saveAll(list) {
    LawAIApp.StorageEngine.set('academy_list', list);
  },

  // 获取当前选中的 academy ID
  getActiveAcademyId() {
    return LawAIApp.StorageEngine.get('selected_academy', 'academy_ai');
  },

  setActiveAcademy(id) {
    LawAIApp.StorageEngine.set('selected_academy', id);
    // 更新 lastOpened
    const list = this._getAll();
    const academy = list.find(a => a.id === id);
    if (academy) {
      academy.lastOpened = new Date().toISOString();
      LawAIApp.StorageEngine.set('last_opened_academy', id);
      this._saveAll(list);
    }
  },

  // 获取当前 academy 的完整运行时对象（含实时进度）
  getCurrentAcademy() {
    const id = this.getActiveAcademyId();
    const list = this._getAll();
    const base = list.find(a => a.id === id);
    if (!base) return null;
    // 仅 active 状态才读取真实进度
    if (base.status === 'active') {
      const progress = LawAIApp.ProgressEngine.getProgress();
      return {
        ...base,
        completedLessons: progress.completedLessons.length,
        progressPercent: progress.completionPercent,
        currentLesson: progress.currentLesson,
        xp: progress.xp,
        totalLessons: base.totalLessons || base.estimatedLessons,
        title: base.title || base.name
      };
    }
    // 非 active 状态返回基础数据，进度均为 0
    return {
      ...base,
      completedLessons: 0,
      progressPercent: 0,
      currentLesson: 0,
      xp: 0,
      totalLessons: base.totalLessons || base.estimatedLessons,
      title: base.title || base.name
    };
  },

  // 收藏/书签相关
  toggleFavorite(academyId) {
    let favs = LawAIApp.StorageEngine.get('favorite_academies', []);
    const idx = favs.indexOf(academyId);
    if (idx === -1) favs.push(academyId);
    else favs.splice(idx, 1);
    LawAIApp.StorageEngine.set('favorite_academies', favs);
    // 同步更新 academy 对象
    const list = this._getAll();
    const academy = list.find(a => a.id === academyId);
    if (academy) {
      academy.favorite = idx === -1;
      this._saveAll(list);
    }
    return favs;
  },

  isFavorite(academyId) {
    const favs = LawAIApp.StorageEngine.get('favorite_academies', []);
    return favs.includes(academyId);
  },

  toggleBookmark(academyId) {
    let bm = LawAIApp.StorageEngine.get('bookmarked_academies', []);
    const idx = bm.indexOf(academyId);
    if (idx === -1) bm.push(academyId);
    else bm.splice(idx, 1);
    LawAIApp.StorageEngine.set('bookmarked_academies', bm);
    const list = this._getAll();
    const academy = list.find(a => a.id === academyId);
    if (academy) {
      academy.bookmark = idx === -1;
      this._saveAll(list);
    }
    return bm;
  },

  isBookmarked(academyId) {
    const bm = LawAIApp.StorageEngine.get('bookmarked_academies', []);
    return bm.includes(academyId);
  }
};
