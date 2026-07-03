// learningAnalytics.js
LawAIApp.LearningAnalytics = {
  // 学习速度（每周完成课程数）
  getLearningSpeed() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const weekAgo = Date.now() - 7 * 86400000;
    const completed = log.filter(e => e.eventType === 'LessonCompleted' && new Date(e.timestamp).getTime() > weekAgo);
    return completed.length;
  },

  // 知识保留率（基于记忆强度）
  getRetentionRate() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const strengths = Object.values(allMemory).map(m => m.strength);
    if (strengths.length === 0) return 100;
    const avg = strengths.reduce((a,b) => a + b, 0) / strengths.length;
    return Math.round(avg);
  },

  // 完成趋势（最近一周 vs 前一周）
  getCompletionTrend() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const now = Date.now();
    const thisWeek = log.filter(e => e.eventType === 'LessonCompleted' && (now - new Date(e.timestamp).getTime()) < 7*86400000).length;
    const lastWeek = log.filter(e => e.eventType === 'LessonCompleted' && (now - new Date(e.timestamp).getTime()) >= 7*86400000 && (now - new Date(e.timestamp).getTime()) < 14*86400000).length;
    return { thisWeek, lastWeek, trend: thisWeek >= lastWeek ? 'up' : 'down' };
  },

  // 技能成长（整体掌握度）
  getSkillGrowth() {
    const skills = LawAIApp.SkillTracker.getAllSkills();
    if (skills.length === 0) return 0;
    return Math.round(skills.reduce((sum,s) => sum + s.mastery, 0) / skills.length);
  },

  // 练习频率（每周练习次数）
  getPracticeFrequency() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const weekAgo = Date.now() - 7 * 86400000;
    return log.filter(e => e.eventType === 'PracticeCompleted' && new Date(e.timestamp).getTime() > weekAgo).length;
  }
};
