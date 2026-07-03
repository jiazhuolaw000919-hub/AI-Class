// adaptiveLearning.js
LawAIApp.AdaptiveLearning = (function() {
  // 每日自动生成计划（第一次启动时）
  function initDailyPlan() {
    if (!LawAIApp.DailyPlanner.getTodaysPlan()) {
      LawAIApp.DailyPlanner.generate();
    }
  }

  // 当学习事件发生时更新计划
  LawAIApp.EventBus.on('LessonCompleted', () => {
    LawAIApp.DailyPlanner.generate();
    LawAIApp.LearningBalancer.calculateBalance();
  });

  LawAIApp.EventBus.on('PracticeCompleted', () => {
    LawAIApp.LearningBalancer.calculateBalance();
  });

  LawAIApp.EventBus.on('ProjectFinished', () => {
    LawAIApp.DailyPlanner.generate();
  });

  // 启动时初始化计划
  initDailyPlan();

  return {
    getDailyPlan: () => LawAIApp.DailyPlanner.getTodaysPlan() || LawAIApp.DailyPlanner.generate(),
    getRecommendations: (limit) => LawAIApp.AdaptiveRecommendation.generate(limit),
    getGapReport: (lessonId) => LawAIApp.GapDetector.getReport(lessonId),
    getBalance: () => LawAIApp.LearningBalancer.calculateBalance(),
    suggestActivity: () => LawAIApp.LearningBalancer.suggestActivity()
  };
})();
