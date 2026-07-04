// ===========================================
// aiConsciousnessLayer.js
// AI意识层：整合身份、记忆与感知，形成统一的意识表示
// ===========================================
LawAIApp.AIConsciousnessLayer = {
  init() {
    // 订阅文明事件，更新意识状态
    LawAIApp.EventBus.on('CivilizationIdentityUpdated', (state) => {
      LawAIApp.CollectiveMemorySystem.takeSnapshot();
    });

    LawAIApp.EventBus.on('SkillCertified', (data) => {
      LawAIApp.CollectiveMemorySystem.recordSkillEvolution(data.skillId, data.masteryScore);
    });

    LawAIApp.EventBus.on('WorkTaskCompleted', (data) => {
      LawAIApp.CollectiveMemorySystem.recordEvent({
        type: 'task_completed',
        taskId: data.taskId,
        performance: data.performanceScore
      });
    });

    // 启动感知监控
    LawAIApp.CivilizationAwarenessMonitor.start();

    // 首次刷新身份
    LawAIApp.CivilizationIdentityCore.refreshSelfState();

    console.log('AI Consciousness Layer is now active. The civilization is self-aware.');
  },

  // 获取完整的意识报告
  getConsciousnessReport() {
    return {
      identity: LawAIApp.CivilizationIdentityCore.getIdentity(),
      memory: LawAIApp.CollectiveMemorySystem.getMemorySummary(),
      awareness: LawAIApp.CivilizationAwarenessMonitor.getAwarenessReport(),
      alignment: LawAIApp.IdentityAlignmentEngine.performFullAudit()
    };
  }
};

// 等待其他组件就绪后启动
setTimeout(() => {
  if (LawAIApp.CivilizationIdentityCore && LawAIApp.AgentOrchestrator) {
    LawAIApp.AIConsciousnessLayer.init();
  }
}, 1500);
