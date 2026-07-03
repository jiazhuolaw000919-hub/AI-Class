// knowledgeAnalytics.js
LawAIApp.KnowledgeAnalytics = {
  getStats() {
    const notes = LawAIApp.KnowledgeCapture.getNotes();
    const total = notes.length;
    const favorites = notes.filter(n => n.isFavorite).length;
    const pinned = notes.filter(n => n.isPinned).length;
    const topics = new Set();
    notes.forEach(n => n.tags.forEach(tag => topics.add(tag)));
    const weekly = notes.filter(n => new Date(n.createdAt) > Date.now() - 7*86400000).length;
    return { total, favorites, pinned, topicsCount: topics.size, weekly };
  }
};
