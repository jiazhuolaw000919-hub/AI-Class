// graphNavigator.js
LawAIApp.GraphNavigator = {
  // 获取某个节点的所有邻居（按关系类型分组）
  getNeighbors(lessonId) {
    const rels = LawAIApp.RelationshipEngine.getRelationships(lessonId);
    const neighbors = {
      prerequisite: [],
      related: [],
      recommended_next: [],
      other: []
    };
    rels.forEach(r => {
      const otherId = r.sourceId === lessonId ? r.targetId : r.sourceId;
      const node = LawAIApp.NodeRegistry.getNode(otherId);
      if (!node) return;
      if (neighbors[r.type]) neighbors[r.type].push(node);
      else neighbors.other.push(node);
    });
    return neighbors;
  },

  // 推荐下一节点：取“recommended_next”类型邻居中未完成的
  getNextRecommendation(lessonId) {
    const neighbors = this.getNeighbors(lessonId);
    const next = neighbors.recommended_next || [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const incomplete = next.filter(n => !progress.completedLessons.includes(n.lessonId));
    return incomplete.length > 0 ? incomplete[0] : null;
  },

  // 获取学习依赖（缺失的前置知识）
  getMissingPrerequisites(lessonId) {
    const neighbors = this.getNeighbors(lessonId);
    const prereqs = neighbors.prerequisite || [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    return prereqs.filter(n => !progress.completedLessons.includes(n.lessonId));
  },

  // 发现相关内容（跨类别学习推荐）
  discoverRelated(lessonId) {
    const neighbors = this.getNeighbors(lessonId);
    const related = neighbors.related || [];
    const memory = related.map(n => ({
      ...n,
      strength: LawAIApp.MemoryEngine.getMemoryStrength(n.lessonId)
    }));
    // 按记忆强度升序排列（优先学习弱项）
    memory.sort((a, b) => a.strength - b.strength);
    return memory.slice(0, 5);
  }
};
