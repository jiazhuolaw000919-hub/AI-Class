// conversationContext.js
LawAIApp.ConversationContext = {
  gather() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const health = LawAIApp.IntelligenceHealth.calculate();
    const memory = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    const profile = LawAIApp.MentorProfile.get();
    const goals = LawAIApp.GoalEngine ? LawAIApp.GoalEngine.getActiveGoals() : [];
    const activeProjects = LawAIApp.ProjectTracker ? LawAIApp.ProjectTracker.getActiveProjects() : [];
    const todayFocus = LawAIApp.DailyFocusEngine.getTodayFocus();
    const currentLesson = LawAIApp.LessonEngine.getLessonByDay(progress.currentLesson);
    const recentQuiz = LawAIApp.StorageEngine.get('last_quiz_result', null);

    return {
      currentLesson: currentLesson ? currentLesson.title : 'None',
      completionPercent: progress.completionPercent,
      streak: LawAIApp.StreakEngine.getStreakData().currentStreak,
      health,
      memory,
      weakTopics: profile.knowledgeGaps || [],
      strongTopics: profile.strongSkills || [],
      activeProjects: activeProjects.map(p => p.title),
      goals: goals.map(g => g.title),
      todayFocus: todayFocus.title,
      recentQuizScore: recentQuiz ? recentQuiz.score : null
    };
  }
};
