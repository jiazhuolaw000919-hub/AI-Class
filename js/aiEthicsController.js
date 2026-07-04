// ===========================================
// aiEthicsController.js
// AI伦理控制器：确保系统公平、透明、无偏见
// ===========================================
LawAIApp.AIEthicsController = {
  // 检查课程生成是否公平（无歧视性内容）
  reviewCurriculumContent(contentText) {
    // 模拟检查：标记包含不当词汇的内容
    const forbiddenWords = ['biased', 'discriminatory', 'unfair'];
    const found = forbiddenWords.filter(word => contentText.toLowerCase().includes(word));
    if (found.length > 0) {
      LawAIApp.EventBus.emit('EthicsViolation', { type: 'curriculum_bias', details: found });
      return { approved: false, reason: 'Biased content detected' };
    }
    return { approved: true };
  },

  // 监督代理行为权重，防止垄断
  enforceAgentFairness() {
    const voters = LawAIApp.AgentConsensusEngine?._voters || [];
    const maxWeight = LawAIApp.GlobalStandardEngine.standards.agent.maxVoteWeight;
    voters.forEach(v => {
      if (v.weight > maxWeight) {
        v.weight = maxWeight;
        LawAIApp.EventBus.emit('EthicsViolation', { type: 'agent_weight_capped', agent: v.name });
      }
    });
  },

  // 确保评估过程透明（日志记录）
  logEvaluation(agentName, decision, reasoning) {
    const log = LawAIApp.StorageEngine.get('ethics_log', []);
    log.push({ agent: agentName, decision, reasoning, timestamp: new Date().toISOString() });
    if (log.length > 100) log.splice(0, log.length - 100);
    LawAIApp.StorageEngine.set('ethics_log', log);
  },

  // 检查系统健康状况是否公平（如所有用户有一致标准）
  auditFairness() {
    const metrics = LawAIApp.SystemHealthMonitor.getMetrics();
    const issues = [];
    if (metrics.taskCompletionRate < 20) {
      issues.push('Low task completion may indicate difficulty bias');
    }
    return issues;
  }
};
