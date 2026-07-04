// ===========================================
// infiniteLearningEngine.js
// 无限学习引擎：实现持续观察→学习→生成→验证→部署→进化的循环
// ===========================================
LawAIApp.InfiniteLearningEngine = {
  _cycleCount: 0,
  _active: false,

  // 启动无限循环
  start() {
    if (this._active) return;
    this._active = true;
    console.log('[InfiniteLoop] Starting infinite learning cycle.');
    this._runCycle(); // 立即执行一次
    // 每10分钟运行一次完整循环
    this._interval = setInterval(() => this._runCycle(), 600000);
  },

  // 暂停循环
  stop() {
    this._active = false;
    if (this._interval) clearInterval(this._interval);
  },

  async _runCycle() {
    this._cycleCount++;
    const log = console.log.bind(console, `[Cycle ${this._cycleCount}]`);

    // 阶段1：观察
    log('Observing system health...');
    const health = LawAIApp.SystemHealthMonitor.updateMetrics();

    // 阶段2：学习（分析）
    log('Analyzing gaps...');
    const issues = LawAIApp.SystemAnalyzer.analyze();

    // 阶段3：生成（改进方案）
    if (issues.length > 0) {
      log(`Detected ${issues.length} issues. Generating improvements...`);
      // 自我修复
      await LawAIApp.AutoRefactorEngine.attemptFix(issues);
      // 架构优化
      LawAIApp.ArchitectureOptimizer.optimize();
    }

    // 阶段4：验证
    log('Validating improvements...');
    LawAIApp.SystemHealthMonitor.updateMetrics();
    const newHealth = LawAIApp.SystemHealthMonitor.getMetrics();

    // 阶段5：部署（已在前面的步骤中完成）

    // 阶段6：进化
    log('Evolving civilization...');
    LawAIApp.CivilizationIdentityCore.refreshSelfState();
    LawAIApp.CollectiveMemorySystem?.takeSnapshot();

    // 发布循环完成事件
    LawAIApp.EventBus.emit('LearningCycleCompleted', {
      cycle: this._cycleCount,
      healthBefore: health,
      healthAfter: newHealth,
      issuesResolved: issues.length
    });

    log(`Cycle completed. Health: ${health.overall || 'N/A'} → ${newHealth.overall || 'N/A'}`);
  },

  getStatus() {
    return {
      active: this._active,
      cyclesCompleted: this._cycleCount,
      nextCycleIn: this._interval ? '10 minutes' : 'stopped'
    };
  }
};
