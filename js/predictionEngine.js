// predictionEngine.js
LawAIApp.PredictionEngine = {
  // 预测完成所有课程所需天数
  predictCompletionDate() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const remaining = prog.totalLessons - prog.completedLessons.length;
    const speed = LawAIApp.LearningAnalytics.getLearningSpeed(); // 每周完成数
    if (speed === 0) return { days: Infinity, date: null };
    const days = Math.ceil((remaining / speed) * 7);
    const estimatedDate = new Date(Date.now() + days * 86400000);
    return { days, date: estimatedDate.toISOString() };
  },

  // 预测下一个等级达成时间
  predictNextLevel() {
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();
    const xpToNext = levelInfo.nextLevelXP - levelInfo.currentLevelXP;
    const weeklyXP = LawAIApp.XPHistory.getHistory()
      .filter(e => new Date(e.timestamp).getTime() > Date.now() - 7 * 86400000)
      .reduce((sum, e) => sum + e.finalXP, 0);
    if (weeklyXP === 0) return { days: Infinity, date: null };
    const days = Math.ceil((xpToNext / weeklyXP) * 7);
    const estimatedDate = new Date(Date.now() + days * 86400000);
    return { days, date: estimatedDate.toISOString() };
  },

  // 学习风险检测（懈怠、超负荷）
  detectRisks() {
    const risks = [];
    const trend = LawAIApp.LearningAnalytics.getCompletionTrend();
    if (trend.trend === 'down' && trend.thisWeek < 3) risks.push('Motivation drop');
    const health = LawAIApp.LearningHealth.getOverallHealth();
    if (health.overall < 40) risks.push('Burnout risk');
    return risks;
  }
};
