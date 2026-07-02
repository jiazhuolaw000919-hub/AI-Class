// calendarEngine.js
LawAIApp.CalendarEngine = {
  // 获取某个月的天数及第一天星期
  getMonthData(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay, year, month };
  },

  // 获取某一天的状态字符串
  getDayStatus(day, month, year, progress) {
    const dateStr = new Date(year, month, day).toDateString();
    const today = new Date().toDateString();
    const lessonId = `day-${day}`;
    const completed = progress.completedLessons.includes(lessonId);

    if (dateStr === today) return 'current';
    if (completed) return 'completed';
    if (day > progress.currentLesson) return 'locked';
    return 'not-started';
  },

  // 获取某天的课程摘要（点击弹出用）
  getDaySummary(day) {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
    if (!lesson) return null;
    const progress = LawAIApp.ProgressEngine.getProgress();
    const completed = progress.completedLessons.includes(lesson.lessonId);
    return {
      day,
      title: lesson.title,
      completed,
      completedDate: lesson.completedDate || null,
      xp: lesson.xpReward,
      difficulty: lesson.difficulty,
      category: lesson.category,
      reviewStatus: lesson.reviewLevel,
      tags: lesson.tags,
      timeSpent: lesson.duration,
      futureAIComment: 'Coming soon'
    };
  }
};
