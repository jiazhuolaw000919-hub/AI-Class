// analyticsStorage.js
LawAIApp.AnalyticsStorage = {
  // 原始事件日志
  getEventLog() {
    return LawAIApp.StorageEngine.get('analytics_event_log', []);
  },
  appendEventLog(entry) {
    const log = this.getEventLog();
    log.push(entry);
    // 保留最近 1000 条
    if (log.length > 1000) log.splice(0, log.length - 1000);
    LawAIApp.StorageEngine.set('analytics_event_log', log);
  },

  // 指标缓存
  getMetrics() {
    return LawAIApp.StorageEngine.get('analytics_metrics', {
      learning: {},
      behavior: {},
      knowledge: {},
      consistency: {},
      lastUpdated: null
    });
  },
  saveMetrics(metrics) {
    metrics.lastUpdated = new Date().toISOString();
    LawAIApp.StorageEngine.set('analytics_metrics', metrics);
  },

  // 原始计数器（用于高效累加）
  getCounters() {
    return LawAIApp.StorageEngine.get('analytics_counters', {
      totalSessions: 0,
      totalLessonsCompleted: 0,
      totalQuizzesTaken: 0,
      totalPracticeCompleted: 0,
      totalBookmarks: 0,
      totalFavorites: 0,
      totalTimeSpent: 0 // 秒
    });
  },
  saveCounters(counters) {
    LawAIApp.StorageEngine.set('analytics_counters', counters);
  }
};
