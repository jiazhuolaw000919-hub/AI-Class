// ===========================================
// conflictResolutionSystem.js
// 冲突解决系统：解决大学间、代理间、课程间的冲突
// ===========================================
LawAIApp.ConflictResolutionSystem = {
  _resolutionLog: [],

  // 当检测到代理共识失败时，启动调解
  mediateConsensus(proposal) {
    // 尝试寻找折中方案
    const alternative = {
      ...proposal,
      priority: 'medium',
      action: this._findCompromiseAction(proposal.action)
    };
    LawAIApp.AgentConsensusEngine.propose(alternative);
    this._logResolution('agent_consensus', proposal.id, 'compromise_proposed');
    return alternative;
  },

  _findCompromiseAction(action) {
    const compromises = {
      'adjust_schedule': 'review_weak_concepts',
      'accelerate_roadmap': 'maintain_current_plan',
      'remediation': 'optional_review'
    };
    return compromises[action] || 'standard_procedure';
  },

  // 解决大学间标准冲突（例如一个大学认证的技能在另一大学不被承认）
  resolveSkillRecognition(skillId, fromUniversity, toUniversity) {
    // 默认采用全球标准引擎的判断
    const valid = LawAIApp.GlobalStandardEngine.validateSkillForCertification(skillId).valid;
    if (valid) {
      LawAIApp.CrossUniversityCreditSystem.transferCredit(
        LawAIApp.StudentTrackingSystem.getCurrentStudent().id,
        skillId,
        fromUniversity,
        75 // 默认分数
      );
      return { resolved: true, action: 'credit_transferred' };
    }
    return { resolved: false, reason: 'Skill does not meet global standards' };
  },

  _logResolution(type, subject, outcome) {
    this._resolutionLog.push({
      type, subject, outcome, timestamp: new Date().toISOString()
    });
    if (this._resolutionLog.length > 50) this._resolutionLog.splice(0, this._resolutionLog.length - 50);
  }
};
