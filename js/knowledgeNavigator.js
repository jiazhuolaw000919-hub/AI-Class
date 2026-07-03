// knowledgeNavigator.js (Phase 38 专用)
LawAIApp.KnowledgeNavigator = {
  // 从某个节点出发，沿指定关系类型探索 N 步内的节点
  explore(nodeId, type = null, maxDepth = 2) {
    const visited = new Set();
    const result = [];
    const queue = [{ node: nodeId, depth: 0 }];
    visited.add(nodeId);
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.depth > maxDepth) continue;
      result.push(current.node);
      const relations = LawAIApp.KRERegistry.getByNode(current.node)
        .filter(r => !type || r.relationshipType === type);
      for (const rel of relations) {
        const neighbor = rel.sourceNode === current.node ? rel.targetNode : rel.sourceNode;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, depth: current.depth + 1 });
        }
      }
    }
    return result;
  },

  // 获取某个知识点最相关的其他知识点（按权重降序）
  getTopRelated(nodeId, limit = 5) {
    return LawAIApp.KRERegistry.getByNode(nodeId)
      .filter(r => r.relationshipType === 'related' || r.relationshipType === 'extension')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map(r => ({
        node: r.sourceNode === nodeId ? r.targetNode : r.sourceNode,
        type: r.relationshipType,
        weight: r.weight
      }));
  },

  // 从起点到终点的最短路径（简单 BFS）
  findPath(startNode, endNode) {
    if (startNode === endNode) return [startNode];
    const visited = new Set();
    const queue = [{ node: startNode, path: [startNode] }];
    visited.add(startNode);
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      const neighbors = LawAIApp.KRERegistry.getByNode(node);
      for (const rel of neighbors) {
        const next = rel.sourceNode === node ? rel.targetNode : rel.sourceNode;
        if (!visited.has(next)) {
          const newPath = [...path, next];
          if (next === endNode) return newPath;
          visited.add(next);
          queue.push({ node: next, path: newPath });
        }
      }
    }
    return null;
  }
};
