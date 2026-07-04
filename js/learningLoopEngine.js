// learningLoopEngine.js
LawAIApp.LearningLoopEngine = {
  // 学习循环：Learn → Test → Reflect → Store → Adapt → Plan Next
  recordSuccess(lessonId) {
    const state = LawAIApp.LearningStateManager.getState();
    // 更新适应：降低风险，增加动量
    state.riskLevel = 'low';
    state.learningMomentum = Math.min(100, state.learningMomentum + 5);
    LawAIApp.LearningStateManager.saveState(state);
  },
  recordFailure(lessonId) {
    const state = LawAIApp.LearningStateManager.getState();
    state.riskLevel = 'high';
    state.learningMomentum = Math.max(0, state.learningMomentum - 10);
    LawAIApp.LearningStateManager.saveState(state);
  },
  // 适应：根据当前状态调整学习计划（示意，可扩展）
  adapt() {
    const state = LawAIApp.LearningStateManager.getState();
    if (state.riskLevel === 'high') {
      // 降低难度、插入复习
      LawAIApp.EventBus.emit('PlannerRecalculate', { priority: 'review' });
    } else if (state.learningMomentum > 70) {
      // 加速进度
      LawAIApp.EventBus.emit('PlannerRecalculate', { priority: 'advance' });
    }
  }
};
