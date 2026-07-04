// ===========================================
// xpRewardEngine.js
// XP 奖励引擎：集中管理所有 XP 发放
// ===========================================
LawAIApp.XPRewardEngine = {
  // 完成任务奖励
  awardMissionXP(userId, baseXP) {
    const xp = baseXP + Math.floor(Math.random() * 10); // 添加微小随机性
    LawAIApp.UserApi.updateXp(userId, xp);
    LawAIApp.EventBus.emit('XPAwarded', { userId, amount: xp, source: 'mission' });
  },

  // 挑战奖励
  awardChallengeXP(userId, baseXP) {
    LawAIApp.UserApi.updateXp(userId, baseXP);
    LawAIApp.EventBus.emit('XPAwarded', { userId, amount: baseXP, source: 'challenge' });
  },

  // 每日连续签到奖励
  awardStreakXP(userId, streak) {
    const xp = streak * 5;
    LawAIApp.UserApi.updateXp(userId, xp);
    LawAIApp.EventBus.emit('XPAwarded', { userId, amount: xp, source: 'streak' });
  }
};
