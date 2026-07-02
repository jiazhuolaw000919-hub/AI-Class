// analyticsCollector.js
LawAIApp.AnalyticsCollector = (function() {
  function recordEvent(eventType, payload) {
    LawAIApp.AnalyticsStorage.appendEventLog({
      eventType,
      payload,
      timestamp: new Date().toISOString()
    });
    // 更新计数器
    const counters = LawAIApp.AnalyticsStorage.getCounters();
    switch (eventType) {
      case 'LessonCompleted':
        counters.totalLessonsCompleted += 1;
        break;
      case 'QuizCompleted':
        counters.totalQuizzesTaken += 1;
        break;
      case 'PracticeCompleted':
        counters.totalPracticeCompleted += 1;
        break;
      case 'BookmarkAdded':
        counters.totalBookmarks += 1;
        break;
      case 'FavoriteAdded':
        counters.totalFavorites += 1;
        break;
    }
    LawAIApp.AnalyticsStorage.saveCounters(counters);
  }

  // 注册需要监听的分析事件
  const eventsToTrack = [
    'LessonStarted', 'LessonCompleted', 'LessonPaused', 'LessonResumed',
    'QuizStarted', 'QuizCompleted',
    'PracticeStarted', 'PracticeCompleted',
    'BookmarkAdded', 'FavoriteAdded',
    'ThemeChanged', 'EnvironmentChanged', 'AvatarUpdated',
    'LevelUp', 'XPAwarded', 'ProgressUpdated'
  ];

  eventsToTrack.forEach(eventType => {
    LawAIApp.EventBus.on(eventType, (payload) => {
      recordEvent(eventType, payload);
    });
  });

  // 定期触发处理（每完成一个事件可触发，但为了避免频繁处理，我们将在 processor 中手动调用）
  LawAIApp.EventBus.on('LessonCompleted', () => {
    // 每完成一节课立即触发一次指标更新
    LawAIApp.AnalyticsProcessor.processAll();
  });

  return { recordEvent };
})();
