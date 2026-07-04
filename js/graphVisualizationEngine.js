// graphVisualizationEngine.js
LawAIApp.GraphVisualizationEngine = {
  // 生成节点簇数据（按类别分组）
  getClusters() {
    const nodes = LawAIApp.GraphNodeManager.getAllNodes();
    const clusters = {};
    nodes.forEach(n => {
      const category = n.category || 'General';
      if (!clusters[category]) clusters[category] = [];
      clusters[category].push({
        id: n.id,
        strength: n.strength,
        completed: n.completed
      });
    });
    return clusters;
  },

  // 生成掌握热图数据（节点强度映射 0-100 为颜色值）
  getHeatmapData() {
    return LawAIApp.GraphNodeManager.getAllNodes().map(n => ({
      id: n.id,
      title: n.title || n.id,
      strength: n.strength || 50
    }));
  },

  // 识别弱区（强度 < 40 的节点）
  getWeakZones() {
    return LawAIApp.GraphNodeManager.getAllNodes()
      .filter(n => n.strength < 40)
      .map(n => ({ id: n.id, title: n.title, strength: n.strength }));
  },

  // 生成技能分支树（简单按课程顺序构造）
  getSkillTree() {
    const nodes = LawAIApp.GraphNodeManager.getAllNodes()
      .filter(n => n.type === 'lesson')
      .sort((a, b) => {
        const aDay = parseInt(a.id.split('-')[1]) || 0;
        const bDay = parseInt(b.id.split('-')[1]) || 0;
        return aDay - bDay;
      });
    return nodes.map(n => ({
      id: n.id,
      title: n.title || n.id,
      strength: n.strength,
      completed: n.completed
    }));
  }
};
