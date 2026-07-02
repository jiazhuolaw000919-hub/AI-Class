// mentorEngine.js
LawAIApp.MentorEngine = (function() {
  // 主动支持：定期检查学习状态
  function proactiveCheck() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const reviewToday = LawAIApp.ReviewQueue.getTodayReviews();
    const memory = LawAIApp.MentorMemory.getMemory();

    // 如果今天还没学习但连续很多天，可以提醒（这里只做简单日志，未来可推送通知）
    const lastInteraction = memory.recentContext.lastInteraction;
    if (lastInteraction) {
      const hoursSince = (Date.now() - new Date(lastInteraction).getTime()) / 3600000;
      if (hoursSince > 24 && streak.currentStreak > 0) {
        console.log('Mentor: Don\'t forget to keep your streak going!');
      }
    }

    // 复习提醒
    if (reviewToday.length > 0) {
      console.log(`Mentor: You have ${reviewToday.length} review(s) due today.`);
    }

    // 更新记忆强弱项
    LawAIApp.MentorMemory.refreshStrengths();
    // 生成每日目标（如果还没有）
    const goals = LawAIApp.MentorGoals.getActiveGoals();
    if (goals.length === 0) LawAIApp.MentorGoals.generateDailyGoal();
  }

  // 监听事件
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    LawAIApp.MentorMemory.updateContext(data.lessonId);
    LawAIApp.MentorMemory.refreshStrengths();
    // 更新每日目标进度
    const goals = LawAIApp.MentorGoals.getActiveGoals().filter(g => g.type === 'daily');
    goals.forEach(g => LawAIApp.MentorGoals.updateProgress(g.id, (g.currentValue||0)+1));
  });

  LawAIApp.EventBus.on('ProgressUpdated', () => {
    LawAIApp.MentorMemory.refreshStrengths();
  });

  // 每6小时自动检查一次（实际可调整）
  setInterval(proactiveCheck, 6 * 3600000);
  proactiveCheck(); // 启动时检查一次

  return {
    talk: async (message) => LawAIApp.MentorConversation.sendMessage(message),
    getReflection: () => LawAIApp.MentorReflection.getLastReflection(),
    generateReflection: () => LawAIApp.MentorReflection.generateWeeklyReflection(),
    getMemory: () => LawAIApp.MentorMemory.getMemory(),
    getGoals: () => LawAIApp.MentorGoals.getActiveGoals(),
    addGoal: (type, desc, target) => LawAIApp.MentorGoals.addGoal(type, desc, target)
  };
})();
