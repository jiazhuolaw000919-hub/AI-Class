// ===========================================
// skillTaskMatcher.js
// 技能到任务映射引擎
// ===========================================
LawAIApp.SkillTaskMatcher = {
  _taskTemplates: [],

  init() {
    // 初始化一些内置任务模板（可扩展）
    this._taskTemplates = [
      { type: 'reinforcement', category: 'AI Basics', difficulty: 1, baseTime: 10, xp: 20 },
      { type: 'simulation', category: 'Prompt Engineering', difficulty: 2, baseTime: 20, xp: 40 },
      { type: 'project', category: 'Automation', difficulty: 3, baseTime: 45, xp: 80 },
      { type: 'problem_solving', category: 'Critical Thinking', difficulty: 2, baseTime: 15, xp: 30 },
      { type: 'collaborative', category: 'AI Workflow', difficulty: 3, baseTime: 30, xp: 60 }
    ];
  },

  // 根据已认证技能和用户状态生成任务建议
  generateMatches() {
    const certificates = LawAIApp.SkillValidationEngine?.getCertificates() || [];
    const userState = LawAIApp.LearningStateManager.getState();
    const matches = [];

    certificates.forEach(cert => {
      const matchingTasks = this._taskTemplates.filter(t =>
        cert.skillName.toLowerCase().includes(t.category.toLowerCase()) ||
        t.category.toLowerCase().includes(cert.skillName.toLowerCase())
      );
      matchingTasks.forEach(task => {
        const successProb = this._calculateSuccessProbability(cert.masteryScore, task.difficulty);
        matches.push({
          taskTemplate: task,
          skillId: cert.skillId,
          skillName: cert.skillName,
          masteryScore: cert.masteryScore,
          successProbability: successProb,
          estimatedTime: task.baseTime,
          xpReward: task.xp,
          difficulty: task.difficulty
        });
      });
    });

    // 按成功概率降序排列
    matches.sort((a, b) => b.successProbability - a.successProbability);
    LawAIApp.EventBus.emit('SkillTaskMatchesGenerated', matches);
    return matches;
  },

  _calculateSuccessProbability(mastery, difficulty) {
    // 简单模型：掌握度 / (掌握度 + 难度*20)
    const prob = mastery / (mastery + difficulty * 20);
    return Math.min(1, Math.max(0, Math.round(prob * 100) / 100));
  },

  // 获取单个技能的最佳匹配
  getBestMatchForSkill(skillId) {
    const matches = this.generateMatches();
    return matches.find(m => m.skillId === skillId) || null;
  }
};

// 初始化
setTimeout(() => LawAIApp.SkillTaskMatcher.init(), 300);
