// ===========================================
// selfImprovementEngine.js
// 自我进化引擎主控
// ===========================================
LawAIApp.SelfImprovementEngine = {
  init() {
    // 定期运行系统健康检查 (每30分钟)
    setInterval(() => {
      const metrics = LawAIApp.SystemHealthMonitor.updateMetrics();
      // 如果总体健康低于阈值，触发分析修复
      if (metrics.overall < 65) {
        this.performSelfHealing();
      }
    }, 1800000);

    // 监听重大失败事件，实时触发分析
    LawAIApp.EventBus.on('QuizFailed', () => {
      LawAIApp.SystemAnalyzer.analyze();
    });
    LawAIApp.EventBus.on('TaskRejected', () => {
      LawAIApp.SystemAnalyzer.analyze();
    });

    console.log('Self-Evolving Learning System Engine activated.');
  },

  // 执行自我修复循环
  async performSelfHealing() {
    // 1. 分析系统
    const issues = LawAIApp.SystemAnalyzer.analyze();
    if (issues.length === 0) return;

    // 2. 尝试自动修复
    const fixes = await LawAIApp.AutoRefactorEngine.attemptFix(issues);

    // 3. 记录结果并学习
    fixes.forEach(f => {
      LawAIApp.MetaLearningEngine.recordOutcome(
        { type: f.issue }, f, true /* 假设成功，实际可后续验证 */);
    });

    // 4. 优化架构参数
    LawAIApp.ArchitectureOptimizer.optimize();

    console.log('Self-healing cycle completed.', { issues, fixes });
  },

  // 手动触发完整自检
  async runFullSelfCheck() {
    LawAIApp.SystemHealthMonitor.updateMetrics();
    return this.performSelfHealing();
  }
};

// 自动启动
setTimeout(() => LawAIApp.SelfImprovementEngine.init(), 1000);
