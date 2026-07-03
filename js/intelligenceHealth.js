// intelligenceHealth.js
LawAIApp.IntelligenceHealth = {
  calculate() {
    const signals = LawAIApp.IntelligenceSignals.getSignals();
    const profile = LawAIApp.IntelligenceProfile.get();
    const progress = LawAIApp.ProgressEngine.getProgress();
    const quizResult = LawAIApp.StorageEngine.get('last_quiz_result') || {};
    const projectCount = LawAIApp.ProjectTracker?.getActiveProjects().length || 0;

    // 各维度权重
    const knowledgeScore = progress.completionPercent;
    const consistencyScore = signals.consistency * 10;
    const memoryScore = profile.memoryHealth;
    const projectScore = Math.min(100, projectCount * 20);
    const reviewScore = signals.reviewCompletion;
    const confidenceScore = profile.currentSkillLevel * 10;

    const overall = Math.round(
      knowledgeScore * 0.25 +
      consistencyScore * 0.2 +
      memoryScore * 0.2 +
      projectScore * 0.15 +
      reviewScore * 0.1 +
      confidenceScore * 0.1
    );
    return Math.min(100, overall);
  }
};
