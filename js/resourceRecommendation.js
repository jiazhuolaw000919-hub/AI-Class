// resourceRecommendation.js
LawAIApp.ResourceRecommendation = {
  // 为当前用户生成个性化推荐
  getRecommendations() {
    const recommendations = [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const currentModule = progress.currentStage; // 简化：使用当前阶段
    const quizResult = LawAIApp.StorageEngine.get('last_quiz_result', null);
    const weakTopics = quizResult ? quizResult.weaknesses || [] : [];
    const bookmarks = LawAIApp.StorageEngine.get('resourceBookmarks', []);
    const recentViewed = LawAIApp.StorageEngine.get('recentResources', []);

    // 规则1: 基于当前学习模块推荐
    if (currentModule) {
      const moduleResources = LawAIApp.ResourceLibrary.getByModule(currentModule);
      recommendations.push(...moduleResources.slice(0, 2));
    }

    // 规则2: 基于弱项主题推荐（从测验结果）
    weakTopics.forEach(topic => {
      const related = LawAIApp.ResourceLibrary.library.filter(r => r.category === topic);
      recommendations.push(...related.slice(0, 1));
    });

    // 规则3: 推荐收藏但未完成的资源
    bookmarks.forEach(id => {
      const res = LawAIApp.ResourceLibrary.library.find(r => r.id === id);
      if (res && !recentViewed.includes(id)) recommendations.push(res);
    });

    // 去重
    const unique = [...new Map(recommendations.map(r => [r.id, r])).values()];
    return unique.slice(0, 6);
  },

  // AI导师精选（模拟）
  getAIPicks() {
    // 简单返回两个高级资源
    return LawAIApp.ResourceLibrary.library.filter(r => r.difficulty === 'Advanced').slice(0, 2);
  },

  // 趋势资源（最近添加或热门的，模拟）
  getTrending() {
    return LawAIApp.ResourceLibrary.library.filter(r => r.type === 'video').slice(0, 3);
  }
};
