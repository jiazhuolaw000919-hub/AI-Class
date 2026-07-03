// mentorAnalytics.js
LawAIApp.MentorAnalytics = {
  getComprehensiveAnalysis() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const memoryHealth = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    const habitScore = LawAIApp.HabitScore?.calculate() || 50;
    const intelligenceHealth = LawAIApp.IntelligenceHealth?.calculate() || 50;
    const quizResult = LawAIApp.StorageEngine.get('last_quiz_result', {});
    const activeProjects = LawAIApp.ProjectTracker?.getActiveProjects().length || 0;
    const todayReviews = LawAIApp.MemoryScheduler?.getTodayReviewList().length || 0;

    return {
      completionRate: progress.completionPercent,
      memoryHealth,
      habitScore,
      intelligenceHealth,
      quizAccuracy: quizResult.score || 0,
      activeProjects,
      reviewDue: todayReviews,
      weakTopics: quizResult.weaknesses || [],
      strongTopics: quizResult.strengths || []
    };
  }
};
