// goalIntelligenceEngine.js
LawAIApp.GoalIntelligenceEngine = (function() {
  LawAIApp.EventBus.on('LessonCompleted', () => {
    const goals = LawAIApp.GoalEngine.getActiveGoals();
    goals.forEach(goal => LawAIApp.GoalEngine.updateProgress(goal.goalId, LawAIApp.ProgressEngine.getProgress().completedLessons.length));
  });

  return {
    getEnhancedGoal(goalId) {
      const goal = LawAIApp.GoalEngine.getActiveGoals().find(g => g.goalId === goalId);
      if (!goal) return null;
      const analytics = {
        dailyVelocity: LawAIApp.GoalAnalytics.getDailyVelocity(),
        progress: LawAIApp.GoalAnalytics.getGoalProgress(goal),
        remainingHours: LawAIApp.GoalAnalytics.getRemainingHours(goal),
        risk: LawAIApp.GoalAnalytics.assessRisk(goal)
      };
      const forecast = LawAIApp.GoalForecast.predictCompletion(goal);
      const roadmap = LawAIApp.GoalPlanner.generateRoadmap(goal);
      const actions = LawAIApp.GoalPlanner.generateActionItems(goal);
      const alerts = LawAIApp.GoalForecast.getAlerts(goal);
      return { goal, analytics, forecast, roadmap, actions, alerts };
    },
    createGoal(goalDef) {
      return LawAIApp.GoalEngine.createGoal(goalDef);
    },
    getActiveGoals: () => LawAIApp.GoalEngine.getActiveGoals()
  };
})();
