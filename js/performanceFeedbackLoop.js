// ===========================================
// performanceFeedbackLoop.js
// 绩效反馈闭环：评估结果影响后续学习与任务
// ===========================================
LawAIApp.PerformanceFeedbackLoop = {
  init() {
    LawAIApp.EventBus.on('PromotionEvaluated', (data) => {
      // 根据行动调整任务难度
      if (data.action === 'promote') {
        // 增加任务难度倾向
        LawAIApp.StorageEngine.set('preferred_task_difficulty', 'high');
      } else if (data.action === 'demote' || data.action === 'retrain') {
        LawAIApp.StorageEngine.set('preferred_task_difficulty', 'low');
      }

      // 通知代理调整支持力度
      LawAIApp.EventBus.emit('AdjustAgentSupport', { level: data.newLevel, score: data.overallScore });
    });

    // 定期重新评估（每天一次模拟，但可设为每完成5个任务后）
    let taskCount = 0;
    LawAIApp.EventBus.on('WorkTaskCompleted', () => {
      taskCount++;
      if (taskCount % 5 === 0) {
        LawAIApp.PromotionEngine.evaluatePromotion();
      }
    });
  }
};

// 初始化
setTimeout(() => LawAIApp.PerformanceFeedbackLoop.init(), 600);
