// xpCalculator.js
LawAIApp.XPCalculator = {
  // 基础 XP 来自课程定义
  getBaseXP(lessonId) {
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const lesson = allLessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.xpReward : 0;
  },

  // 当前加成倍数（从连续签到等计算）
  getStreakMultiplier() {
    const streak = LawAIApp.StreakEngine.getStreakData();
    if (streak.currentStreak >= 30) return 2.0;
    if (streak.currentStreak >= 7) return 1.5;
    if (streak.currentStreak >= 3) return 1.2;
    return 1.0;
  },

  // 计算最终 XP（可扩展其他加成）
  calculateFinalXP(lessonId, customMultiplier = 1.0) {
    const base = this.getBaseXP(lessonId);
    const streakMult = this.getStreakMultiplier();
    return Math.floor(base * streakMult * customMultiplier);
  }
};
