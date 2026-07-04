// ===========================================
// motivationEngine.js
// 动机引擎：生成个性化激励消息
// ===========================================
LawAIApp.MotivationEngine = {
  // 基于用户状态生成激励短语
  generateMotivation(userId) {
    const user = LawAIApp.AuthService.getCurrentUser();
    if (!user) return 'Welcome! Start your learning journey.';

    const summary = LawAIApp.JourneyTracker.getSummary(userId);
    const nextMilestone = LawAIApp.GoalTimeline.getNextMilestone(userId);
    const progress = LawAIApp.ProgressEngine.getProgress();

    const messages = [];

    // 进度接近里程碑
    if (nextMilestone && nextMilestone.condition) {
      messages.push(`You are close to unlocking "${nextMilestone.title}". Keep going!`);
    }

    // 连续签到鼓励
    if (summary.streak >= 7) {
      messages.push(`🔥 ${summary.streak}-day streak! You're on fire.`);
    }

    // 超越其他学习者（模拟）
    const completionPercent = progress.completionPercent || 0;
    if (completionPercent > 80) {
      messages.push('You have completed more than 80% of learners this week!');
    }

    // 随机积极肯定
    const randomMessages = [
      'Every mission you complete builds your future.',
      'Learning today creates opportunities tomorrow.',
      'You are investing in yourself — the best investment there is.'
    ];
    messages.push(randomMessages[Math.floor(Math.random() * randomMessages.length)]);

    return messages.join(' ');
  },

  // 在开始学习前获取激励消息
  getPreLearningMessage(userId, missionTitle) {
    const careers = LawAIApp.CareerMappingEngine.getCareersForLesson(missionTitle);
    return `By mastering "${missionTitle}", you are building skills that ${careers[0] ? `a ${careers[0]}` : 'professionals'} use every day. This is your path to real impact.`;
  }
};
