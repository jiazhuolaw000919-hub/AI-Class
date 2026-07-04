// journeyTracker.js (升级版)
// ✅ 保留原有功能：init()、recordActivity()、getSummary()、事件监听
// ✅ 新增功能：事件日志系统、任务/挑战计数、详细摘要、事件查询
LawAIApp.JourneyTracker = {
  _eventsKey: 'journey_events', // 新增：事件日志存储键

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

  // ========== 新增：事件日志系统 ==========
  logEvent(userId, eventType, detail) {
    const events = LawAIApp.StorageEngine.get(this._eventsKey, []);
    events.push({
      userId,
      eventType,
      detail,
      timestamp: new Date().toISOString()
    });
    if (events.length > 200) events.shift();
    LawAIApp.StorageEngine.set(this._eventsKey, events);
    LawAIApp.EventBus.emit('JourneyEventLogged', { userId, eventType, detail });
  },

  getSummary() {
    const data = this._getStore();
    const prog = LawAIApp.ProgressEngine.getProgress();
    // 新增：从事件日志中统计任务和挑战
    const events = LawAIApp.StorageEngine.get(this._eventsKey, []);
    const totalMissions = events.filter(e => e.eventType === 'mission_completed').length;
    const totalChallenges = events.filter(e => e.eventType === 'challenge_completed').length;
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;

    return {
      startedAt: data.startedAt,
      totalDaysActive: data.totalDaysActive,
      completedLessons: prog.completedLessons.length,
      currentStreak: LawAIApp.StreakEngine.getStreakData().currentStreak,
      recentProgress: data.dailyProgress.slice(-7),
      totalMissions,        // 新增
      totalChallenges,      // 新增
      lastActive: lastEvent ? lastEvent.timestamp : data.lastActivity // 新增
    };
  },

  // ========== 新增：按类型查询事件 ==========
  getEventsByType(eventType, limit = 20) {
    const events = LawAIApp.StorageEngine.get(this._eventsKey, []);
    return events.filter(e => e.eventType === eventType).slice(-limit);
  },

  // ========== 新增：获取最近事件 ==========
  getRecentEvents(limit = 10) {
    const events = LawAIApp.StorageEngine.get(this._eventsKey, []);
    return events.slice(-limit).reverse();
  }
};

// 监听课程完成更新旅程
LawAIApp.EventBus.on('LessonCompleted', (data) => {
  LawAIApp.JourneyTracker.recordActivity(data.lessonId);
  const prog = LawAIApp.ProgressEngine.getProgress();
  LawAIApp.MilestoneEngine.checkMilestone(prog);
  LawAIApp.PathPlanner.adjustPath();
});

// 新增：监听任务和挑战完成事件，自动记录到事件日志
LawAIApp.EventBus.on('MissionCompleted', (data) => {
  LawAIApp.JourneyTracker.logEvent(data.userId, 'mission_completed', data.missionId);
});

LawAIApp.EventBus.on('ChallengeCompleted', (data) => {
  LawAIApp.JourneyTracker.logEvent(data.userId, 'challenge_completed', data.challengeId);
});
