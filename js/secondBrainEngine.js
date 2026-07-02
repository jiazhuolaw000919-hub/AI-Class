// secondBrainEngine.js
LawAIApp.SecondBrainEngine = (function() {
  // 课程完成时自动创建/更新知识卡片，并生成链接、更新置信度
  LawAIApp.EventBus.on('LessonCompleted', function(data) {
    const lessonId = data.lessonId;
    const card = LawAIApp.KnowledgeCard.getOrCreate(lessonId);
    if (card) {
      // 自动填充记忆钩子（简单示例：从标题提取）
      LawAIApp.KnowledgeCard.update(lessonId, {
        memoryHook: 'Remember: ' + card.title.split(':')[1]?.trim() || card.title
      });
      // 生成链接
      LawAIApp.KnowledgeLinker.autoLinkForLesson(lessonId);
      // 更新置信度
      LawAIApp.KnowledgeConfidence.checkDecay(lessonId);
    }
  });

  // 定期检查衰减（每天一次粗略检查，或由事件触发）
  setInterval(() => {
    LawAIApp.KnowledgeConfidence.checkAll();
  }, 3600000); // 每小时检查一次

  return {
    // 暴露统一接口
    getCard: LawAIApp.KnowledgeCard.get,
    getAllCards: LawAIApp.KnowledgeCard.getAllCards,
    getGraph: LawAIApp.KnowledgeGraph.getGraph,
    getNeighbors: LawAIApp.KnowledgeGraph.getNeighbors,
    getConfidence: LawAIApp.KnowledgeConfidence.calculate,
    search: function(query) {
      const q = query.toLowerCase();
      return LawAIApp.KnowledgeCard.getAllCards().filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.keywords.some(k => k.toLowerCase().includes(q)) ||
        c.summary.toLowerCase().includes(q)
      );
    }
  };
})();
