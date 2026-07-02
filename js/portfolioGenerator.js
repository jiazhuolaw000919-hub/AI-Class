// portfolioGenerator.js
LawAIApp.PortfolioGenerator = {
  // 知识分布（基于已完成课程类别）
  getDistribution() {
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completed = LawAIApp.ProgressEngine.getProgress().completedLessons;
    const catCount = {};
    completed.forEach(id => {
      const lesson = allLessons.find(l => l.lessonId === id);
      if (lesson) {
        const cat = lesson.category;
        catCount[cat] = (catCount[cat] || 0) + 1;
      }
    });
    const total = completed.length || 1;
    const distribution = {};
    Object.keys(catCount).forEach(cat => {
      distribution[cat] = Math.round((catCount[cat] / total) * 100);
    });
    return distribution;
  },

  // 知识雷达（简化数值）
  getRadar() {
    const distribution = this.getDistribution();
    // 返回各维度 0-100 的值
    return {
      AI: distribution['Foundation'] || 0,
      Prompt: distribution['Prompt Engineering'] || 0,
      Coding: distribution['Coding'] || 0,
      Business: distribution['Business'] || 0,
      Health: distribution['Health AI'] || 0
    };
  },

  // 学习 DNA 类型
  getLearningDNA() {
    const metrics = LawAIApp.AnalyticsEngine.getMetrics();
    const completed = metrics.learning?.totalLessonsCompleted || 0;
    const streak = metrics.consistency?.currentStreak || 0;
    if (completed > 50 && streak > 30) return 'Master Reviewer';
    if (completed > 50) return 'Deep Learner';
    if (streak > 14) return 'Consistent Learner';
    return 'Explorer';
  }
};
