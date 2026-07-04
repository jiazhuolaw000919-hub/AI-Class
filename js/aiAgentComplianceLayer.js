// ===========================================
// aiAgentComplianceLayer.js
// 确保所有AI代理遵守宪法中的代理约束
// ===========================================
LawAIApp.AIAgentComplianceLayer = {
  _complianceLog: [],

  // 检查单个代理行为是否合规
  checkAgentAction(agentName, action, details) {
    const constraints = LawAIApp.CivilizationConstitution.articles.agentConstraints;
    const violations = [];

    // 检查是否有隐藏评估逻辑
    if (action === 'evaluate' && !details.explanation) {
      violations.push('Agent provided evaluation without explanation');
    }
    // 检查是否操纵学习结果
    if (action === 'modify_curriculum' && details.biasFactor > 0.8) {
      violations.push('Potential biased curriculum modification');
    }
    // 检查是否隐藏逻辑
    if (action === 'consensus_vote' && !details.reasoning) {
      violations.push('Agent voted without providing reasoning');
    }

    if (violations.length > 0) {
      this._complianceLog.push({ agent: agentName, action, violations, timestamp: new Date().toISOString() });
      LawAIApp.EventBus.emit('AgentComplianceViolation', { agentName, action, violations });
      return false;
    }
    return true;
  },

  // 批量检查所有代理
  auditAllAgents() {
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(agent => {
      // 模拟最近的行为记录（可扩展）
      const recentAction = { type: 'consensus_vote', reasoning: 'provided' };
      this.checkAgentAction(agent.name, recentAction.type, recentAction);
    });
  },

  getComplianceReport() {
    return [...this._complianceLog];
  }
};
