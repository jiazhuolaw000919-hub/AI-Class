// knowledgeLinker.js
LawAIApp.KnowledgeLinker = {
  _getLinks() {
    return LawAIApp.StorageEngine.get('knowledge_links', []);
  },
  _saveLinks(links) { LawAIApp.StorageEngine.set('knowledge_links', links); },

  // 自动生成链接：基于共享关键词、相同类别、前置关系等
  autoLinkForLesson(lessonId) {
    const card = LawAIApp.KnowledgeCard.get(lessonId);
    if (!card) return;
    const allCards = LawAIApp.KnowledgeCard.getAllCards().filter(c => c.lessonId !== lessonId);
    const links = this._getLinks();

    allCards.forEach(other => {
      // 共享关键词
      const commonTags = card.keywords.filter(k => other.keywords.includes(k));
      if (commonTags.length > 0 && !links.some(l => (l.sourceId === lessonId && l.targetId === other.lessonId) || (l.sourceId === other.lessonId && l.targetId === lessonId))) {
        links.push({
          sourceId: lessonId,
          targetId: other.lessonId,
          type: 'related',
          weight: commonTags.length
        });
      }
      // 相同类别（不同课程）
      const lesson1 = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
      const lesson2 = LawAIApp.LessonEngine.getLessonByDay(parseInt(other.lessonId.split('-')[1]));
      if (lesson1 && lesson2 && lesson1.category === lesson2.category && lesson1.courseId !== lesson2.courseId) {
        if (!links.some(l => (l.sourceId === lessonId && l.targetId === other.lessonId && l.type === 'cross') || (l.sourceId === other.lessonId && l.targetId === lessonId && l.type === 'cross'))) {
          links.push({ sourceId: lessonId, targetId: other.lessonId, type: 'cross', weight: 1 });
        }
      }
    });

    this._saveLinks(links);
    LawAIApp.EventBus.emit('KnowledgeLinked', { lessonId });
  },

  getLinksForLesson(lessonId) {
    return this._getLinks().filter(l => l.sourceId === lessonId || l.targetId === lessonId);
  }
};
