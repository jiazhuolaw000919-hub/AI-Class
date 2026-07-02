// analyticsEngine.js
LawAIApp.AnalyticsEngine = {
  // 获取最新指标
  getMetrics() {
    return LawAIApp.AnalyticsStorage.getMetrics();
  },

  // 强制刷新处理
  refresh() {
    LawAIApp.AnalyticsProcessor.processAll();
  },

  // 获取原始事件日志（调试用）
  getEventLog(limit = 20) {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    return log.slice(-limit).reverse();
  },

  // 获取知识分数
  getKnowledgeScore() {
    return this.getMetrics().knowledge.knowledgeScore || 0;
  },

  // 获取一致性分数
  getConsistencyScore() {
    return this.getMetrics().consistency.currentStreak || 0;
  }
};
