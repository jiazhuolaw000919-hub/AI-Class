// dailyFocusEngine.js
LawAIApp.DailyFocusEngine = {
  getTodayFocus() {
    const todayReviews = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.getTodayReviewList() : [];
    const activeProjects = LawAIApp.ProjectTracker ? LawAIApp.ProjectTracker.getActiveProjects() : [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const currentLesson = LawAIApp.LessonEngine.getLessonByDay(progress.currentLesson);

    if (todayReviews.length > 0) {
      return {
        title: `Review ${todayReviews.length} lesson(s)`,
        description: "Strengthen your memory by reviewing today's scheduled items.",
        estimatedMinutes: todayReviews.length * 5,
        impact: 'high'
      };
    }
    if (activeProjects.length > 0) {
      return {
        title: `Continue your project: "${activeProjects[0].title}"`,
        description: "Make progress on your active project.",
        estimatedMinutes: 15,
        impact: 'high'
      };
    }
    if (currentLesson && !progress.completedLessons.includes(currentLesson.lessonId)) {
      return {
        title: `Complete: ${currentLesson.title}`,
        description: "Keep your learning streak alive.",
        estimatedMinutes: parseInt(currentLesson.duration) || 8,
        impact: 'normal'
      };
    }
    return {
      title: "Explore the Learning Hub",
      description: "Discover new resources and expand your knowledge.",
      estimatedMinutes: 10,
      impact: 'normal'
    };
  }
};
