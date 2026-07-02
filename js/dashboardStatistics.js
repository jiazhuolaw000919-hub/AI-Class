// dashboardStatistics.js
LawAIApp.DashboardStatistics = {
  getSnapshot() {
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();
    const xp = LawAIApp.XPEngine.getCurrentXP();
    const identity = LawAIApp.IdentityEngine.getProfile();
    const health = LawAIApp.HealthScore.calculate();
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const analytics = LawAIApp.AnalyticsEngine.getMetrics();

    return {
      level: levelInfo.level,
      currentXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      totalXP: xp,
      knowledgeScore: identity.knowledgeScore,
      consistencyScore: identity.consistencyScore,
      learningHealth: health,
      completedLessons: progress.completedLessons.length,
      totalLessons: progress.totalLessons,
      completionPercent: progress.completionPercent,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalSessions: analytics.behavior?.totalSessions || 0,
      learningDNA: LawAIApp.PortfolioGenerator.getLearningDNA()
    };
  }
};
