// graphEdgeManager.js
LawAIApp.GraphEdgeManager = {
  _edges: [],
  _storageKey: 'learningGraph_edges',

  init() {
    const stored = LawAIApp.StorageEngine.get(this._storageKey, []);
    this._edges = stored;
    if (this._edges.length === 0) {
      this._seedDefaultEdges();
    }
  },

  _save() {
    LawAIApp.StorageEngine.set(this._storageKey, this._edges);
  },

  _seedDefaultEdges() {
    const nodes = LawAIApp.GraphNodeManager.getAllNodes();
    // 简单构建：按 day 顺序添加 prerequisite 边
    const lessonNodes = nodes.filter(n => n.id.startsWith('day-'));
    lessonNodes.sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));
    for (let i = 0; i < lessonNodes.length - 1; i++) {
      this.addEdge(lessonNodes[i].id, lessonNodes[i+1].id, 'prerequisite', 1);
    }
    // 同一类别添加 similarity 边
    const categoryMap = {};
    lessonNodes.forEach(n => {
      const cat = n.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(n.id);
    });
    Object.values(categoryMap).forEach(list => {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          this.addEdge(list[i], list[j], 'similarity', 2);
        }
      }
    });
  },

  addEdge(from, to, relation, weight = 1) {
    // 避免重复
    const exists = this._edges.some(e => e.from === from && e.to === to && e.relation === relation);
    if (!exists) {
      this._edges.push({ from, to, relation, weight });
      this._save();
      LawAIApp.EventBus.emit('GraphEdgeAdded', { from, to, relation });
    }
  },

  removeEdge(from, to, relation) {
    this._edges = this._edges.filter(e => !(e.from === from && e.to === to && e.relation === relation));
    this._save();
  },

  getEdgesForNode(nodeId) {
    return this._edges.filter(e => e.from === nodeId || e.to === nodeId);
  },

  getEdgesByRelation(relation) {
    return this._edges.filter(e => e.relation === relation);
  },

  updateWeight(from, to, relation, delta) {
    const edge = this._edges.find(e => e.from === from && e.to === to && e.relation === relation);
    if (edge) {
      edge.weight = Math.max(0, (edge.weight || 1) + delta);
      this._save();
    }
  }
};
// 初始化
setTimeout(() => LawAIApp.GraphEdgeManager.init(), 200);
