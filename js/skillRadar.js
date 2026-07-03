// skillRadar.js
LawAIApp.SkillRadar = {
  // 生成可用于可视化雷达图的原始数据（各技能掌握度）
  generate() {
    return LawAIApp.SkillAnalytics.getRadarData();
  },

  // 对比两个时间点的技能变化（简化版，与历史数据对比）
  compareWithHistory() {
    const current = this.generate();
    // 从 storage 中获取上次保存的雷达快照
    const previous = LawAIApp.StorageEngine.get('skill_radar_snapshot', []);
    const comparison = current.map(skill => {
      const prev = previous.find(p => p.skillId === skill.skillId);
      return {
        ...skill,
        previousMastery: prev ? prev.mastery : 0,
        change: prev ? skill.mastery - prev.mastery : skill.mastery
      };
    });
    // 保存当前快照
    LawAIApp.StorageEngine.set('skill_radar_snapshot', current);
    return comparison;
  }
};
