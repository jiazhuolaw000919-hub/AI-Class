// learningGraphEngine.js
LawAIApp.LearningGraphEngine = {
  _key: 'learningGraph',
  _graph: null,
  init() {
    this._graph = LawAIApp.StorageEngine.get(this._key, { nodes: {}, edges: [] });
  },
  _save() {
    LawAIApp.StorageEngine.set(this._key, this._graph);
  },
  addNode(id, type, properties = {}) {
    this._graph.nodes[id] = { id, type, ...properties, strength: 100 };
    this._save();
    LawAIApp.EventBus.emit('GraphNodeAdded', { id, type });
  },
  markNodeCompleted(id) {
    if (this._graph.nodes[id]) {
      this._graph.nodes[id].completed = true;
      this._graph.nodes[id].strength = Math.min(100, (this._graph.nodes[id].strength || 50) + 20);
      this._save();
      LawAIApp.EventBus.emit('GraphNodeCompleted', { id });
    }
  },
  updateNodeStrength(id, delta) {
    if (this._graph.nodes[id]) {
      this._graph.nodes[id].strength = Math.max(0, Math.min(100, (this._graph.nodes[id].strength || 50) + delta));
      this._save();
      LawAIApp.EventBus.emit('GraphNodeStrengthChanged', { id, strength: this._graph.nodes[id].strength });
    }
  },
  addEdge(from, to, relation, weight = 1) {
    this._graph.edges.push({ from, to, relation, weight });
    this._save();
    LawAIApp.EventBus.emit('GraphEdgeAdded', { from, to, relation });
  },
  getGraph() { return this._graph; }
};
setTimeout(() => LawAIApp.LearningGraphEngine.init(), 300);
