// ===========================================
// architectureOptimizer.js
// 架构优化器：调整系统内部参数以提高性能
// ===========================================
LawAIApp.ArchitectureOptimizer = {
  // 运行优化循环，返回优化建议
  optimize() {
    const health = LawAIApp.SystemHealthMonitor.getMetrics();
    const changes = [];

    // 如果学习效率低，降低难度基础值
    if (health.learningEfficiency < 50) {
      const currentDifficulty = LawAIApp.StorageEngine.get('preferred_task_difficulty', 'normal');
      if (currentDifficulty !== 'low') {
        LawAIApp.StorageEngine.set('preferred_task_difficulty', 'low');
        changes.push({ parameter: 'task_difficulty', old: currentDifficulty, new: 'low' });
      }
    }

    // 如果记忆保留低，增加复习频率（调整遗忘曲线衰减因子）——这里为示意，实际可调MemoryScheduler
    if (health.retentionEffectiveness < 70) {
      LawAIApp.EventBus.emit('MemoryRetentionBoostRequired');
      changes.push({ parameter: 'review_intensity', old: 'normal', new: 'increased' });
    }

    // 如果代理协调低，重置权重
    if (health.agentCoordinationEfficiency < 60) {
      LawAIApp.AgentConsensusEngine?._voters?.forEach(v => v.weight = 1);
      changes.push({ parameter: 'agent_weights', old: 'varied', new: 'reset' });
    }

    // 记录变更
    if (changes.length > 0) {
      LawAIApp.EventBus.emit('ArchitectureOptimized', { changes });
    }
    return changes;
  }
};
