// journeyTracker.js
LawAIApp.JourneyTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('journey_data', {
      startedAt: null,
      lastActivity: null,
      totalDaysActive: 0,
      dailyProgress: [],
      milestonesUnlocked: []
    });
  },
  _save(data) { LawAIApp.StorageEngine.set('journey_data', data); },

  init() {
    const data = this._getStore();
    if (!data.startedAt) {
      data.startedAt = new Date().toISOString();
      this._save(data);
    }
  },

  recordActivity(lessonId) {
    const data = this._getStore();
    const today = new Date().toDateString();
    data.lastActivity = new Date().toISOString();
    const dayEntry = data.dailyProgress.find(d => d.date === today);
    if (dayEntry) {
      dayEntry.lessonsCompleted += 1;
    } else {
      data.dailyProgress.push({ date: today, lessonsCompleted: 1 });
      data.totalDaysActive += 1;
    }
    this._save(data);
    LawAIApp.EventBus.emit('JourneyUpdated', { totalDays: data.totalDaysActive });
  },

  getSummary() {
    const data = this._getStore();
    const prog = LawAIApp.ProgressEngine.getProgress();
    return {
      startedAt: data.startedAt,
      totalDaysActive: data.totalDaysActive,
      completedLessons: prog.completedLessons.length,
      currentStreak: LawAIApp.StreakEngine.getStreakData().currentStreak,
      recentProgress: data.dailyProgress.slice(-7)
    };
  }
};

// 监听课程完成更新旅程
LawAIApp.EventBus.on('LessonCompleted', (data) => {
  LawAIApp.JourneyTracker.recordActivity(data.lessonId);
  const prog = LawAIApp.ProgressEngine.getProgress();
  LawAIApp.MilestoneEngine.checkMilestone(prog);
  LawAIApp.PathPlanner.adjustPath();
});
