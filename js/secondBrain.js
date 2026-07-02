// secondBrain.js
LawAIApp.SecondBrain = {
  // 自动创建或获取一个课程的 Second Brain 条目
  getEntry(lessonId) {
    const entries = LawAIApp.StorageEngine.get('secondBrain', {});
    if (!entries[lessonId]) {
      const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
      if (!lesson) return null;
      entries[lessonId] = {
        lessonId,
        title: lesson.title,
        summary: lesson.summary,
        notes: lesson.notes || [],
        keywords: lesson.tags,
        practice: lesson.practice || [],
        quiz: lesson.quiz || [],
        tags: lesson.tags,
        reviewLevel: lesson.reviewLevel,
        completedDate: lesson.completedDate || null,
        futureAIReflection: ''
      };
      LawAIApp.StorageEngine.set('secondBrain', entries);
    }
    return entries[lessonId];
  },

  // 更新条目中的某个字段（例如笔记）
  updateEntry(lessonId, updates) {
    const entries = LawAIApp.StorageEngine.get('secondBrain', {});
    if (!entries[lessonId]) this.getEntry(lessonId); // 确保存在
    entries[lessonId] = { ...entries[lessonId], ...updates };
    LawAIApp.StorageEngine.set('secondBrain', entries);
  },

  // 获取所有 Second Brain 条目列表
  getAllEntries() {
    const entries = LawAIApp.StorageEngine.get('secondBrain', {});
    return Object.values(entries);
  },

  // 搜索 Second Brain
  search(query) {
    const all = this.getAllEntries();
    const q = query.toLowerCase();
    return all.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.keywords.some(k => k.includes(q)) ||
      e.tags.some(t => t.includes(q))
    );
  }
};
