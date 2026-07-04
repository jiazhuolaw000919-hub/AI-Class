// ===========================================
// systemHealthMonitor.js
// 系统健康监控器：持续追踪系统级指标
// ===========================================
LawAIApp.SystemHealthMonitor = {
  _metricsKey: 'system_health_metrics',

  getMetrics() {
    return LawAIApp.StorageEngine.get(this._metricsKey, {
      learningEfficiency: 100,
      retentionEffectiveness: 100,
      taskCompletionRate: 100,
      agentCoordinationEfficiency: 100,
      graphOptimizationScore: 100,
      lastCheck: null
    });
  },

  // 更新指标（在关键事件后调用）
  updateMetrics() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const memHealth = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const taskCompletionRate = tasks.length > 0 ? completedTasks.length / tasks.length * 100 : 100;

    // 代理协调效率：基于最近共识成功次数 (简化)
    const consensusEvents = LawAIApp.AnalyticsStorage.getEventLog()
      .filter(e => e.eventType === 'ConsensusReached' || e.eventType === 'ProposalAccepted');
    const agentEfficiency = Math.min(100, consensusEvents.length * 10);

    // 图优化分数：弱区比例越低越好
    const nodes = LawAIApp.GraphNodeManager?.getAllNodes() || [];
    const weakNodes = nodes.filter(n => n.strength < 40).length;
    const graphScore = nodes.length > 0 ? Math.max(0, 100 - (weakNodes / nodes.length) * 100) : 100;

    const metrics = {
      learningEfficiency: Math.min(100, progress.completionPercent * 1.2),
      retentionEffectiveness: memHealth,
      taskCompletionRate: Math.round(taskCompletionRate),
      agentCoordinationEfficiency: agentEfficiency,
      graphOptimizationScore: Math.round(graphScore),
      lastCheck: new Date().toISOString()
    };

    LawAIApp.StorageEngine.set(this._metricsKey, metrics);
    LawAIApp.EventBus.emit('SystemHealthUpdated', metrics);
    return metrics;
  },

  // 获取健康摘要
  getHealthSummary() {
    const m = this.getMetrics();
    const avg = (m.learningEfficiency + m.retentionEffectiveness + m.taskCompletionRate +
                 m.agentCoordinationEfficiency + m.graphOptimizationScore) / 5;
    return { metrics: m, overall: Math.round(avg) };
  }
};
