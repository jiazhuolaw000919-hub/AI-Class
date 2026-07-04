// systemOrchestrator.js
LawAIApp.SystemOrchestrator = {
  init() {
    // 定义关键事件对应的处理程序
    const updateState = () => LawAIApp.LearningStateManager.refresh();

    LawAIApp.EventBus.on('LessonCompleted', updateState);
    LawAIApp.EventBus.on('QuizCompleted', updateState);
    LawAIApp.EventBus.on('PracticeCompleted', updateState);
    LawAIApp.EventBus.on('ProjectFinished', updateState);
    LawAIApp.EventBus.on('GoalUpdated', updateState);
    LawAIApp.EventBus.on('MemoryUpdated', updateState);
    LawAIApp.EventBus.on('StreakMilestone', updateState);

    // 初始刷新
    setTimeout(updateState, 500);
  },
  // 触发学习循环
  triggerLearningLoop(lessonId, result) {
    const loop = LawAIApp.LearningLoopEngine;
    const state = LawAIApp.LearningStateManager.getState();

    if (result === 'completed') {
      loop.recordSuccess(lessonId);
      // 成功后的适应
      if (state.riskLevel === 'low') {
        // 加速：可跳过基础内容（由课程引擎决定）
        LawAIApp.EventBus.emit('ContentAccelerationSuggested', { lessonId });
      }
    } else {
      loop.recordFailure(lessonId);
      // 失败后的适应
      LawAIApp.EventBus.emit('ReviewInserted', { lessonId });
      LawAIApp.EventBus.emit('DifficultyReduced', { lessonId });
    }
    loop.adapt();
  }
};

// 自动初始化
setTimeout(() => LawAIApp.SystemOrchestrator.init(), 800);
