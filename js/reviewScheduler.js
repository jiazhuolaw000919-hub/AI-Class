// ===========================================
// reviewScheduler.js
// 复习调度器：基于遗忘曲线、弱项和项目截止日期安排复习
// ===========================================
LawAIApp.ReviewScheduler = {
  // 获取用户应复习的知识卡片
  getReviewQueue(userId) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    const now = Date.now();
    const intervals = [1, 3, 7, 14, 30]; // 天
    const dueItems = [];

    notes.forEach(note => {
      const lastReview = note.lastReview ? new Date(note.lastReview).getTime() : note.created ? new Date(note.created).getTime() : now;
      const daysSince = (now - lastReview) / (1000 * 60 * 60 * 24);
      let nextInterval = intervals[note.reviewCount] || 30;
      if (note.priority === 'high') nextInterval = Math.ceil(nextInterval * 0.7);
      if (daysSince >= nextInterval) {
        dueItems.push(note);
      }
    });

    // 按优先级排序：弱项优先，然后最近未复习的
    dueItems.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return (a.reviewCount || 0) - (b.reviewCount || 0);
    });

    return dueItems;
  },

  // 标记一个条目已复习
  markReviewed(userId, noteId) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.lastReview = new Date().toISOString();
      note.reviewCount = (note.reviewCount || 0) + 1;
      LawAIApp.StorageEngine.set(`pkos_notes_${userId}`, notes);
      LawAIApp.EventBus.emit('KnowledgeReviewed', { userId, noteId });
    }
  },

  // 从弱项技能自动创建高优先级复习卡
  addWeaknessReview(userId, skillName) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    notes.push({
      id: `review_${Date.now()}`,
      userId,
      type: 'weakness_review',
      title: `Review: ${skillName}`,
      content: { skill: skillName, suggestion: 'Focus on core concepts and practice exercises.' },
      priority: 'high',
      created: new Date().toISOString()
    });
    LawAIApp.StorageEngine.set(`pkos_notes_${userId}`, notes);
  }
};
