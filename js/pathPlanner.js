// pathPlanner.js
LawAIApp.PathPlanner = {
  // 生成基于现有进度的默认学习路径
  generateDefaultPath(academyId = 'academy_ai') {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completed = prog.completedLessons;
    const remaining = allLessons.filter(l => !completed.includes(l.lessonId));
    const recommended = remaining.slice(0, 20); // 推荐接下来20节课

    const path = {
      pathId: 'path_' + Date.now(),
      title: 'AI Mastery Journey',
      description: 'From AI Foundation to advanced applications.',
      academyId,
      difficulty: 'Beginner to Advanced',
      estimatedHours: Math.ceil(remaining.length * 0.15),
      estimatedXP: remaining.reduce((sum, l) => sum + l.xpReward, 0),
      requiredLessons: remaining.map(l => l.lessonId),
      recommendedLessons: recommended.map(l => l.lessonId),
      optionalLessons: [],
      milestones: LawAIApp.MilestoneEngine.getUnlockedMilestones().map(m => m.name)
    };

    LawAIApp.StorageEngine.set('current_path', path);
    LawAIApp.EventBus.emit('PathGenerated', { path });
    return path;
  },

  // 根据表现动态调整路径（简化：如果记忆弱则插入复习）
  adjustPath() {
    const path = LawAIApp.StorageEngine.get('current_path');
    if (!path) return;
    const memory = LawAIApp.MemoryEngine.getUpcomingReviews();
    if (memory.length > 0) {
      const weakLessons = memory.map(m => m.lessonId);
      path.recommendedLessons = [...new Set([...weakLessons, ...path.recommendedLessons])];
      LawAIApp.StorageEngine.set('current_path', path);
      LawAIApp.EventBus.emit('PathUpdated', { path });
    }
  }
};
