// statisticsEngine.js
LawAIApp.StatisticsEngine = {
  // 获取最新统计摘要（供 UI 使用）
  getDashboardSnapshot() {
    return LawAIApp.DashboardStatistics.getSnapshot();
  },

  // 获取知识分布
  getPortfolio() {
    return LawAIApp.PortfolioGenerator.getDistribution();
  },

  // 获取学习健康度
  getHealth() {
    return LawAIApp.HealthScore.calculate();
  },

  // 生成报告
  getReport(type = 'daily') {
    if (type === 'weekly') return LawAIApp.ReportGenerator.getWeeklySummary();
    return LawAIApp.ReportGenerator.getDailySnapshot();
  },

  // 监听数据变化自动更新缓存（可以在事件总线上注册）
  init() {
    LawAIApp.EventBus.on('AnalyticsUpdated', () => {
      // 可在此处刷新 UI 展示，但我们只负责数据
      LawAIApp.EventBus.emit('StatisticsUpdated', { snapshot: this.getDashboardSnapshot() });
    });
    LawAIApp.EventBus.on('XPUpdated', () => {
      LawAIApp.EventBus.emit('StatisticsUpdated', { snapshot: this.getDashboardSnapshot() });
    });
  }
};

// 自动初始化监听
LawAIApp.StatisticsEngine.init();
