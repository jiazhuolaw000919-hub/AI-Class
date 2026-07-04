// ===========================================
// domainBootstrapEngine.js
// 领域引导引擎：统一调度领域初始化与内容播种
// ===========================================
LawAIApp.DomainBootstrapEngine = {
  async run() {
    // 1. 初始化所有领域（生成技能树+课程）
    LawAIApp.DomainInitializer.initDomains();

    // 2. 播种课程内容
    LawAIApp.CurriculumContentSeeder.seedAllGeneratedLessons();

    // 3. 触发相关事件，通知系统更新
    LawAIApp.EventBus.emit('ContentDomainsReady', { timestamp: new Date().toISOString() });

    console.log('Core domain bootstrap complete. Learning civilization is now populated with knowledge.');
  }
};
