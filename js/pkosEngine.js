// ===========================================
// pkosEngine.js
// 个人知识操作系统主引擎：统一捕获、组织、连接、复习与搜索
// ===========================================
LawAIApp.PKOSEngine = {
  // 初始化用户知识库
  init(userId) {
    LawAIApp.PKOSKnowledgeGraph.init(userId);
    // 同步现有笔记
    LawAIApp.PKOSKnowledgeGraph.syncNotesToGraph(userId);
  },

  // 一键捕获知识（文字/链接/代码等）
  captureKnowledge(userId, payload) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    const entry = {
      id: `note_${Date.now()}`,
      userId,
      type: payload.type || 'manual',
      title: payload.title || 'Untitled',
      content: payload.content,
      tags: payload.tags || [],
      skill: payload.skill || null,
      priority: payload.priority || 'normal',
      created: new Date().toISOString(),
      reviewCount: 0,
      lastReview: null
    };
    notes.unshift(entry);
    LawAIApp.StorageEngine.set(`pkos_notes_${userId}`, notes);

    // 异步更新知识图谱
    LawAIApp.PKOSKnowledgeGraph.syncNotesToGraph(userId);

    LawAIApp.EventBus.emit('KnowledgeCaptured', { userId, entry });
    return entry;
  },

  // 获取所有笔记
  getNotes(userId, limit = 50) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    return notes.slice(0, limit);
  },

  // 删除笔记
  deleteNote(userId, noteId) {
    let notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    notes = notes.filter(n => n.id !== noteId);
    LawAIApp.StorageEngine.set(`pkos_notes_${userId}`, notes);
    LawAIApp.PKOSKnowledgeGraph.syncNotesToGraph(userId);
    return true;
  },

  // 搜索
  search(userId, query) {
    return LawAIApp.SemanticSearch.search(userId, query);
  },

  // 获取复习队列
  getReviewQueue(userId) {
    return LawAIApp.ReviewScheduler.getReviewQueue(userId);
  },

  // 标记已复习
  markReviewed(userId, noteId) {
    LawAIApp.ReviewScheduler.markReviewed(userId, noteId);
  },

  // 自动生成并保存课程摘要
  async saveLessonSummary(userId, lessonId) {
    return LawAIApp.SmartSummaryEngine.saveLessonSummary(userId, lessonId);
  },

  // 获取图谱数据
  getGraph(userId) {
    return LawAIApp.PKOSKnowledgeGraph.getGraphData(userId);
  },

  // 获取相似笔记
  findSimilar(userId, noteId) {
    return LawAIApp.SemanticSearch.findSimilar(userId, noteId);
  }
};
