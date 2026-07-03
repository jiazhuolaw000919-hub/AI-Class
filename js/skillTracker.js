// skillTracker.js
LawAIApp.SkillTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('skills', {});
  },
  _save(store) { LawAIApp.StorageEngine.set('skills', store); },

  // 注册新技能（如果不存在）
  register(skillId, skillDef) {
    const store = this._getStore();
    if (store[skillId]) return store[skillId];
    store[skillId] = {
      skillId,
      ...skillDef,
      mastery: 0,
      confidence: 50,
      practiceCount: 0,
      projectCount: 0,
      lastUpdated: new Date().toISOString(),
      relatedLessons: skillDef.relatedLessons || [],
      relatedProjects: []
    };
    this._save(store);
    LawAIApp.EventBus.emit('SkillUnlocked', { skillId, skill: store[skillId] });
    return store[skillId];
  },

  // 增加技能经验（来自练习/项目/课程）
  addExperience(skillId, source, amount = 5) {
    const store = this._getStore();
    if (!store[skillId]) return;
    const skill = store[skillId];
    if (source === 'practice') skill.practiceCount += 1;
    if (source === 'project') skill.projectCount += 1;
    skill.mastery = Math.min(100, skill.mastery + amount);
    skill.confidence = Math.min(100, skill.confidence + amount * 0.5);
    skill.lastUpdated = new Date().toISOString();
    this._save(store);
    LawAIApp.EventBus.emit('SkillUpdated', { skillId, mastery: skill.mastery });
    this._checkMasteryLevel(skillId);
  },

  // 获取技能数据
  getSkill(skillId) {
    return this._getStore()[skillId] || null;
  },

  getAllSkills() {
    return Object.values(this._getStore());
  },

  // 检查掌握等级并发送事件
  _checkMasteryLevel(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return;
    const levels = [
      { min: 0, label: 'Beginner' },
      { min: 20, label: 'Learner' },
      { min: 40, label: 'Practitioner' },
      { min: 60, label: 'Advanced' },
      { min: 80, label: 'Expert' },
      { min: 95, label: 'Master' }
    ];
    const newLevel = levels.reduce((prev, curr) => skill.mastery >= curr.min ? curr : prev, levels[0]).label;
    if (skill.currentLevel !== newLevel) {
      skill.currentLevel = newLevel;
      this._save(this._getStore());
      LawAIApp.EventBus.emit('MasteryReached', { skillId, level: newLevel });
    }
  },

  // 衰减检测（长期未练习降低信心）
  checkDecay() {
    const store = this._getStore();
    const now = Date.now();
    Object.values(store).forEach(skill => {
      const daysSince = (now - new Date(skill.lastUpdated).getTime()) / 86400000;
      if (daysSince > 30 && skill.confidence > 30) {
        skill.confidence = Math.max(30, skill.confidence - 5);
        skill.lastUpdated = new Date().toISOString();
        LawAIApp.EventBus.emit('SkillDecayDetected', { skillId: skill.skillId, newConfidence: skill.confidence });
      }
    });
    this._save(store);
  }
};
