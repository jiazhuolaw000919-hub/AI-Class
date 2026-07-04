// goalAnalytics.js
LawAIApp.GoalAnalytics = {
  getDailyVelocity() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const lessonsCompleted = log.filter(e => e.eventType === 'LessonCompleted' && new Date(e.timestamp).getTime() > weekAgo).length;
    return lessonsCompleted / 7;
  },

  getGoalProgress(goal) {
    if (!goal) return 0;
    const progress = LawAIApp.ProgressEngine.getProgress();
    return progress.completedLessons.length / 365 * 100;
  },

  getRemainingHours(goal) {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const remainingLessons = 365 - progress.completedLessons.length;
    return Math.ceil(remainingLessons * 0.15);
  },

  assessRisk(goal) {
    if (!goal || !goal.deadline) return 'low';
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const daysLeft = Math.ceil((deadline - now) / 86400000);
    const remainingLessons = 365 - LawAIApp.ProgressEngine.getProgress().completedLessons.length;
    const velocity = this.getDailyVelocity();

    if (daysLeft <= 0) return 'overdue';
    const requiredVelocity = remainingLessons / daysLeft;
    if (requiredVelocity > velocity * 2) return 'high';
    if (requiredVelocity > velocity) return 'medium';
    return 'low';
  }
};
