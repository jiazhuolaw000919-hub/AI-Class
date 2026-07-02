// habitEngine.js
LawAIApp.HabitEngine = (function() {
  // 监听课程完成，记录习惯并调整目标
  LawAIApp.EventBus.on('LessonCompleted', () => {
    LawAIApp.HabitTracker.record('lesson');
    LawAIApp.HabitScore.calculate();
    LawAIApp.GoalAdjuster.adjustDailyGoal();
    LawAIApp.EventBus.emit('HabitCompleted', { type: 'lesson' });
  });

  // 监听反思生成
  LawAIApp.EventBus.on('ReflectionGenerated', () => {
    LawAIApp.HabitTracker.record('reflection');
    LawAIApp.HabitScore.calculate();
  });

  // 周期性检查复习完成与学习节奏
  function periodicCheck() {
    const today = new Date().toDateString();
    const todayReviews = LawAIApp.ReviewQueue.getTodayReviews();
    let allDone = todayReviews.length > 0;
    todayReviews.forEach(id => {
      const tasks = LawAIApp.ReviewQueue.getLessonReviews(id);
      const doneToday = tasks.some(t => t.done && new Date(t.date).toDateString() === today);
      if (!doneToday) allDone = false;
    });
    if (allDone) {
      const habits = LawAIApp.HabitTracker.getTodayHabits();
      if (habits.reviewsDone === 0) {
        LawAIApp.HabitTracker.record('review');
      }
    }

    const rhythm = LawAIApp.LearningRhythm.analyze();
    LawAIApp.StorageEngine.set('learning_rhythm', rhythm);
  }
  setInterval(periodicCheck, 1800000); // 30 分钟
  periodicCheck();

  return {
    getScore: () => LawAIApp.HabitScore.calculate(),
    getRhythm: () => LawAIApp.StorageEngine.get('learning_rhythm', { preferredTime: 'unknown', avgSessionLength: 0, preferredDays: [] }),
    getTodayHabits: () => LawAIApp.HabitTracker.getTodayHabits(),
    getWeekHistory: () => LawAIApp.HabitTracker.getWeekHistory(),
    createRecoveryGoal: () => LawAIApp.GoalAdjuster.createRecoveryGoal()
  };
})();
