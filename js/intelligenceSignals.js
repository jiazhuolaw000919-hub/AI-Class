// intelligenceSignals.js
LawAIApp.IntelligenceSignals = {
  // 从分析引擎获取关键指标
  getSignals() {
    const metrics = LawAIApp.AnalyticsEngine.getMetrics();
    const profile = LawAIApp.IdentityEngine.getProfile();
    const memoryHealth = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    const habitScore = LawAIApp.HabitScore?.calculate() || 0;
    return {
      studyTime: metrics.learning?.totalLessonsCompleted ? metrics.learning.totalLessonsCompleted * 8 : 0, // 估算分钟
      completionSpeed: metrics.learning?.completionRate || 0,
      quizAccuracy: metrics.learning?.averageSessionDuration || 0, // 暂时用其他指标代替
      confidence: profile.knowledgeScore,
      practiceAttempts: metrics.behavior?.totalPracticeCompleted || 0,
      reflectionQuality: metrics.knowledge?.consistencyScore || 0,
      knowledgeCapture: metrics.behavior?.totalBookmarks || 0,
      reviewCompletion: memoryHealth,
      consistency: metrics.consistency?.currentStreak || 0
    };
  }
};
