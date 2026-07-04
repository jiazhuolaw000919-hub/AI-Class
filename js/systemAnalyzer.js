// ===========================================
// systemAnalyzer.js
// 系统分析器：检测瓶颈、低效路径
// ===========================================
LawAIApp.SystemAnalyzer = {
  analyze() {
    const issues = [];
    const health = LawAIApp.SystemHealthMonitor.getHealthSummary();
    const progress = LawAIApp.ProgressEngine.getProgress();

    // 检查学习效率
    if (health.metrics.learningEfficiency < 50) {
      issues.push({
        type: 'efficiency',
        severity: 'high',
        message: 'Learning efficiency is low. Consider adjusting curriculum difficulty or pacing.'
      });
    }

    // 检查任务完成率
    if (health.metrics.taskCompletionRate < 40) {
      issues.push({
        type: 'engagement',
        severity: 'high',
        message: 'Task completion rate is low. Review task difficulty or provide more guidance.'
      });
    }

    // 检查代理协调
    if (health.metrics.agentCoordinationEfficiency < 60) {
      issues.push({
        type: 'agent_coordination',
        severity: 'medium',
        message: 'Agent coordination could be improved. Consider rebalancing agent roles.'
      });
    }

    // 检查图谱优化
    if (health.metrics.graphOptimizationScore < 50) {
      issues.push({
        type: 'graph_structure',
        severity: 'medium',
        message: 'Learning graph has many weak nodes. Consider restructure or reinforcement paths.'
      });
    }

    // 检查记忆保持
    if (health.metrics.retentionEffectiveness < 70) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: 'Retention is declining. Increase review frequency or adjust memory scheduling.'
      });
    }

    // 记录分析结果
    LawAIApp.StorageEngine.set('system_analysis', { issues, timestamp: new Date().toISOString() });
    LawAIApp.EventBus.emit('SystemAnalysisCompleted', { issues });
    return issues;
  }
};
