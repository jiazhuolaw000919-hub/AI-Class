// habitScore.js
LawAIApp.HabitScore = {
  calculate() {
    const habits = LawAIApp.HabitTracker.getWeekHistory();
    const daysActive = habits.filter(d => d.lessonsCompleted > 0).length;
    const consistency = (daysActive / 7) * 40;

    // 复习完成率 (基于今日复习任务)
    const todayReviews = LawAIApp.ReviewQueue.getTodayReviews();
    const today = new Date().toDateString();
    const doneToday = todayReviews.filter(id => {
      const tasks = LawAIApp.ReviewQueue.getLessonReviews(id);
      return tasks.some(t => t.done && new Date(t.date).toDateString() === today);
    }).length;
    const reviewScore = todayReviews.length > 0 ? (doneToday / todayReviews.length) * 20 : 20;

    // 学习频率 (本周课程数)
    const totalLessonsWeek = habits.reduce((sum, d) => sum + d.lessonsCompleted, 0);
    const freqScore = Math.min(totalLessonsWeek, 10) * 2;

    // 反思完成
    const reflections = LawAIApp.AnalyticsStorage.getEventLog()
      .filter(e => e.eventType === 'ReflectionGenerated' && new Date(e.timestamp) > Date.now() - 7 * 86400000).length;
    const reflectionScore = reflections > 0 ? 10 : 0;

    // 目标完成 (本周已完成的每日目标数)
    const goals = LawAIApp.MentorGoals?.getActiveGoals().filter(g => g.type === 'daily' && g.completed) || [];
    const goalScore = goals.length > 0 ? 10 : 0;

    return Math.min(100, Math.round(consistency + reviewScore + freqScore + reflectionScore + goalScore));
  }
};
