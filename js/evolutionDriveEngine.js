// ===========================================
// evolutionDriveEngine.js
// 进化驱动引擎：根据文明状态自动调整进化方向
// ===========================================
LawAIApp.EvolutionDriveEngine = {
  // 当前进化焦点（系统会自动选择最需要改进的维度）
  currentFocus: 'efficiency',

  // 根据系统健康指标确定进化优先级
  determineFocus() {
    const health = LawAIApp.SystemHealthMonitor.getMetrics();
    const scores = {
      efficiency: health.learningEfficiency || 50,
      memory: health.retentionEffectiveness || 50,
      taskCompletion: health.taskCompletionRate || 50,
      agentCoordination: health.agentCoordinationEfficiency || 50,
      graphOptimization: health.graphOptimizationScore || 50
    };

    // 选择得分最低的作为当前焦点
    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    this.currentFocus = sorted[0][0];

    // 启动相应的进化操作
    this.triggerEvolution(this.currentFocus);
    LawAIApp.EventBus.emit('EvolutionFocusChanged', { focus: this.currentFocus, scores });
    return this.currentFocus;
  },

  // 触发进化操作
  triggerEvolution(focus) {
    switch (focus) {
      case 'efficiency':
        LawAIApp.SelfImprovementEngine?.performSelfHealing();
        break;
      case 'memory':
        LawAIApp.GraphSignalProcessor?.reinforceRecent();
        break;
      case 'taskCompletion':
        LawAIApp.StorageEngine.set('preferred_task_difficulty', 'low');
        break;
      case 'agentCoordination':
        LawAIApp.AgentConsensusEngine?._voters?.forEach(v => v.weight = 1);
        break;
      case 'graphOptimization':
        LawAIApp.GraphSignalProcessor?.reinforceRecent();
        break;
    }
  },

  // 定期检查并驱动进化（每15分钟）
  start() {
    setInterval(() => this.determineFocus(), 900000);
    this.determineFocus(); // 立即执行一次
  }
};
