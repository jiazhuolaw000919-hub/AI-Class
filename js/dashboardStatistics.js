// dashboardStatistics.js
// Part 162: Read-Only Statistics Aggregator

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DashboardStatistics = {
  
  // 🔥 Part 162: 标记为只读消费者
  _readOnly: true,
  _version: '1.0.0',

  /**
   * 获取统计快照 — 只读，不写任何存储
   * 所有数据来自 Domain Authorities
   */
  getSnapshot: function() {
    var result = {
      _source: 'read-only-aggregator',
      _timestamp: new Date().toISOString(),
      level: 1,
      currentXP: 0,
      nextLevelXP: 100,
      totalXP: 0,
      knowledgeScore: 0,
      consistencyScore: 0,
      learningHealth: 0,
      completedLessons: 0,
      totalLessons: 0,
      completionPercent: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      learningDNA: null
    };

    try {
      // 只读：从各个 Engine 读取
      if (window.LawAIApp?.LevelEngine?.calculateLevel) {
        var levelInfo = window.LawAIApp.LevelEngine.calculateLevel();
        result.level = levelInfo.level || 1;
        result.currentXP = levelInfo.currentLevelXP || 0;
        result.nextLevelXP = levelInfo.nextLevelXP || 100;
      }

      if (window.LawAIApp?.XPEngine?.getCurrentXP) {
        result.totalXP = window.LawAIApp.XPEngine.getCurrentXP() || 0;
      }

      if (window.LawAIApp?.IdentityEngine?.getProfile) {
        var identity = window.LawAIApp.IdentityEngine.getProfile();
        result.knowledgeScore = identity?.knowledgeScore || 0;
        result.consistencyScore = identity?.consistencyScore || 0;
      }

      if (window.LawAIApp?.HealthScore?.calculate) {
        result.learningHealth = window.LawAIApp.HealthScore.calculate() || 0;
      }

      if (window.LawAIApp?.ProgressEngine?.getProgress) {
        var progress = window.LawAIApp.ProgressEngine.getProgress();
        result.completedLessons = progress?.completedLessons?.length || 0;
        result.totalLessons = progress?.totalLessons || 0;
        result.completionPercent = progress?.completionPercent || 0;
      }

      if (window.LawAIApp?.StreakEngine?.getStreakData) {
        var streak = window.LawAIApp.StreakEngine.getStreakData();
        result.currentStreak = streak?.currentStreak || 0;
        result.longestStreak = streak?.longestStreak || 0;
      }

      if (window.LawAIApp?.AnalyticsEngine?.getMetrics) {
        var metrics = window.LawAIApp.AnalyticsEngine.getMetrics();
        result.totalSessions = metrics?.behavior?.totalSessions || 0;
      }

      if (window.LawAIApp?.PortfolioGenerator?.getLearningDNA) {
        result.learningDNA = window.LawAIApp.PortfolioGenerator.getLearningDNA();
      }
    } catch (e) {
      console.warn('[DashboardStatistics] Read error:', e);
    }

    return result;
  },

  /**
   * 验证状态 (只读检查)
   */
  validate: function() {
    return {
      readOnly: true,
      writesToStore: false,
      mutatesState: false,
      version: this._version
    };
  }
};

console.log('[DashboardStatistics] Read-only module loaded (Part 162)');
