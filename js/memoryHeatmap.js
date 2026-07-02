// memoryHeatmap.js
LawAIApp.MemoryHeatmap = {
  // 按类别汇总记忆强度
  getCategoryStrengthMap() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const lessons = LawAIApp.LessonEngine.getAllLessons();
    const map = {};

    Object.values(allMemory).forEach(memory => {
      const lesson = lessons.find(l => l.lessonId === memory.lessonId);
      const cat = lesson ? lesson.category : 'Unknown';
      if (!map[cat]) map[cat] = { totalStrength: 0, count: 0, items: [] };
      map[cat].totalStrength += memory.strength;
      map[cat].count += 1;
      map[cat].items.push({ lessonId: memory.lessonId, strength: memory.strength, state: memory.state });
    });

    // 计算平均并生成分级
    const result = {};
    Object.entries(map).forEach(([cat, data]) => {
      const avg = Math.round(data.totalStrength / data.count);
      result[cat] = {
        averageStrength: avg,
        level: avg >= 80 ? 'Strong' : avg >= 50 ? 'Stable' : 'Weak',
        lessonCount: data.count
      };
    });
    return result;
  },

  // 获取即将到期的复习列表
  getUpcomingReviews(limit = 5) {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    const due = [];
    Object.values(allMemory).forEach(m => {
      if (LawAIApp.ForgettingCurve.isReviewDue(m.lessonId)) {
        due.push({ lessonId: m.lessonId, strength: m.strength, nextReview: m.nextReviewDate });
      }
    });
    return due.slice(0, limit);
  }
};
