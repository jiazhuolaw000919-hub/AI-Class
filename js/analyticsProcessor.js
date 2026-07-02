// analyticsProcessor.js
LawAIApp.AnalyticsProcessor = (function() {
  function processAll() {
    const metrics = LawAIApp.AnalyticsStorage.getMetrics();
    const counters = LawAIApp.AnalyticsStorage.getCounters();
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const identity = LawAIApp.IdentityEngine.getProfile();
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();

    // 学习指标
    metrics.learning = {
      totalLessonsCompleted: counters.totalLessonsCompleted,
      completionRate: progress.completionPercent,
      totalXP: progress.xp,
      currentLevel: levelInfo.level,
      averageSessionDuration: counters.totalSessions > 0 ? Math.round(counters.totalTimeSpent / counters.totalSessions) : 0
    };

    // 行为指标
    metrics.behavior = {
      totalSessions: counters.totalSessions,
      totalBookmarks: counters.totalBookmarks,
      totalFavorites: counters.totalFavorites,
      favoriteCategory: getMostFrequentCategory() || 'N/A'
    };

    // 知识指标
    metrics.knowledge = {
      knowledgeScore: identity.knowledgeScore,
      knowledgeRank: identity.knowledgeRank,
      consistencyScore: identity.consistencyScore
    };

    // 一致性指标
    metrics.consistency = {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak
    };

    LawAIApp.AnalyticsStorage.saveMetrics(metrics);
    LawAIApp.AnalyticsEvents.emitMetricsUpdated(metrics);
    LawAIApp.AnalyticsEvents.emitKnowledgeScoreUpdated(metrics.knowledge.knowledgeScore);
  }

  // 辅助：计算最常学习的类别（基于最近事件）
  function getMostFrequentCategory() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const categoryCount = {};
    log.filter(e => e.eventType === 'LessonCompleted').forEach(e => {
      const cat = e.payload?.category || 'Unknown';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const sorted = Object.entries(categoryCount).sort((a,b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }

  return { processAll };
})();
