// ===========================================
// educationConsensusEngine.js
// 教育共识引擎：汇总各大学的数据，达成最佳实践共识
// ===========================================
LawAIApp.EducationConsensusEngine = {
  _consensusState: {
    bestCurriculum: null,
    topSkills: [],
    recommendedPath: []
  },

  // 根据全球技能图谱和本地数据生成共识推荐
  generateConsensus() {
    const skills = LawAIApp.UniversalSkillGraph.exportSkillStandards();
    // 选出强度最高的前5个技能作为全球标准
    this._consensusState.topSkills = skills
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);

    // 推荐最佳课程路径（基于掌握度优先）
    const path = LawAIApp.GlobalKnowledgeGraph.getConsensusPath();
    this._consensusState.recommendedPath = path;

    // 发布共识
    LawAIApp.EventBus.emit('GlobalConsensusUpdated', this._consensusState);
    return this._consensusState;
  }
};
