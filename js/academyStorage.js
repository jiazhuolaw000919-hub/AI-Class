// academyStorage.js
LawAIApp.AcademyStorage = {
  // 获取当前激活的 Academy ID（默认 ai）
  getActiveAcademyId() {
    return LawAIApp.StorageEngine.get('activeAcademyId', 'ai');
  },

  // 设置当前 Academy
  setActiveAcademy(id) {
    LawAIApp.StorageEngine.set('activeAcademyId', id);
  },

  // 获取当前 Academy 的完整对象（含实时进度）
  getCurrentAcademy() {
    const id = this.getActiveAcademyId();
    const academy = LawAIApp.AcademyData.getAcademyById(id);
    if (!academy) return null;

    // 仅 active 状态的 Academy 才读取实际进度
    if (academy.status === 'active') {
      const progress = LawAIApp.ProgressEngine.getProgress();
      return {
        ...academy,
        completedLessons: progress.completedLessons.length,
        progressPercent: progress.completionPercent,
        currentLesson: progress.currentLesson,
        xp: progress.xp
      };
    }
    // 其他状态返回原始数据，无进度
    return { ...academy, completedLessons: 0, progressPercent: 0, currentLesson: 0, xp: 0 };
  },

  // 检查某个 Academy 是否被收藏（目前所有 Academy 均未收藏，可扩展）
  isFavorite(academyId) {
    const favs = LawAIApp.StorageEngine.get('favoriteAcademies', []);
    return favs.includes(academyId);
  },

  toggleFavorite(academyId) {
    const favs = LawAIApp.StorageEngine.get('favoriteAcademies', []);
    const idx = favs.indexOf(academyId);
    if (idx === -1) favs.push(academyId);
    else favs.splice(idx, 1);
    LawAIApp.StorageEngine.set('favoriteAcademies', favs);
  }
};
