// nodeRegistry.js
LawAIApp.NodeRegistry = {
  _getStore() {
    return LawAIApp.StorageEngine.get('graph_nodes', []);
  },
  _save(nodes) { LawAIApp.StorageEngine.set('graph_nodes', nodes); },

  // 从所有课程初始化节点（如果尚未创建）
  initNodes() {
    const existing = this._getStore();
    if (existing.length > 0) return existing;

    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const nodes = allLessons.map(lesson => ({
      nodeId: 'node_' + lesson.lessonId,
      lessonId: lesson.lessonId,
      title: lesson.title,
      academyId: 'academy_ai',
      type: 'lesson',
      difficulty: lesson.difficulty,
      category: lesson.category,
      mastery: 0,
      status: 'active',
      tags: lesson.tags || [],
      connections: [] // 由关系引擎填充
    }));
    this._save(nodes);
    return nodes;
  },

  // 更新节点的掌握度（从Memory Engine获取）
  updateMastery(lessonId) {
    const nodes = this._getStore();
    const node = nodes.find(n => n.lessonId === lessonId);
    if (!node) return;
    const strength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
    node.mastery = strength;
    this._save(nodes);
    LawAIApp.EventBus.emit('MasteryChanged', { nodeId: node.nodeId, mastery: strength });
  },

  getNode(lessonId) {
    return this._getStore().find(n => n.lessonId === lessonId) || null;
  },

  getAllNodes() {
    return this._getStore();
  }
};
