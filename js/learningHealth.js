// learningHealth.js
LawAIApp.LearningHealth = {
  getOverallHealth() {
    const analytics = LawAIApp.AnalyticsEngine.getMetrics();
    const consistency = LawAIApp.HabitScore.calculate();      // 0-100
    const retention = LawAIApp.LearningAnalytics.getRetentionRate(); // 0-100
    const practice = LawAIApp.LearningAnalytics.getPracticeFrequency();
    const practiceScore = Math.min(100, practice * 20);
    const projectActivity = LawAIApp.ProjectTracker.getActiveProjects().length > 0 ? 20 : 0;
    const skillGrowth = LawAIApp.LearningAnalytics.getSkillGrowth();

    const overall = Math.round((consistency * 0.3 + retention * 0.3 + practiceScore * 0.2 + projectActivity * 0.1 + skillGrowth * 0.1));
    return {
      overall,
      focus: consistency,
      retention,
      practice: practiceScore,
      projects: projectActivity
    };
  }
};
