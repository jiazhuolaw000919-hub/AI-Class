// ===========================================
// promotionEngine.js
// 晋升引擎：根据绩效自动调整职业级别
// ===========================================
LawAIApp.PromotionEngine = {
  levels: [
    'Intern Learner',
    'Junior Practitioner',
    'Skilled Operator',
    'Advanced Specialist',
    'Expert Performer',
    'Elite Master'
  ],

  _currentLevelKey: 'career_level',

  getCurrentLevel() {
    return LawAIApp.StorageEngine.get(this._currentLevelKey, 0);
  },

  setLevel(index) {
    const clamped = Math.min(this.levels.length - 1, Math.max(0, index));
    LawAIApp.StorageEngine.set(this._currentLevelKey, clamped);
    return this.levels[clamped];
  },

  // 执行晋升评估
  async evaluatePromotion() {
    const overallScore = await this._calculateOverallPerformanceScore();
    const currentIndex = this.getCurrentLevel();
    let newIndex = currentIndex;
    let action = 'maintain';

    if (overallScore >= 85 && currentIndex < this.levels.length - 1) {
      newIndex = currentIndex + 1;
      action = 'promote';
    } else if (overallScore < 40 && currentIndex > 0) {
      newIndex = currentIndex - 1;
      action = 'demote';
    } else if (overallScore < 55 && currentIndex > 0) {
      action = 'retrain';
    }

    const newLevel = this.setLevel(newIndex);
    LawAIApp.EventBus.emit('PromotionEvaluated', {
      oldLevel: this.levels[currentIndex],
      newLevel,
      action,
      overallScore
    });
    return { action, level: newLevel, overallScore };
  },

  async _calculateOverallPerformanceScore() {
    const skillIds = Object.keys(LawAIApp.SkillTracker?._getStore() || {});
    if (skillIds.length === 0) return 50;
    const scores = skillIds.map(id => LawAIApp.SkillScoringSystem.calculateSkillScore(id));
    const avgSkillScore = scores.reduce((a,b) => a+b, 0) / scores.length;

    const reliability = LawAIApp.SkillScoringSystem.calculateReliabilityScore();
    const consistency = LawAIApp.SkillScoringSystem.calculateConsistencyIndex();
    const agentEval = (await LawAIApp.AgentEvaluationCore.evaluateOverallPerformance()).average;

    // 最终绩效分 = 技能平均 30% + 可靠性 20% + 一致性 20% + 代理评价 30%
    return Math.round(
      avgSkillScore * 0.3 + reliability * 0.2 + consistency * 0.2 + agentEval * 0.3
    );
  }
};
