// knowledgeGraph.js
LawAIApp.KnowledgeGraph = {
  // 获取整个图谱数据
  getGraph() {
    const cards = LawAIApp.KnowledgeCard.getAllCards();
    const links = LawAIApp.KnowledgeLinker._getLinks();
    return {
      nodes: cards.map(c => ({ id: c.lessonId, label: c.title, confidence: c.confidence })),
      edges: links.map(l => ({ from: l.sourceId, to: l.targetId, type: l.type }))
    };
  },

  // 获取某个节点的邻居
  getNeighbors(lessonId) {
    const links = LawAIApp.KnowledgeLinker.getLinksForLesson(lessonId);
    const neighborIds = new Set();
    links.forEach(l => {
      if (l.sourceId === lessonId) neighborIds.add(l.targetId);
      else neighborIds.add(l.sourceId);
    });
    return Array.from(neighborIds).map(id => LawAIApp.KnowledgeCard.get(id)).filter(Boolean);
  }
};
