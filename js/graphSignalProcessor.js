// graphSignalProcessor.js
LawAIApp.GraphSignalProcessor = {
  // 处理掌握信号：当前节点强度大幅提升，并向邻居传播部分提升
  propagateMastery(nodeId, intensity = 20) {
    const node = LawAIApp.GraphNodeManager.getNode(nodeId);
    if (!node) return;
    // 提升节点强度
    LawAIApp.GraphNodeManager.adjustStrength(nodeId, intensity);
    // 获取邻居
    const neighbors = LawAIApp.GraphEdgeManager.getEdgesForNode(nodeId)
      .map(e => e.from === nodeId ? e.to : e.from);
    // 向邻居传播部分信号
    neighbors.forEach(neighborId => {
      LawAIApp.GraphNodeManager.adjustStrength(neighborId, Math.floor(intensity * 0.3));
    });
  },

  // 处理困惑信号：降低节点强度，增加相关边的权重（需要更关注前置）
  propagateConfusion(nodeId, intensity = 20) {
    LawAIApp.GraphNodeManager.adjustStrength(nodeId, -intensity);
    // 寻找前置边，增加权重
    const edges = LawAIApp.GraphEdgeManager.getEdgesForNode(nodeId)
      .filter(e => e.relation === 'prerequisite' && e.to === nodeId);
    edges.forEach(edge => {
      LawAIApp.GraphEdgeManager.updateWeight(edge.from, edge.to, edge.relation, 2);
    });
  },

  // 强化信号：定期增加近期学习过的节点强度
  reinforceRecent() {
    const recentLessons = LawAIApp.ProgressEngine.getProgress().completedLessons.slice(-5);
    recentLessons.forEach(id => {
      LawAIApp.GraphNodeManager.adjustStrength(id, 5);
    });
  }
};
