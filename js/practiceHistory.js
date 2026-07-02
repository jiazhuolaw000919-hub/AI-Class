// practiceHistory.js
LawAIApp.PracticeHistory = {
  _getStore() {
    return LawAIApp.StorageEngine.get('practice_history', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('practice_history', list); },

  add(record) {
    const list = this._getStore();
    list.push({ ...record, id: 'prac_' + Date.now(), completedAt: new Date().toISOString() });
    if (list.length > 200) list.splice(0, list.length - 200);
    this._save(list);
  },

  getRecent(limit = 10) {
    return this._getStore().slice(-limit).reverse();
  },

  getByLesson(lessonId) {
    return this._getStore().filter(p => p.lessonId === lessonId);
  }
};
