// ===========================================
// globalKnowledgeGraph.js
// 全局知识图谱：整合多个用户的知识节点
// （当前为单用户架构，预留多用户接口）
// ===========================================
LawAIApp.GlobalKnowledgeGraph = {
  _globalNodes: {},
  _globalEdges: [],

  init() {
    // 将本地用户图谱同步到“全球”视角
    this.syncLocalGraph();
    // 监听本地图谱变化，实时更新全球视图
    LawAIApp.EventBus.on('GraphNodeAdded', (data) => this.addGlobalNode(data.id, data.type));
    LawAIApp.EventBus.on('GraphEdgeAdded', (data) => this.addGlobalEdge(data.from, data.to, data.relation, data.weight));
    console.log('Global Knowledge Graph initialized.');
  },

  syncLocalGraph() {
    const localGraph = LawAIApp.LearningGraphEngine?.getGraph();
    if (!localGraph) return;
    this._globalNodes = { ...localGraph.nodes };
    this._globalEdges = [...localGraph.edges];
  },

  addGlobalNode(id, type) {
    const node = LawAIApp.GraphNodeManager.getNode(id);
    if (node) this._globalNodes[id] = { ...node };
  },

  addGlobalEdge(from, to, relation, weight = 1) {
    this._globalEdges.push({ from, to, relation, weight });
  },

  // 模拟多用户聚合：随机生成一个“全球共识”的课程路径
  getConsensusPath(strategy = 'mastery-first') {
    const allNodes = Object.values(this._globalNodes).filter(n => n.type === 'lesson');
    if (allNodes.length === 0) return [];
    const sorted = allNodes.sort((a, b) => (b.strength || 50) - (a.strength || 50));
    return sorted.slice(0, 10).map(n => n.id);
  }
};

// 自动初始化
setTimeout(() => LawAIApp.GlobalKnowledgeGraph.init(), 400);
