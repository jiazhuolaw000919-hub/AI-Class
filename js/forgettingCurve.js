// forgettingCurve.js
LawAIApp.ForgettingCurve = {
  // 根据时间衰减计算当前强度
  calculateCurrentStrength(lessonId) {
    const memory = LawAIApp.MemoryTracker.getOrCreate(lessonId);
    const lastStudy = memory.lastStudied ? new Date(memory.lastStudied) : null;
    if (!lastStudy) return memory.strength;

    const daysSinceStudy = (Date.now() - lastStudy.getTime()) / 86400000;
    // 简化的艾宾浩斯遗忘曲线：强度每天衰减 10%（但低于30后减慢）
    let decay = 0;
    if (daysSinceStudy <= 1) decay = 2;
    else if (daysSinceStudy <= 3) decay = 5 * (daysSinceStudy - 1);
    else if (daysSinceStudy <= 7) decay = 10 + (daysSinceStudy - 3) * 8;
    else if (daysSinceStudy <= 30) decay = 42 + (daysSinceStudy - 7) * 2;
    else decay = 100;

    const newStrength = Math.max(0, memory.strength - decay);
    return newStrength;
  },

  // 计算下一次建议复习时间（基于当前强度）
  getNextReviewDate(lessonId) {
    const strength = this.calculateCurrentStrength(lessonId);
    if (strength >= 90) return new Date(Date.now() + 30 * 86400000); // 30天后
    if (strength >= 70) return new Date(Date.now() + 7 * 86400000);
    if (strength >= 50) return new Date(Date.now() + 3 * 86400000);
    if (strength >= 30) return new Date(Date.now() + 86400000);
    return new Date(Date.now() + 12 * 3600000); // 半天后
  },

  // 检查是否到了复习时间
  isReviewDue(lessonId) {
    const memory = LawAIApp.MemoryTracker.getOrCreate(lessonId);
    const nextDate = memory.nextReviewDate ? new Date(memory.nextReviewDate) : null;
    if (!nextDate) return true;
    return Date.now() >= nextDate.getTime();
  }
};
