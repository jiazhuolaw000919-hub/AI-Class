// reportGenerator.js
LawAIApp.ReportGenerator = {
  // 每日快照
  getDailySnapshot() {
    const snapshot = LawAIApp.DashboardStatistics.getSnapshot();
    const today = new Date().toLocaleDateString();
    return { date: today, ...snapshot };
  },

  // 每周摘要
  getWeeklySummary() {
    // 使用历史记录分析本周活动（简化：返回最近一周的事件计数）
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const weekAgo = Date.now() - 7 * 86400000;
    const weekEvents = log.filter(e => new Date(e.timestamp).getTime() > weekAgo);
    return {
      lessonsCompleted: weekEvents.filter(e => e.eventType === 'LessonCompleted').length,
      xpGained: weekEvents.filter(e => e.eventType === 'XPAwarded').reduce((sum, e) => sum + (e.payload?.finalXP || 0), 0),
      totalSessions: weekEvents.filter(e => e.eventType === 'LessonStarted').length
    };
  },

  // 获取完整报告（供未来导出）
  getFullReport() {
    return {
      snapshot: LawAIApp.DashboardStatistics.getSnapshot(),
      weekly: this.getWeeklySummary(),
      portfolio: LawAIApp.PortfolioGenerator.getDistribution(),
      dna: LawAIApp.PortfolioGenerator.getLearningDNA(),
      radar: LawAIApp.PortfolioGenerator.getRadar()
    };
  }
};
