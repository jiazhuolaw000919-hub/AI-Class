// memoryEngine.js
LawAIApp.MemoryEngine = (function() {
  // 课程完成时更新记忆追踪
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    const lessonId = data.lessonId;
    LawAIApp.MemoryTracker.getOrCreate(lessonId);
    const currentStrength = LawAIApp.ForgettingCurve.calculateCurrentStrength(lessonId);
    const boostedStrength = currentStrength + 15; // 完成课程显著增强记忆
    const newState = boostedStrength >= 80 ? 'strong' : boostedStrength >= 50 ? 'stable' : 'learning';
    LawAIApp.MemoryTracker.updateStrength(lessonId, boostedStrength, newState);
    // 设置下次复习时间
    const nextDate = LawAIApp.ForgettingCurve.getNextReviewDate(lessonId);
    LawAIApp.MemoryTracker.getOrCreate(lessonId).nextReviewDate = nextDate.toISOString();
    LawAIApp.EventBus.emit('MemoryUpdated', { lessonId, strength: boostedStrength });
  });

  // 练习完成时增加少量记忆强度
  LawAIApp.EventBus.on('PracticeCompleted', (data) => {
    const lessonId = data.practice.lessonId;
    const boost = 5;
    const currentStr = LawAIApp.ForgettingCurve.calculateCurrentStrength(lessonId);
    LawAIApp.MemoryTracker.updateStrength(lessonId, currentStr + boost);
  });

  // 定期检查并触发复习提醒
  function scheduleReviews() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    Object.keys(allMemory).forEach(lessonId => {
      if (LawAIApp.ForgettingCurve.isReviewDue(lessonId)) {
        LawAIApp.EventBus.emit('ReviewScheduled', { lessonId, strength: allMemory[lessonId].strength });
      }
    });
  }

  // 每6小时检查一次
  setInterval(scheduleReviews, 6 * 3600000);
  scheduleReviews();

  return {
    getMemoryStrength: (lessonId) => LawAIApp.ForgettingCurve.calculateCurrentStrength(lessonId),
    getMemoryState: (lessonId) => LawAIApp.MemoryTracker.getOrCreate(lessonId).state,
    getHeatmap: () => LawAIApp.MemoryHeatmap.getCategoryStrengthMap(),
    getUpcomingReviews: () => LawAIApp.MemoryHeatmap.getUpcomingReviews(),
    recall: (lessonId, quality) => LawAIApp.RecallEngine.recordRecall(lessonId, quality),
    generateRecallPrompt: (lessonId) => LawAIApp.RecallEngine.generateRecallPrompt(lessonId)
  };
})();
