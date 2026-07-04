// ===========================================
// careerProgressionEngine.js
// 职业进展引擎：管理级别提升带来的系统变化
// ===========================================
LawAIApp.CareerProgressionEngine = {
  init() {
    // 监听晋升事件，自动调整系统行为
    LawAIApp.EventBus.on('PromotionEvaluated', (data) => {
      if (data.action === 'promote') {
        // 解锁更高难度任务
        LawAIApp.EventBus.emit('AdvancedTasksUnlocked', { level: data.newLevel });
        // 更新学习图谱中的职业节点
        LawAIApp.GraphNodeManager.addNode('career_level', 'career', {
          currentLevel: data.newLevel,
          overallScore: data.overallScore
        });
      } else if (data.action === 'demote' || data.action === 'retrain') {
        LawAIApp.EventBus.emit('RetrainingRecommended', {
          reason: data.action,
          currentLevel: data.newLevel
        });
      }
    });

    // 当新技能认证或任务完成时，定期检查晋升
    LawAIApp.EventBus.on('SkillCertified', () => {
      LawAIApp.PromotionEngine.evaluatePromotion();
    });
    LawAIApp.EventBus.on('WorkTaskCompleted', () => {
      LawAIApp.PromotionEngine.evaluatePromotion();
    });
  },

  // 获取当前职业状态摘要
  getCareerStatus() {
    const level = LawAIApp.PromotionEngine.getCurrentLevel();
    const levelName = LawAIApp.PromotionEngine.levels[level];
    const metrics = LawAIApp.WorkforceSimulationEngine.getProductivityReport();
    return {
      level: levelName,
      levelIndex: level,
      completedTasks: metrics.totalCompleted,
      averagePerformance: metrics.averagePerformance,
      nextPromotionAt: 85 // 分数阈值
    };
  }
};

// 初始化
setTimeout(() => LawAIApp.CareerProgressionEngine.init(), 500);
