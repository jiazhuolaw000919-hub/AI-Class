// ===========================================
// graphPathResolver.js
// 解析图谱路径，返回节点序列
// ===========================================
LawAIApp.GraphPathResolver = {
  // 根据策略生成学习路径节点ID列表
  resolvePath(strategy, options = {}) {
    const nodes = LawAIApp.GraphNodeManager.getAllNodes();
    const edges = LawAIApp.GraphEdgeManager._edges;
    const completedIds = new Set(
      nodes.filter(n => n.completed).map(n => n.id)
    );

    let candidates = nodes.filter(n => n.type === 'lesson' && !completedIds.has(n.id));
    if (candidates.length === 0) return [];

    switch (strategy) {
      case 'shortest':
        // 简单按顺序排列
        return candidates.slice(0, 10).map(n => n.id);
      case 'mastery-first':
        candidates.sort((a, b) => (a.strength || 50) - (b.strength || 50));
        return candidates.slice(0, 10).map(n => n.id);
      case 'weakness-targeted':
        candidates.sort((a, b) => (a.strength || 50) - (b.strength || 50));
        return candidates.slice(0, 8).map(n => n.id);
      case 'project-driven': {
        // 简化为优先选择与活跃项目相关的课程（此处随机选取）
        return candidates.sort(() => Math.random() - 0.5).slice(0, 6).map(n => n.id);
      }
      default:
        return candidates.slice(0, 10).map(n => n.id);
    }
  }
};
