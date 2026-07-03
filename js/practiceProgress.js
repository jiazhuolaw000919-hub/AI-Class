// practiceProgress.js (轻量封装，实际逻辑已融合在 practiceView 和 moduleProgress 中)
// 保留此文件以备未来扩展
LawAIApp.PracticeProgress = {
  isCompleted(moduleId, practiceId) {
    const prog = LawAIApp.ModuleProgress.get(moduleId);
    return prog.practiceCompleted && prog.completedPractices?.includes(practiceId);
  }
};
