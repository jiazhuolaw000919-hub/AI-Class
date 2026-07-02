// goalEngine.js
LawAIApp.GoalEngine = (function() {
  // 学习活动发生后，自动为相关目标更新进度
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    const lessonId = data.lessonId;
    // 查找关联的目标（简化：所有活跃目标都增加进度，实际可按academy过滤）
    const activeGoals = LawAIApp.GoalTracker.getActiveGoals();
    activeGoals.forEach(goal => {
      const prog = LawAIApp.ProgressEngine.getProgress();
      LawAIApp.GoalTracker.updateProgress(goal.goalId, {
        completedLessons: prog.completedLessons.length,
        learningHours: (prog.completedLessons.length * 8) / 60, // 估算小时
        memoryStrength: LawAIApp.MemoryEngine ? LawAIApp.MemoryEngine.getMemoryStrength(lessonId) : 0
      });
    });
  });

  // 定期健康检查（每天一次）
  setInterval(() => {
    LawAIApp.GoalHealth.checkAll();
  }, 86400000);

  return {
    createGoal: (goalDef) => LawAIApp.GoalTracker.create(goalDef),
    updateProgress: (goalId, progress) => LawAIApp.GoalTracker.updateProgress(goalId, progress),
    getActiveGoals: () => LawAIApp.GoalTracker.getActiveGoals(),
    getTimeline: (goalId) => LawAIApp.GoalTimeline.generate(goalId),
    getFullTimeline: () => LawAIApp.GoalTimeline.getFullTimeline(),
    recommendGoal: () => LawAIApp.GoalPlanner.recommendGoal(),
    checkHealth: () => LawAIApp.GoalHealth.checkAll()
  };
})();
