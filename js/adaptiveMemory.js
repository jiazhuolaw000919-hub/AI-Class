// adaptiveMemory.js
LawAIApp.AdaptiveMemory = (function() {
  // 监听学习事件，自动更新记忆调度
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    // 已有 MemoryEngine 会自动更新，这里确保调度器重新计算
  });

  LawAIApp.EventBus.on('PracticeCompleted', () => {
    // 练习也可能提升记忆，触发复习
  });

  // 每日检查并发出记忆警报（简单控制台输出，可扩展）
  setInterval(() => {
    const atRisk = LawAIApp.MemoryScheduler.getAtRiskTopics();
    if (atRisk.length > 0) {
      console.log(`Memory Alert: ${atRisk.length} topics need attention.`);
    }
  }, 3600000); // 每小时检查一次

  return {
    dashboard: () => LawAIApp.MemoryDashboard.render(),
    getScheduler: () => LawAIApp.MemoryScheduler,
    getAnalytics: () => LawAIApp.MemoryAnalytics
  };
})();
