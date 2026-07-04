// ===========================================
// liveLearningGraph.js
// 激活实时学习图谱，并持续更新节点状态
// ===========================================
LawAIApp.LiveLearningGraph = {
  init() {
    // 确保节点与边已初始化
    if (typeof LawAIApp.GraphNodeManager !== 'undefined') {
      LawAIApp.GraphNodeManager.init();
    }
    if (typeof LawAIApp.GraphEdgeManager !== 'undefined') {
      LawAIApp.GraphEdgeManager.init();
    }

    // 监听用户活动，实时更新图谱
    LawAIApp.EventBus.on('LessonCompleted', (data) => {
      LawAIApp.GraphNodeManager.markCompleted(data.lessonId);
      LawAIApp.GraphSignalProcessor.propagateMastery(data.lessonId, 15);
    });

    LawAIApp.EventBus.on('QuizFailed', (data) => {
      const currentLesson = LawAIApp.ProgressEngine.getProgress().currentLesson;
      LawAIApp.GraphSignalProcessor.propagateConfusion(`day-${currentLesson}`, 10);
    });

    LawAIApp.EventBus.on('SkillCertified', (data) => {
      LawAIApp.GraphNodeManager.addNode(data.skillId, 'validated_skill', {
        strength: data.masteryScore,
        certified: true
      });
    });

    console.log('Live Learning Graph is now running.');
  }
};

// 自动启动
setTimeout(() => LawAIApp.LiveLearningGraph.init(), 300);
