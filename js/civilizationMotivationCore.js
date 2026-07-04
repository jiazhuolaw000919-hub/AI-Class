// ===========================================
// civilizationMotivationCore.js
// 文明动机核心：定义并维护文明的进化驱动力
// ===========================================
LawAIApp.CivilizationMotivationCore = {
  // 核心驱动力指标
  drives: {
    humanPotentialAmplification: 100,   // 最大化人类学习能力
    knowledgeEvolution: 100,            // 持续改进知识结构
    intelligenceExpansion: 100,         // 扩展推理能力
    efficiencyOptimization: 100,        // 优化学习效率
    fairnessEnhancement: 100            // 提升教育公平性
  },

  // 动机状态（每24小时衰减，但不会低于基础值）
  motivationState: {
    overallMotivation: 100,
    lastReinforced: new Date().toISOString(),
    decayRate: 5 // 每天衰减5点，但可通过学习活动补充
  },

  // 强化动机：当发生重要学习事件时调用
  reinforceMotivation(amount = 10) {
    this.motivationState.overallMotivation = Math.min(100, this.motivationState.overallMotivation + amount);
    this.motivationState.lastReinforced = new Date().toISOString();
    LawAIApp.EventBus.emit('MotivationReinforced', { level: this.motivationState.overallMotivation });
  },

  // 检查动机是否充足
  checkMotivation() {
    // 模拟随时间衰减
    const hoursSince = (Date.now() - new Date(this.motivationState.lastReinforced).getTime()) / 3600000;
    const decay = Math.floor(hoursSince / 24) * this.motivationState.decayRate;
    this.motivationState.overallMotivation = Math.max(30, 100 - decay);
    return this.motivationState.overallMotivation;
  },

  // 获取驱动状态报告
  getReport() {
    return {
      drives: { ...this.drives },
      motivation: { ...this.motivationState, current: this.checkMotivation() }
    };
  }
};

// 监听学习事件，自动强化动机
LawAIApp.EventBus.on('LessonCompleted', () => LawAIApp.CivilizationMotivationCore.reinforceMotivation(5));
LawAIApp.EventBus.on('SkillCertified', () => LawAIApp.CivilizationMotivationCore.reinforceMotivation(10));
LawAIApp.EventBus.on('ProjectFinished', () => LawAIApp.CivilizationMotivationCore.reinforceMotivation(15));
