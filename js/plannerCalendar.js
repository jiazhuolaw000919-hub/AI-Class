// plannerCalendar.js
LawAIApp.PlannerCalendar = {
  // 获取未来 N 天的简要计划（基于复习和进度预测）
  getUpcomingSummary(days = 7) {
    const upcomingReviews = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.getUpcomingReviews(days) : [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const dailyLessons = []; // 简单假设每天完成1课
    const remainingLessons = 365 - progress.completedLessons.length;
    const lessonsPerDay = remainingLessons > 0 ? Math.ceil(remainingLessons / 30) : 0; // 估计每天完成量
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const reviewsOnDay = upcomingReviews.filter(r => r.date.startsWith(dateStr)).length;
      dailyLessons.push({
        date: dateStr,
        reviews: reviewsOnDay,
        newLessons: i < 7 ? lessonsPerDay : 0
      });
    }
    return dailyLessons;
  }
};
