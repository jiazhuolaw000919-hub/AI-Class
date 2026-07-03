// knowledgeCapture.js
LawAIApp.KnowledgeCapture = {
  _key: 'knowledge_notes',

  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, []);
  },
  _saveAll(notes) {
    LawAIApp.StorageEngine.set(this._key, notes);
  },

  // 创建笔记
  create(noteData) {
    const notes = this._getAll();
    const note = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      tags: noteData.tags || [],
      keywords: noteData.keywords || [],
      lessonId: noteData.lessonId || null,
      moduleId: noteData.moduleId || null,
      courseId: noteData.courseId || null,
      academyId: noteData.academyId || 'academy_ai_foundation',
      isFavorite: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.unshift(note);
    this._saveAll(notes);
    return note;
  },

  // 更新笔记
  update(id, updates) {
    const notes = this._getAll();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
    this._saveAll(notes);
    return notes[idx];
  },

  // 删除笔记
  remove(id) {
    const notes = this._getAll().filter(n => n.id !== id);
    this._saveAll(notes);
  },

  // 获取单个
  getById(id) {
    return this._getAll().find(n => n.id === id) || null;
  },

  // 获取所有笔记（可按条件过滤）
  getNotes(filter = {}) {
    let notes = this._getAll();
    if (filter.lessonId) notes = notes.filter(n => n.lessonId === filter.lessonId);
    if (filter.moduleId) notes = notes.filter(n => n.moduleId === filter.moduleId);
    if (filter.courseId) notes = notes.filter(n => n.courseId === filter.courseId);
    if (filter.academyId) notes = notes.filter(n => n.academyId === filter.academyId);
    if (filter.tag) notes = notes.filter(n => n.tags.includes(filter.tag));
    if (filter.isFavorite) notes = notes.filter(n => n.isFavorite);
    if (filter.isPinned) notes = notes.filter(n => n.isPinned);
    // 按更新时间降序
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return notes;
  },

  // 切换收藏
  toggleFavorite(id) {
    const note = this.getById(id);
    if (note) this.update(id, { isFavorite: !note.isFavorite });
  },

  // 切换置顶
  togglePin(id) {
    const note = this.getById(id);
    if (note) this.update(id, { isPinned: !note.isPinned });
  },

  // 全文搜索（简单）
  search(query) {
    const q = query.toLowerCase();
    return this._getAll().filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // AI 摘要（模拟）
  generateSummary(id) {
    const note = this.getById(id);
    if (!note) return '';
    // 简单返回前50个字符作为摘要，未来可接AI
    return note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
  },

  // 获取笔记关联的课程/模块信息
  getLinkedKnowledge(id) {
    const note = this.getById(id);
    if (!note) return {};
    const links = {};
    if (note.lessonId) {
      // 尝试从LessonData获取
      const allModules = LawAIApp.ModuleData.modules;
      for (const mod of allModules) {
        const lessons = LawAIApp.LessonData ? LawAIApp.LessonData.getLessonsByModule(mod.id) : [];
        const found = lessons.find(l => l.lessonId === note.lessonId);
        if (found) {
          links.lesson = found;
          links.module = mod;
          break;
        }
      }
    }
    return links;
  }
};
