// ===========================================
// workforceSimulationEngine.js
// 劳动力模拟引擎：跟踪整体工作表现
// ===========================================
LawAIApp.WorkforceSimulationEngine = {
  _metricsKey: 'workforce_metrics',

  getMetrics() {
    return LawAIApp.StorageEngine.get(this._metricsKey, {
      tasksCompleted: 0,
      averagePerformance: 0,
      totalXpEarnedFromWork: 0,
      lastActive: null
    });
  },

  updateAfterTask(task) {
    const metrics = this.getMetrics();
    metrics.tasksCompleted += 1;
    metrics.totalXpEarnedFromWork += task.xpReward || 0;
    metrics.averagePerformance = metrics.tasksCompleted > 1
      ? ((metrics.averagePerformance * (metrics.tasksCompleted - 1)) + task.performanceScore) / metrics.tasksCompleted
      : task.performanceScore;
    metrics.lastActive = new Date().toISOString();
    LawAIApp.StorageEngine.set(this._metricsKey, metrics);
    LawAIApp.EventBus.emit('WorkforceMetricsUpdated', metrics);
    return metrics;
  },

  // 模拟生产率报告
  getProductivityReport() {
    const metrics = this.getMetrics();
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const efficiency = completedTasks.length
      ? completedTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0) / 60
      : 0;
    return {
      totalCompleted: metrics.tasksCompleted,
      averagePerformance: metrics.averagePerformance.toFixed(2),
      totalXpFromWork: metrics.totalXpEarnedFromWork,
      estimatedHoursWorked: efficiency.toFixed(1),
      lastActive: metrics.lastActive
    };
  }
};
