// graphRenderer.js
LawAIApp.GraphRenderer = {
  // 生成可用于可视化的图数据（节点和边列表）
  getGraphData(limit = 50) {
    const nodes = LawAIApp.NodeRegistry.getAllNodes().slice(0, limit);
    const nodeIds = new Set(nodes.map(n => n.lessonId));
    const relationships = LawAIApp.RelationshipEngine._getStore()
      .filter(r => nodeIds.has(r.sourceId) && nodeIds.has(r.targetId));

    return {
      nodes: nodes.map(n => ({
        id: n.lessonId,
        label: n.title,
        group: n.category,
        mastery: n.mastery,
        difficulty: n.difficulty
      })),
      edges: relationships.map(r => ({
        from: r.sourceId,
        to: r.targetId,
        type: r.type
      }))
    };
  },

  // 生成学习路径地图（从起点到终点的路径）
  getPathMap(startLessonId, endLessonId) {
    // 简化：返回从起点到终点按顺序的节点列表（假设线性）
    const startDay = parseInt(startLessonId.split('-')[1]);
    const endDay = parseInt(endLessonId.split('-')[1]);
    const nodes = [];
    for (let d = startDay; d <= endDay; d++) {
      const node = LawAIApp.NodeRegistry.getNode('day-' + d);
      if (node) nodes.push(node);
    }
    return nodes;
  }
};
