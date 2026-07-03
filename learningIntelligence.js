// learningIntelligence.js
LawAIApp.LearningIntelligence = (function() {
  // 构建学习档案
  function buildProfile() {
    const identity = LawAIApp.IdentityEngine.getProfile();
    const rhythm = LawAIApp.StorageEngine.get('learning_rhythm', {});
    const bestTime = LawAIApp.PatternDetector.detectBestStudyTime();
    const efficiency = LawAIApp.PatternDetector.getEfficiency();

    return {
      profileId: identity.displayName,
      learningStyle: identity.learningStyle,
      focusDuration: rhythm.avgSessionLength || 15,
      bestLearningTime: bestTime,
      preferredDifficulty: identity.favoriteAcademy === 'academy_ai' ? 'Intermediate' : 'Beginner',
      memoryRetention: LawAIApp.LearningAnalytics.getRetentionRate(),
      practicePreference: LawAIApp.LearningAnalytics.getPracticeFrequency() > 2 ? 'high' : 'low',
      averageSession: rhythm.avgSessionLength || 15,
      efficiency
    };
  }

  // 定时更新学习健康并发布洞察
  function updateHealthAndInsights() {
    const health = LawAIApp.LearningHealth.getOverallHealth();
    LawAIApp.StorageEngine.set('learning_health', health);
    LawAIApp.EventBus.emit('HealthUpdated', health);

    // AI 洞察生成
    const insights = [];
    if (health.overall < 40) insights.push('Consider reducing daily load to avoid burnout.');
    else if (health.overall > 80) insights.push('Great learning health! Keep up the consistency.');

    const weak = LawAIApp.PatternDetector.getWeakSubjects();
    if (weak.length > 0) insights.push(`Focus on improving: ${weak.join(', ')}.`);

    const risks = LawAIApp.PredictionEngine.detectRisks();
    insights.push(...risks.map(r => `Risk detected: ${r}`));

    LawAIApp.StorageEngine.set('ai_insights', insights);
    LawAIApp.EventBus.emit('InsightGenerated', { insights });
  }

  // 事件监听
  LawAIApp.EventBus.on('LessonCompleted', () => {
    updateHealthAndInsights();
  });
  LawAIApp.EventBus.on('PracticeCompleted', () => {
    updateHealthAndInsights();
  });
  LawAIApp.EventBus.on('ProjectFinished', () => {
    updateHealthAndInsights();
  });

  // 初始构建
  buildProfile();

  return {
    getProfile: buildProfile,
    getHealth: () => LawAIApp.StorageEngine.get('learning_health', {}),
    getPredictions: () => ({
      completion: LawAIApp.PredictionEngine.predictCompletionDate(),
      nextLevel: LawAIApp.PredictionEngine.predictNextLevel()
    }),
    getInsights: () => LawAIApp.StorageEngine.get('ai_insights', [])
  };
})();
