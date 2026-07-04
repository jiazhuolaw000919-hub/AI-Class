// ===========================================
// contentGeneratorCore.js
// 内容生成核心：协调技能树和课程工厂，批量生产学习资产
// ===========================================
LawAIApp.ContentGeneratorCore = {
  // 处理整个领域，返回生成的课程 ID 列表
  generateDomainContent(domain) {
    const rootSkillId = LawAIApp.SkillTreeBuilder.buildSkillTree(domain);
    const allLessonIds = [];

    // 递归为每个技能生成课程
    const processSkillNode = (skillId) => {
      const lessons = LawAIApp.LessonModuleFactory.generateLessonsForSkill(skillId, domain.id, 2);
      allLessonIds.push(...lessons);
      // 查找子技能边，继续递归
      const childEdges = LawAIApp.GraphEdgeManager._edges.filter(e => e.from === skillId && e.relation === 'skill_dependency');
      childEdges.forEach(edge => processSkillNode(edge.to));
    };

    processSkillNode(rootSkillId);

    // 将课程打包为资产
    if (allLessonIds.length > 0) {
      const assetId = `asset_domain_${domain.id}`;
      LawAIApp.LearningAssetManager.addAsset({
        id: assetId,
        type: 'course',
        title: domain.name,
        description: `Complete learning path for ${domain.name}`,
        creator: 'CivOS',
        lessons: allLessonIds,
        effectivenessScore: 80,
        rating: 4.5,
        tags: ['auto_generated', domain.id]
      });
    }
    return allLessonIds;
  }
};
