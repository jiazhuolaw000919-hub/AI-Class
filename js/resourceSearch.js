// resourceSearch.js
LawAIApp.ResourceSearch = {
  search(query, filters = {}) {
    const all = LawAIApp.ResourceRegistry.getAll();
    let results = all;

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        (r.keywords && r.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    if (filters.provider) results = results.filter(r => r.provider === filters.provider);
    if (filters.type) results = results.filter(r => r.type === filters.type);
    if (filters.difficulty) results = results.filter(r => r.difficulty === filters.difficulty);
    if (filters.language) results = results.filter(r => r.language === filters.language);
    if (filters.quality) results = results.filter(r => r.qualityScore === filters.quality);
    if (filters.lessonId) results = results.filter(r => r.lessonId === filters.lessonId);

    // 按质量排序
    return LawAIApp.ResourceRanker.rank(results);
  },

  // 为课程推荐最佳资源（AI 策展）
  recommendForLesson(lessonId) {
    const resources = LawAIApp.ResourceRegistry.getAll(lessonId);
    const best = LawAIApp.ResourceRanker.getBest(lessonId);
    return {
      best,
      alternatives: resources.filter(r => r.resourceId !== best?.resourceId).slice(0, 3)
    };
  }
};
