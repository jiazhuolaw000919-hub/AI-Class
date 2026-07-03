// conversationMemory.js
LawAIApp.ConversationMemory = {
  _keyHistory: 'conversationHistory',
  _keyPinned: 'pinnedConversations',

  getHistory() {
    return LawAIApp.StorageEngine.get(this._keyHistory, []);
  },
  addMessage(role, content, metadata = {}) {
    const history = this.getHistory();
    history.push({
      id: 'msg_' + Date.now(),
      role,
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    // 保留最近100条
    if (history.length > 100) history.splice(0, history.length - 100);
    LawAIApp.StorageEngine.set(this._keyHistory, history);
    return history;
  },
  clearHistory() {
    LawAIApp.StorageEngine.set(this._keyHistory, []);
  },
  getPinned() {
    return LawAIApp.StorageEngine.get(this._keyPinned, []);
  },
  togglePin(conversationId) {
    const pinned = this.getPinned();
    const idx = pinned.indexOf(conversationId);
    if (idx === -1) pinned.push(conversationId);
    else pinned.splice(idx, 1);
    LawAIApp.StorageEngine.set(this._keyPinned, pinned);
    return pinned;
  }
};
