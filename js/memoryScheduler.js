// memoryScheduler.js
LawAIApp.MemoryScheduler = {
  // 获取今日应复习的课程 ID
  getTodayReviewList() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const now = new Date();
    const todayStr = now.toDateString();
    const due = [];

    Object.keys(allMemory).forEach(lessonId => {
      const mem = allMemory[lessonId];
      // 已掌握且长时间没复习？使用遗忘曲线判断是否到期
      if (LawAIApp.ForgettingCurve.isReviewDue(lessonId)) {
        due.push(lessonId);
      }
      // 同时检查是否有明确的下次复习日期且已过
      if (mem.nextReviewDate && new Date(mem.nextReviewDate) <= now) {
        if (!due.includes(lessonId)) due.push(lessonId);
      }
    });

    // 按紧急程度排序：强度越低越靠前
    due.sort((a, b) => (allMemory[a]?.strength || 50) - (allMemory[b]?.strength || 50));
    return due;
  },

  // 获取未来 N 天的复习计划
  getUpcomingReviews(daysAhead = 7) {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const now = new Date();
    const upcoming = [];
    const end = new Date(now.getTime() + daysAhead * 86400000);

    Object.keys(allMemory).forEach(lessonId => {
      const mem = allMemory[lessonId];
      if (mem.nextReviewDate) {
        const reviewDate = new Date(mem.nextReviewDate);
        if (reviewDate > now && reviewDate <= end) {
          upcoming.push({
            lessonId,
            date: reviewDate.toISOString(),
            strength: mem.strength
          });
        }
      }
    });
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming;
  },

  // 计算记忆健康分数（0-100）
  calculateMemoryHealth() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const entries = Object.values(allMemory);
    if (entries.length === 0) return 100; // 无数据时视为健康
    const avgStrength = entries.reduce((sum, m) => sum + m.strength, 0) / entries.length;
    const dueCount = this.getTodayReviewList().length;
    // 健康度 = 平均强度 - 逾期数量惩罚
    return Math.max(0, Math.round(avgStrength - dueCount * 2));
  },

  // 找出高风险主题（强度低于 40）
  getAtRiskTopics() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    return Object.keys(allMemory)
      .filter(id => allMemory[id].strength < 40)
      .map(id => ({ lessonId: id, strength: allMemory[id].strength }));
  },

  // 生成每日复习计划（文本）
  generateDailyPlan() {
    const todayList = this.getTodayReviewList();
    const total = todayList.length;
    if (total === 0) return 'No reviews scheduled today.';
    return `You have ${total} item(s) to review today.`;
  },

  // 完成一次复习后更新进度
  completeReview(lessonId, quality = 'good') {
    // 调用已有 RecallEngine 记录回忆质量
    if (LawAIApp.RecallEngine) {
      LawAIApp.RecallEngine.recordRecall(lessonId, quality);
    }
    // 根据遗忘曲线重新安排下次复习
    const nextDate = LawAIApp.ForgettingCurve.getNextReviewDate(lessonId);
    const mem = LawAIApp.MemoryTracker.getOrCreate(lessonId);
    mem.nextReviewDate = nextDate.toISOString();
    LawAIApp.MemoryTracker.recordReview(lessonId);
  }
};
