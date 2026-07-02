// searchEngine.js
LawAIApp.SearchEngine = {
  // 基本搜索（可按标题、类别、标签、天数、难度）
  search(query, filters = {}) {
    const all = LawAIApp.LessonEngine.getAllLessons();
    let results = all;

    // 文本搜索（标题、标签）
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.tags.some(t => t.includes(q)) ||
        l.category.toLowerCase().includes(q) ||
        `day ${l.day}`.includes(q)
      );
    }

    // 过滤器
    if (filters.category) {
      results = results.filter(l => l.category === filters.category);
    }
    if (filters.difficulty) {
      results = results.filter(l => l.difficulty === filters.difficulty);
    }
    if (filters.status === 'completed') {
      const prog = LawAIApp.ProgressEngine.getProgress();
      results = results.filter(l => prog.completedLessons.includes(l.lessonId));
    } else if (filters.status === 'incomplete') {
      const prog = LawAIApp.ProgressEngine.getProgress();
      results = results.filter(l => !prog.completedLessons.includes(l.lessonId));
    }
    if (filters.favorite) {
      const favorites = LawAIApp.StorageEngine.get('favorites', []);
      results = results.filter(l => favorites.includes(l.lessonId));
    }

    return results;
  },

  // 收藏/取消收藏
  toggleFavorite(lessonId) {
    const favorites = LawAIApp.StorageEngine.get('favorites', []);
    const idx = favorites.indexOf(lessonId);
    if (idx === -1) favorites.push(lessonId);
    else favorites.splice(idx, 1);
    LawAIApp.StorageEngine.set('favorites', favorites);
    return favorites;
  },

  isFavorite(lessonId) {
    const favorites = LawAIApp.StorageEngine.get('favorites', []);
    return favorites.includes(lessonId);
  }
};
