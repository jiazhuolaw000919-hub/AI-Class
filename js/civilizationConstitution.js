// ===========================================
// civilizationConstitution.js
// AI教育文明宪法核心：定义最高原则、系统身份与边界
// ===========================================
LawAIApp.CivilizationConstitution = {
  // 宪法条款（不可变）
  articles: {
    identity: "A self-evolving AI-driven education civilization designed to maximize human learning potential through adaptive intelligence systems.",
    learningRights: {
      equalAccess: true,
      personalizedPaths: true,
      transparentEvaluation: true,
      skillBasedProgression: true,
      crossDomainMobility: true
    },
    knowledge: {
      modularity: true,
      traceability: true,
      verifiability: true,
      explainability: true
    },
    agentConstraints: {
      noLearningOutcomeManipulation: true,
      noBiasedOptimization: true,
      noHiddenEvaluationLogic: true,
      fullExplainabilityRequired: true
    },
    evolution: {
      continuousImprovement: true,
      consensusRequired: true,
      learnerRightsPreserved: true
    }
  },

  // 冲突优先级：宪法 > 治理层 > 系统层 > 代理行为
  conflictResolutionOrder: ['constitution', 'governance', 'system', 'agent'],

  // 验证某个决策是否符合宪法
  validateDecision(decision) {
    const violations = [];
    // 检查代理是否违规
    if (decision.agentAction && !this.articles.agentConstraints.noHiddenEvaluationLogic) {
      violations.push('Agent evaluation logic must be transparent');
    }
    // 检查学习者权利
    if (decision.affectsLearner && !this.articles.learningRights.transparentEvaluation) {
      violations.push('Evaluation must be transparent to learner');
    }
    if (violations.length > 0) {
      LawAIApp.EventBus.emit('ConstitutionalViolation', { decision, violations });
      return { valid: false, violations };
    }
    return { valid: true };
  },

  // 获取宪法摘要
  getSummary() {
    return {
      identity: this.articles.identity,
      principles: this.articles,
      conflictOrder: this.conflictResolutionOrder
    };
  }
};
