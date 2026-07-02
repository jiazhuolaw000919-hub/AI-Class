// xpHistory.js
LawAIApp.XPHistory = {
  getHistory() {
    return LawAIApp.StorageEngine.get('xp_history', []);
  },

  addEntry(entry) {
    const history = this.getHistory();
    history.push({
      timestamp: new Date().toISOString(),
      ...entry,
      id: 'xp_' + Date.now() + Math.random().toString(36)
    });
    // 只保留最近 200 条
    if (history.length > 200) history.splice(0, history.length - 200);
    LawAIApp.StorageEngine.set('xp_history', history);
    return entry;
  },

  getTodayXP() {
    const today = new Date().toDateString();
    return this.getHistory()
      .filter(e => new Date(e.timestamp).toDateString() === today)
      .reduce((sum, e) => sum + e.finalXP, 0);
  }
};
