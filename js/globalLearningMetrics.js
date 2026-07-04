LawAIApp.GlobalLearningMetrics = {
  _metrics: { totalUsers: 1, totalCoursesCompleted: 0, totalLessonsLearned: 0, averageEffectiveness: 0, topSkill: null },
  init() {
    this._metrics.totalLessonsLearned = LawAIApp.ProgressEngine.getProgress().completedLessons.length;
    LawAIApp.EventBus.on('LessonCompleted', () => { this._metrics.totalLessonsLearned += 1; });
  },
  getMetrics() { return { ...this._metrics }; }
};
setTimeout(() => LawAIApp.GlobalLearningMetrics.init(), 500);
