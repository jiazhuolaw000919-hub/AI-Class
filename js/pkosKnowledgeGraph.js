// ===========================================
// pkosKnowledgeGraph.js
// PKOS 知识图谱：将笔记转化为节点并建立关系
// ===========================================
LawAIApp.PKOSKnowledgeGraph = {
  _graphKey: 'pkos_graph',

  // 初始化图（加载或创建空图）
  init(userId) {
    const key = `${this._graphKey}_${userId}`;
    if (!LawAIApp.StorageEngine.get(key)) {
      LawAIApp.StorageEngine.set(key, { nodes: [], edges: [] });
    }
  },

  // 从笔记生成节点并创建关系
  syncNotesToGraph(userId) {
    const notes = LawAIApp.StorageEngine.get(`pkos_notes_${userId}`, []);
    const graph = LawAIApp.StorageEngine.get(`${this._graphKey}_${userId}`, { nodes: [], edges: [] });

    // 为每个笔记创建节点（如果不存在）
    notes.forEach(note => {
      if (!graph.nodes.find(n => n.id === note.id)) {
        graph.nodes.push({
          id: note.id,
          label: note.title || note.type,
          type: note.type,
          tags: note.tags || [],
          created: note.created
        });
      }
    });

    // 创建简单关系：如果两个笔记共享相同标签，则添加边
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const commonTags = (notes[i].tags || []).filter(t => (notes[j].tags || []).includes(t));
        if (commonTags.length > 0) {
          const edgeId = `${notes[i].id}_${notes[j].id}`;
          if (!graph.edges.find(e => e.id === edgeId)) {
            graph.edges.push({
              id: edgeId,
              source: notes[i].id,
              target: notes[j].id,
              relation: 'shared_tags',
              tags: commonTags
            });
          }
        }
      }
    }

    LawAIApp.StorageEngine.set(`${this._graphKey}_${userId}`, graph);
    return graph;
  },

  // 获取可视化图数据
  getGraphData(userId) {
    const graph = LawAIApp.StorageEngine.get(`${this._graphKey}_${userId}`, { nodes: [], edges: [] });
    return graph;
  },

  // 探索某节点的邻居
  getNeighbors(userId, nodeId) {
    const graph = this.getGraphData(userId);
    const edges = graph.edges.filter(e => e.source === nodeId || e.target === nodeId);
    const neighborIds = edges.map(e => e.source === nodeId ? e.target : e.source);
    const nodes = graph.nodes.filter(n => neighborIds.includes(n.id));
    return { nodes, edges };
  }
};
