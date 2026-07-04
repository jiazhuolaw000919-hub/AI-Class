// goalForecast.js
LawAIApp.GoalForecast = {
  predictCompletion(goal) {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const remaining = 365 - progress.completedLessons.length;
    const velocity = LawAIApp.GoalAnalytics.getDailyVelocity();
    if (velocity <= 0) return { date: null, daysNeeded: Infinity };
    const daysNeeded = Math.ceil(remaining / velocity);
    const completionDate = new Date(Date.now() + daysNeeded * 86400000);
    return {
      date: completionDate.toISOString().split('T')[0],
      daysNeeded
    };
  },

  getAlerts(goal) {
    const risk = LawAIApp.GoalAnalytics.assessRisk(goal);
    const alerts = [];
    if (risk === 'high') alerts.push({ level: 'danger', message: 'You are behind schedule. Increase daily lessons or adjust your deadline.' });
    if (risk === 'overdue') alerts.push({ level: 'danger', message: 'Deadline passed! Consider resetting your goal.' });
    return alerts;
  }
};
