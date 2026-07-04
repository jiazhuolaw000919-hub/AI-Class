// ===========================================
// civilizationRuntime.js
// 文明运行时：持续驱动文明活动
// ===========================================
LawAIApp.CivilizationRuntime = {
  init() {
    // 定期执行文明心跳（每5分钟）
    setInterval(() => {
      this.pulse();
    }, 300000);

    // 立即执行一次
    this.pulse();

    // 监听关键事件，实时响应
    LawAIApp.EventBus.on('CivOSBootComplete', () => {
      console.log('Civilization runtime reacting to boot completion.');
    });
    LawAIApp.EventBus.on('GlobalPathGenerated', (path) => {
      // 将最佳路径推送到市场
      const assetId = 'global_consensus_path';
      LawAIApp.LearningAssetManager.addAsset({
        id: assetId,
        type: 'learning_path',
        title: 'Global Consensus Path',
        description: 'Optimal path determined by the AI civilization.',
        creator: 'CivOS',
        lessons: path.path,
        effectivenessScore: 90,
        rating: 5
      });
    });
  },

  pulse() {
    // 更新系统健康并自我调节
    LawAIApp.SystemHealthMonitor.updateMetrics();
    const health = LawAIApp.SystemHealthMonitor.getHealthSummary();
    if (health.overall < 65) {
      LawAIApp.SelfImprovementEngine.performSelfHealing();
    }
    // 生成经济快照（日志）
    const economy = LawAIApp.KnowledgeEconomyEngine.getSummary();
    console.log(`[CivOS Pulse] Health: ${health.overall}, Knowledge Points: ${economy.totalKnowledgePoints}`);
  }
};

// 等待引导完成后启动
setTimeout(() => {
  if (LawAIApp.StorageEngine.get('system_mode') === 'execution') {
    LawAIApp.CivilizationRuntime.init();
  } else {
    LawAIApp.EventBus.on('CivOSBootComplete', () => LawAIApp.CivilizationRuntime.init());
  }
}, 2000);
