// ===========================================
// skillTreeBuilder.js
// 技能树构建器：为每个领域创建技能节点与依赖边
// ===========================================
LawAIApp.SkillTreeBuilder = {
  // domain: { id, name, skills: [{ name, children?: [] }] }
  buildSkillTree(domain) {
    const rootSkillId = `skill_${domain.name.toLowerCase().replace(/\s/g, '_')}`;
    // 注册根技能
    LawAIApp.SkillTracker?.register(rootSkillId, {
      title: domain.name,
      description: `Root skill for ${domain.name}`,
      academyId: 'academy_ai_foundation',
      relatedLessons: []
    });

    // 递归构建子技能
    const processSkills = (parentId, skills) => {
      skills.forEach(skillDef => {
        const childId = `skill_${skillDef.name.toLowerCase().replace(/\s/g, '_')}`;
        LawAIApp.SkillTracker?.register(childId, {
          title: skillDef.name,
          description: skillDef.description || `Skill: ${skillDef.name}`,
          academyId: 'academy_ai_foundation',
          relatedLessons: []
        });
        // 添加依赖边 (parent → child)
        LawAIApp.GraphEdgeManager.addEdge(parentId, childId, 'skill_dependency', 1);
        if (skillDef.children) {
          processSkills(childId, skillDef.children);
        }
      });
    };

    if (domain.skills) {
      processSkills(rootSkillId, domain.skills);
    }
    return rootSkillId;
  }
};
