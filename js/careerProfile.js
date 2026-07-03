// careerProfile.js
LawAIApp.CareerProfile = {
  _getStore() {
    return LawAIApp.StorageEngine.get('career_profiles', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('career_profiles', list); },

  // 创建或更新一个职业档案
  setCareer(careerDef) {
    const list = this._getStore();
    const existing = list.findIndex(c => c.careerId === careerDef.careerId);
    const now = new Date().toISOString();
    if (existing !== -1) {
      list[existing] = { ...list[existing], ...careerDef, lastUpdated: now };
    } else {
      list.push({ ...careerDef, createdAt: now, lastUpdated: now });
    }
    this._save(list);
    LawAIApp.EventBus.emit('CareerProfileUpdated', { careerId: careerDef.careerId });
  },

  // 获取所有职业档案
  getAll() {
    return this._getStore();
  },

  // 获取单个职业档案
  getCareer(careerId) {
    return this._getStore().find(c => c.careerId === careerId) || null;
  }
};
