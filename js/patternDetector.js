// patternDetector.js
LawAIApp.PatternDetector = {
  // 检测最佳学习时间（小时）
  detectBestStudyTime() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const hourCount = {};
    log.filter(e => e.eventType === 'LessonCompleted').forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    const sorted = Object.entries(hourCount).sort((a,b) => b[1]-a[1]);
    return sorted.length > 0 ? parseInt(sorted[0][0]) : null;
  },

  // 弱项学科（记忆强度最低的类别）
  getWeakSubjects() {
    const heatmap = LawAIApp.MemoryHeatmap.getCategoryStrengthMap();
    return Object.entries(heatmap)
      .filter(([cat, data]) => data.level === 'Weak')
      .map(([cat]) => cat);
  },

  // 强项学科
  getStrongSubjects() {
    const heatmap = LawAIApp.MemoryHeatmap.getCategoryStrengthMap();
    return Object.entries(heatmap)
      .filter(([cat, data]) => data.level === 'Strong')
      .map(([cat]) => cat);
  },

  // 学习效率（每小时完成课程数，基于平均会话）
  getEfficiency() {
    const rhythm = LawAIApp.StorageEngine.get('learning_rhythm', {});
    const avgSession = rhythm.avgSessionLength || 15; // 分钟
    const lessonsPerSession = 1; // 简化，一次会话通常完成1课
    return Math.round((lessonsPerSession / (avgSession / 60)) * 100) / 100;
  }
};
