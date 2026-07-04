// ===========================================
// aiGovernanceEngine.js
// AI 治理引擎：协调代理冲突，平衡全局参数
// ===========================================
LawAIApp.AIGovernanceEngine = {
  _rules: {
    maxDifficulty: 3,
    minEngagementThreshold: 40,
    agentVoteWeightCap: 5,
    graphHealthMin: 50
  },

  init() {
    // 监听全局事件，执行治理策略
    LawAIApp.EventBus.on('SystemHealthUpdated', (metrics) => {
      this.enforceGovernance(metrics);
    });
    LawAIApp.EventBus.on('ProposalRejected', (prop) => {
      this.resolveConflict(prop);
    });
  },

  enforceGovernance(metrics) {
    // 如果任务完成率过低，强制降低任务难度上限
    if (metrics.taskCompletionRate < this._rules.minEngagementThreshold) {
      LawAIApp.StorageEngine.set('preferred_task_difficulty', 'low');
      LawAIApp.EventBus.emit('GovernanceAction', {
        action: 'cap_difficulty',
        reason: 'Low engagement',
        value: 'low'
      });
    }

    // 如果图谱健康度过低，触发全局强化信号
    if (metrics.graphOptimizationScore < this._rules.graphHealthMin) {
      LawAIApp.GraphSignalProcessor.reinforceRecent();
      LawAIApp.EventBus.emit('GovernanceAction', {
        action: 'global_reinforcement',
        reason: 'Graph health decline'
      });
    }

    // 限制代理投票权重，防止单一代理垄断
    const voters = LawAIApp.AgentConsensusEngine?._voters || [];
    voters.forEach(v => {
      if (v.weight > this._rules.agentVoteWeightCap) v.weight = this._rules.agentVoteWeightCap;
    });
  },

  resolveConflict(proposal) {
    // 简单冲突解决：提出备选方案并重新投票
    const alternative = {
      ...proposal,
      action: proposal.action === 'adjust_schedule' ? 'review_weak_concepts' : 'adjust_schedule',
      priority: 'medium'
    };
    LawAIApp.AgentConsensusEngine.propose(alternative);
  }
};

// 自动初始化
setTimeout(() => LawAIApp.AIGovernanceEngine.init(), 600);
