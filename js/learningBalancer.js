// learningBalancer.js
LawAIApp.LearningBalancer = {
  // 计算当前学习活动的平衡度（0-100）
  calculateBalance() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const weekAgo = Date.now() - 7 * 86400000;
    const weekEvents = log.filter(e => new Date(e.timestamp).getTime() > weekAgo);

    const counts = {
      lesson: weekEvents.filter(e => e.eventType === 'LessonCompleted').length,
      practice: weekEvents.filter(e => e.eventType === 'PracticeCompleted').length,
      project: weekEvents.filter(e => e.eventType === 'ProjectFinished').length,
      review: weekEvents.filter(e => e.eventType === 'RecallCompleted').length,
      reflection: weekEvents.filter(e => e.eventType === 'ReflectionGenerated').length
    };

    const total = Object.values(counts).reduce((a,b) => a+b, 0) || 1;
    const ideal = {
      lesson: 0.4,
      practice: 0.25,
      project: 0.15,
      review: 0.15,
      reflection: 0.05
    };

    let balanceScore = 0;
    Object.keys(ideal).forEach(k => {
      const actual = counts[k] / total;
      const diff = Math.abs(ideal[k] - actual);
      balanceScore += (1 - diff) * ideal[k] * 100;
    });

    return Math.round(balanceScore);
  },

  // 建议当前最需要增加的活动类型
  suggestActivity() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const weekAgo = Date.now() - 7 * 86400000;
    const recent = log.filter(e => new Date(e.timestamp).getTime() > weekAgo);

    if (!recent.some(e => e.eventType === 'LessonCompleted')) return 'lesson';
    if (!recent.some(e => e.eventType === 'PracticeCompleted')) return 'practice';
    if (!recent.some(e => e.eventType === 'RecallCompleted')) return 'review';
    return 'balanced';
  }
};
