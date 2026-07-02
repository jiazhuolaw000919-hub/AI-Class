// recommendationEngine.js
LawAIApp.RecommendationEngine = (function() {
  function generateAndStore() {
    const newRecs = LawAIApp.RecommendationRules.generate();
    // 移除之前过期的活跃推荐（根据expiresAt）
    const active = LawAIApp.RecommendationHistory.getActive().filter(r => {
      if (r.expiresAt && new Date(r.expiresAt) < new Date()) {
        LawAIApp.RecommendationHistory.dismiss(r.recommendationId); // 自动过期
        return false;
      }
      return true;
    });
    const existingIds = active.map(r => r.recommendationId);
    // 添加新推荐（避免重复ID）
    newRecs.forEach(rec => {
      if (!existingIds.includes(rec.recommendationId)) {
        LawAIApp.RecommendationHistory.add(rec);
      }
    });
    // 发射事件
    LawAIApp.EventBus.emit('RecommendationGenerated', {
      active: LawAIApp.RecommendationHistory.getActive()
    });
  }

  // 监听分析更新或进度更新时重新生成推荐
  LawAIApp.EventBus.on('AnalyticsUpdated', generateAndStore);
  LawAIApp.EventBus.on('ProgressUpdated', generateAndStore);
  LawAIApp.EventBus.on('LessonCompleted', generateAndStore);
  LawAIApp.EventBus.on('XPUpdated', generateAndStore);

  // 初始化时生成一次
  generateAndStore();

  return {
    getActiveRecommendations: () => LawAIApp.RecommendationHistory.getActive(),
    accept: (id) => LawAIApp.RecommendationHistory.accept(id),
    dismiss: (id) => LawAIApp.RecommendationHistory.dismiss(id),
    getHistory: () => LawAIApp.RecommendationHistory.getHistory(),
    refresh: generateAndStore
  };
})();
