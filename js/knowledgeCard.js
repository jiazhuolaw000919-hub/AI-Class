// knowledgeCard.js
LawAIApp.KnowledgeCard = {
  _getAll() {
    return LawAIApp.StorageEngine.get('knowledge_cards', {});
  },
  _saveAll(cards) { LawAIApp.StorageEngine.set('knowledge_cards', cards); },

  // 获取或创建一张卡片
  getOrCreate(lessonId) {
    const cards = this._getAll();
    if (cards[lessonId]) return cards[lessonId];

    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return null;

    const card = {
      knowledgeId: 'kc_' + lessonId,
      lessonId: lessonId,
      title: lesson.title,
      summary: lesson.summary,
      keywords: lesson.tags || [],
      memoryHook: '',
      examples: [],
      commonMistakes: [],
      reflection: '',
      confidence: 0,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cards[lessonId] = card;
    this._saveAll(cards);
    LawAIApp.EventBus.emit('KnowledgeCreated', { knowledgeId: card.knowledgeId, lessonId });
    return card;
  },

  update(lessonId, updates) {
    const cards = this._getAll();
    if (!cards[lessonId]) return null;
    cards[lessonId] = { ...cards[lessonId], ...updates, updatedAt: new Date().toISOString(), version: (cards[lessonId].version || 1) + 1 };
    this._saveAll(cards);
    LawAIApp.EventBus.emit('KnowledgeUpdated', { knowledgeId: cards[lessonId].knowledgeId, lessonId });
    return cards[lessonId];
  },

  get(lessonId) {
    return this._getAll()[lessonId] || null;
  },

  getAllCards() {
    return Object.values(this._getAll());
  }
};
