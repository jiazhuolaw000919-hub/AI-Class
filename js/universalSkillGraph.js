// ===========================================
// universalSkillGraph.js
// 通用技能图谱：作为所有大学共享的全球技能标准
// ===========================================
LawAIApp.UniversalSkillGraph = {
  _nodes: {},
  _edges: [],

  // 从本地知识图谱导入并统一格式
  importFromLocalGraph() {
    const localGraph = LawAIApp.LearningGraphEngine.getGraph();
    this._nodes = { ...localGraph.nodes };
    this._edges = [...localGraph.edges];
  },

  // 导出标准化的技能节点列表（可跨大学共享）
  exportSkillStandards() {
    const skills = [];
    for (const [id, node] of Object.entries(this._nodes)) {
      if (node.type === 'validated_skill' || id.startsWith('skill_')) {
        skills.push({
          skillId: id,
          name: node.title,
          strength: node.strength,
          certified: node.certified || false,
          lastUpdated: node.updatedAt || new Date().toISOString()
        });
      }
    }
    return skills;
  },

  // 合并外部技能标准（模拟从其他大学接收）
  mergeExternalStandards(externalSkills) {
    externalSkills.forEach(skill => {
      if (!this._nodes[skill.skillId]) {
        this._nodes[skill.skillId] = {
          id: skill.skillId,
          title: skill.name,
          type: 'external_skill',
          strength: skill.strength || 50,
          source: 'global_network'
        };
      }
    });
  }
};
