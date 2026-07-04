// ===========================================
// civilizationCoreEngine.js
// 文明核心引擎：统一调度各文明子模块
// ===========================================
LawAIApp.CivilizationCoreEngine = {
  init() {
    // 确保所有文明层模块已初始化
    // （各自模块通过 setTimeout 自动启动）
    console.log('AI Civilization Core Protocol is now active.');
  },

  // 获取文明状态快照
  getCivilizationSnapshot() {
    const health = LawAIApp.SystemHealthMonitor.getMetrics();
    const economy = LawAIApp.KnowledgeEconomyEngine.getSummary();
    const events = LawAIApp.CivilizationEventBus.getGlobalEventLog().slice(-10);
    const consensusPath = LawAIApp.CollectiveLearningProcessor.recommendGlobalPath();

    return {
      health,
      economy,
      recentGlobalEvents: events,
      globalConsensusPath: consensusPath,
      timestamp: new Date().toISOString()
    };
  }
};

// 启动文明
setTimeout(() => LawAIApp.CivilizationCoreEngine.init(), 1200);
