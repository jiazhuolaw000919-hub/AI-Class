// masteryEngine.js (Phase 23 + Phase 32 合并)
LawAIApp.MasteryEngine = {
  // ===== Phase 23 原有功能（不变）=====
  _getStore() {
    return LawAIApp.StorageEngine.get('mastery_data', {});
  },
  _save(data) { LawAIApp.StorageEngine.set('mastery_data', data); },

  // 更新某个技能的掌握度（Phase 23）
  updateSkill(skillName, progressDelta, confidenceDelta = 0) {
    const store = this._getStore();
    if (!store[skillName]) {
      store[skillName] = { progress: 0, confidence: 0, lastPracticed: null };
    }
    const skill = store[skillName];
    skill.progress = Math.min(100, skill.progress + progressDelta);
    skill.confidence = Math.min(100, skill.confidence + confidenceDelta);
    skill.lastPracticed = new Date().toISOString();
    this._save(store);
    LawAIApp.EventBus.emit('MasteryUpdated', { skill: skillName, progress: skill.progress });
  },

  getSkill(skillName) {
    return this._getStore()[skillName] || { progress: 0, confidence: 0 };
  },

  getAllSkills() {
    return Object.entries(this._getStore()).map(([name, data]) => ({ name, ...data }));
  },

  // ===== Phase 32 新增功能 =====

  // 获取掌握度级别名称
  getLevelName(mastery) {
    if (mastery >= 95) return 'Master';
    if (mastery >= 80) return 'Expert';
    if (mastery >= 60) return 'Advanced';
    if (mastery >= 40) return 'Practitioner';
    if (mastery >= 20) return 'Learner';
    return 'Beginner';
  },

  // 根据技能列表计算整体掌握度
  calculateOverallMastery() {
    const skills = this.getAllSkills();
    if (skills.length === 0) return { overall: 0, level: 'Beginner' };
    const avg = skills.reduce((sum, s) => sum + (s.progress || 0), 0) / skills.length;
    return { overall: Math.round(avg), level: this.getLevelName(avg) };
  },

  // 获取推荐提升的技能（最弱的前三个）
  getWeakestSkills(limit = 3) {
    return this.getAllSkills()
      .sort((a, b) => (a.progress || 0) - (b.progress || 0))
      .slice(0, limit);
  }
};
