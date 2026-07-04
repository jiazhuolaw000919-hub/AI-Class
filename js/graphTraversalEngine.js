// graphTraversalEngine.js
LawAIApp.GraphTraversalEngine = {
  // 获取以某节点为起点的最短路径（BFS）
  shortestPath(startId, endId) {
    const nodes = LawAIApp.GraphNodeManager.getAllNodes().map(n => n.id);
    const edges = LawAIApp.GraphEdgeManager._edges;
    const graph = {};
    nodes.forEach(id => { graph[id] = []; });
    edges.forEach(e => {
      graph[e.from].push(e.to);
      graph[e.to].push(e.from); // 无向图
    });
    const queue = [[startId]];
    const visited = new Set([startId]);
    while (queue.length) {
      const path = queue.shift();
      const node = path[path.length - 1];
      if (node === endId) return path;
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return [];
  },

  // 生成基于策略的路径
  generatePath(strategy, startNodeId) {
    const allNodes = LawAIApp.GraphNodeManager.getAllNodes();
    const completedIds = new Set(
      allNodes.filter(n => n.completed).map(n => n.id)
    );
    if (!startNodeId) {
      // 默认从第一个未完成的课程开始
      const firstIncomplete = allNodes.find(n => n.type === 'lesson' && !completedIds.has(n.id));
      startNodeId = firstIncomplete ? firstIncomplete.id : allNodes[0]?.id;
    }

    let candidates = allNodes.filter(n => n.type === 'lesson' && !completedIds.has(n.id));

    if (strategy === 'mastery-first') {
      // 优先选择强度低于50的节点
      candidates.sort((a, b) => (a.strength || 50) - (b.strength || 50));
    } else if (strategy === 'weakness-targeted') {
      // 优先选择强度最低的节点
      candidates.sort((a, b) => (a.strength || 50) - (b.strength || 50));
    } else if (strategy === 'project-driven') {
      // 优先选择与活跃项目关联的课程（这里简化：随机）
    }
    // 默认 shortest 或其它
    return candidates.map(n => n.id).slice(0, 10);
  }
};
