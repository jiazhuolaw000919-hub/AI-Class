// graphNodeManager.js
LawAIApp.GraphNodeManager = {
  _nodes: {},
  _storageKey: 'learningGraph_nodes',

  init() {
    const stored = LawAIApp.StorageEngine.get(this._storageKey, {});
    this._nodes = stored;
    // 若为空，则从现有课程初始化节点
    if (Object.keys(this._nodes).length === 0) {
      this._seedFromLessons();
    }
  },

  _save() {
    LawAIApp.StorageEngine.set(this._storageKey, this._nodes);
  },

  _seedFromLessons() {
    const lessons = LawAIApp.LessonEngine.getAllLessons();
    lessons.forEach(lesson => {
      this.addNode(lesson.lessonId, 'lesson', {
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        strength: 50,
        completed: false
      });
    });
  },

  addNode(id, type, properties = {}) {
    if (!this._nodes[id]) {
      this._nodes[id] = {
        id,
        type,
        ...properties,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this._save();
      LawAIApp.EventBus.emit('GraphNodeAdded', { id, type });
    }
    return this._nodes[id];
  },

  getNode(id) {
    return this._nodes[id] || null;
  },

  getAllNodes() {
    return Object.values(this._nodes);
  },

  updateNode(id, updates) {
    if (this._nodes[id]) {
      Object.assign(this._nodes[id], updates, { updatedAt: new Date().toISOString() });
      this._save();
      LawAIApp.EventBus.emit('GraphNodeUpdated', { id, updates });
    }
  },

  markCompleted(id) {
    this.updateNode(id, { completed: true });
    this.adjustStrength(id, 20);
  },

  adjustStrength(id, delta) {
    const node = this._nodes[id];
    if (node) {
      node.strength = Math.min(100, Math.max(0, (node.strength || 50) + delta));
      this._save();
      LawAIApp.EventBus.emit('GraphNodeStrengthChanged', { id, strength: node.strength });
    }
  },

  getNodesByType(type) {
    return this.getAllNodes().filter(n => n.type === type);
  }
};
// 初始化
setTimeout(() => LawAIApp.GraphNodeManager.init(), 100);
