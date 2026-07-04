// ===========================================
// semanticSearch.js
// 语义搜索：支持关键词、自然语言和跨概念搜索
// ===========================================
LawAIApp.SemanticSearch = {
  // 搜索用户 PKOS
  search(userId, query) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    if (!query) return notes.slice(0, 20);

    const q = query.toLowerCase();
    const results = notes.filter(note => {
      // 搜索标题、内容、标签、技能
      const title = (note.title || '').toLowerCase();
      const content = typeof note.content === 'string' ? note.content.toLowerCase() : JSON.stringify(note.content).toLowerCase();
      const tags = (note.tags || []).join(' ').toLowerCase();
      const skill = (note.skill || '').toLowerCase();
      return title.includes(q) || content.includes(q) || tags.includes(q) || skill.includes(q);
    });

    // 也支持简单的自然语言查询：如果查询包含 "related to"，尝试查找概念相似项
    if (q.includes('related to') || q.includes('similar to')) {
      const concept = q.replace(/related to|similar to/gi, '').trim();
      // 基于标签匹配扩展
      const related = notes.filter(n => n.tags && n.tags.some(tag => tag.toLowerCase().includes(concept)));
      results.push(...related);
    }

    // 去重并按创建时间排序
    return [...new Map(results.map(r => [r.id, r])).values()].sort((a,b) => new Date(b.created) - new Date(a.created)).slice(0, 20);
  },

  // 语义相似度模拟 (未来可接 AI)
  findSimilar(userId, noteId) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    const note = notes.find(n => n.id === noteId);
    if (!note) return [];
    // 找出相同标签或相关技能的其他笔记
    return notes.filter(n => n.id !== noteId && n.tags && note.tags && n.tags.some(t => note.tags.includes(t)));
  }
};
