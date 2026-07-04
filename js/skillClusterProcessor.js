// ===========================================
// skillClusterProcessor.js
// 技能集群处理器：将领域分解为层次化的技能集群
// ===========================================
LawAIApp.SkillClusterProcessor = {
  // 输入领域定义，输出层级化的技能节点列表
  decomposeDomain(domainDef) {
    const clusters = [];
    const rootSkillId = `skill_${domainDef.name.toLowerCase().replace(/\s/g, '_')}`;

    // 递归收集所有技能 ID
    const collectSkills = (skills, parentId = null) => {
      skills.forEach(skill => {
        const skillId = `skill_${skill.name.toLowerCase().replace(/\s/g, '_')}`;
        clusters.push({
          skillId,
          name: skill.name,
          parentId,
          depth: parentId ? 1 : 0 // 简化深度
        });
        if (skill.children) {
          collectSkills(skill.children, skillId);
        }
      });
    };

    if (domainDef.skills) {
      collectSkills(domainDef.skills);
    }

    return {
      rootSkillId,
      clusters,
      domainId: domainDef.id,
      domainName: domainDef.name
    };
  }
};
