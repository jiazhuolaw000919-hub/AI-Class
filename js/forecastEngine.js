// forecastEngine.js
LawAIApp.ForecastEngine = {
  // 预测完成全部课程日期
  predictCompletion() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const remaining = 365 - progress.completedLessons.length;
    const velocity = LawAIApp.GoalAnalytics ? LawAIApp.GoalAnalytics.getDailyVelocity() : 0.5;
    if (velocity <= 0) return { date: 'N/A', daysNeeded: Infinity };
    const daysNeeded = Math.ceil(remaining / velocity);
    const completionDate = new Date(Date.now() + daysNeeded * 86400000);
    return {
      date: completionDate.toISOString().split('T')[0],
      daysNeeded
    };
  },

  // 预测记忆保留率（基于当前记忆健康度和遗忘曲线）
  predictMemoryRetention(daysAhead = 30) {
    const health = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.calculateMemoryHealth() : 100;
    // 简单线性衰减模拟
    const predicted = Math.max(0, health - daysAhead * 1.5);
    return Math.round(predicted);
  },

  // 预测XP增长（假设保持当前速度）
  predictXPGrowth(daysAhead = 30) {
    const xpHistory = LawAIApp.XPHistory.getHistory();
    if (xpHistory.length === 0) return { current: 0, predicted: 0 };
    const recent = xpHistory.filter(e => new Date(e.timestamp) > Date.now() - 7 * 86400000);
    const totalXP = recent.reduce((sum, e) => sum + e.finalXP, 0);
    const dailyAvg = recent.length > 0 ? totalXP / 7 : 0;
    const currentXP = LawAIApp.XPEngine.getCurrentXP();
    return {
      current: currentXP,
      predicted: currentXP + Math.round(dailyAvg * daysAhead)
    };
  },

  // 目标成功概率（基于风险）
  predictGoalSuccess() {
    const goals = LawAIApp.GoalEngine ? LawAIApp.GoalEngine.getActiveGoals() : [];
    if (goals.length === 0) return 100;
    const risk = LawAIApp.GoalAnalytics ? LawAIApp.GoalAnalytics.assessRisk(goals[0]) : 'low';
    const riskMap = { low: 95, medium: 70, high: 40, overdue: 10 };
    return riskMap[risk] || 50;
  },

  // 获取所有预测数据
  getAllPredictions() {
    return {
      completion: this.predictCompletion(),
      memory: this.predictMemoryRetention(),
      xp: this.predictXPGrowth(),
      goalSuccess: this.predictGoalSuccess()
    };
  }
};
