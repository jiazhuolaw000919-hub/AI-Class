// ===========================================
// systemBootstrapper.js
// 系统引导器：初始化文明运行时所需的所有内容
// ===========================================
LawAIApp.SystemBootstrapper = {
  async bootstrap() {
    console.log('Initiating Civilization Operating System bootstrap...');

    // 1. 激活实时图谱
    LawAIApp.LiveLearningGraph.init();

    // 2. 引导核心内容
    LawAIApp.ContentFactoryEngine.bootstrapCoreContent();

    // 3. 确保市场与证书系统运行
    if (LawAIApp.MarketplaceEngine) LawAIApp.MarketplaceEngine.init();
    if (LawAIApp.SkillValidationEngine) LawAIApp.SkillValidationEngine.init();
    if (LawAIApp.SkillWorkMatchingEngine) LawAIApp.SkillWorkMatchingEngine.init();

    // 4. 刷新全局图谱
    if (LawAIApp.GlobalKnowledgeGraph) LawAIApp.GlobalKnowledgeGraph.syncLocalGraph();

    // 5. 标记系统进入执行模式
    LawAIApp.StorageEngine.set('system_mode', 'execution');

    LawAIApp.EventBus.emit('CivOSBootComplete', { timestamp: new Date().toISOString() });
    console.log('CivOS is now in EXECUTION MODE.');
  }
};
