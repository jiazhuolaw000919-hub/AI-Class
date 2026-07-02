// masteryEngine.js
LawAIApp.MasteryEngine = {
  _getStore() {
    return LawAIApp.StorageEngine.get('mastery_data', {});
  },
  _save(data) { LawAIApp.StorageEngine.set('mastery_data', data); },

  // 更新某个技能的掌握度
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
  }
};
