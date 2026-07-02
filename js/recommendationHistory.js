// recommendationHistory.js
LawAIApp.RecommendationHistory = {
  _getStore() {
    return LawAIApp.StorageEngine.get('recommendation_history', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('recommendation_history', list); },

  add(rec) {
    const list = this._getStore();
    list.push({ ...rec, status: 'active', addedAt: new Date().toISOString() });
    // 最多保留100条
    if (list.length > 100) list.splice(0, list.length - 100);
    this._save(list);
  },

  accept(id) {
    const list = this._getStore();
    const item = list.find(r => r.recommendationId === id);
    if (item) item.status = 'accepted';
    this._save(list);
    LawAIApp.EventBus.emit('RecommendationAccepted', { id });
  },

  dismiss(id) {
    const list = this._getStore();
    const item = list.find(r => r.recommendationId === id);
    if (item) item.status = 'dismissed';
    this._save(list);
    LawAIApp.EventBus.emit('RecommendationDismissed', { id });
  },

  getActive() {
    return this._getStore().filter(r => r.status === 'active');
  },

  getHistory() {
    return this._getStore();
  }
};
