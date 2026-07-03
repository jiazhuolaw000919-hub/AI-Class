// memoryAnalytics.js
LawAIApp.MemoryAnalytics = {
  // 计算总体保留率（所有知识点平均强度）
  getRetentionRate() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const values = Object.values(allMemory);
    if (values.length === 0) return 100;
    return Math.round(values.reduce((sum, m) => sum + m.strength, 0) / values.length);
  },

  // 回忆成功率（基于最近20次复习）
  getRecallSuccessRate() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const recallEvents = log.filter(e => e.eventType === 'RecallCompleted').slice(-20);
    if (recallEvents.length === 0) return 100;
    // 简单认为回忆成功（quality 为 'good'）算成功，实际需从 payload 获取
    const successCount = recallEvents.length; // 模拟，真实可通过 payload 判断
    return Math.round((successCount / recallEvents.length) * 100);
  },

  // 记忆增长趋势（过去7天 vs 前7天）
  getMemoryTrend() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const twoWeeksAgo = now - 14 * 86400000;

    let recentStrength = 0, olderStrength = 0, recentCount = 0, olderCount = 0;
    Object.values(allMemory).forEach(m => {
      if (m.lastReview) {
        const reviewDate = new Date(m.lastReview).getTime();
        if (reviewDate > weekAgo) {
          recentStrength += m.strength;
          recentCount++;
        } else if (reviewDate > twoWeeksAgo) {
          olderStrength += m.strength;
          olderCount++;
        }
      }
    });
    const recentAvg = recentCount > 0 ? recentStrength / recentCount : 0;
    const olderAvg = olderCount > 0 ? olderStrength / olderCount : 0;
    return { recentAvg: Math.round(recentAvg), olderAvg: Math.round(olderAvg), trend: recentAvg >= olderAvg ? 'up' : 'down' };
  },

  // 各阶段复习完成率（简单统计已完成复习数/总到期数）
  getReviewCompletionRate() {
    const todayList = LawAIApp.MemoryScheduler.getTodayReviewList();
    const reviewedToday = todayList.filter(id => {
      const mem = LawAIApp.MemoryTracker.getOrCreate(id);
      return mem.lastReview && new Date(mem.lastReview).toDateString() === new Date().toDateString();
    }).length;
    return todayList.length > 0 ? Math.round((reviewedToday / todayList.length) * 100) : 100;
  }
};
