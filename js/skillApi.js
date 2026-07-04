// ===========================================
// skillApi.js
// 技能图 API：获取、更新技能掌握度
// ===========================================
LawAIApp.SkillApi = {
  async getUserSkills(userId) {
    const { data, error } = await LawAIApp.Database.from('user_skills')
      .eq('user_id', userId)
      .select();
    return { success: !error, skills: data || [], error };
  },

  async updateMastery(userId, skillId, delta) {
    // 确保技能存在
    let { data: existingSkills } = await LawAIApp.Database.from('skills')
      .eq('id', skillId)
      .select();
    if (!existingSkills || existingSkills.length === 0) {
      // 自动创建技能
      await LawAIApp.Database.from('skills').insert({
        id: skillId,
        name: skillId.replace('skill_', '').replace(/_/g, ' '),
        domain: 'General',
        difficulty_score: 50
      });
    }

    const { data: currentMapping } = await LawAIApp.Database.from('user_skills')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .select();

    if (currentMapping && currentMapping.length > 0) {
      const newMastery = Math.min(100, (currentMapping[0].mastery_level || 0) + delta);
      await LawAIApp.Database.from('user_skills').update({
        user_id: userId,
        skill_id: skillId,
        mastery_level: newMastery,
        last_practiced: new Date().toISOString()
      }, 'user_id');
    } else {
      await LawAIApp.Database.from('user_skills').insert({
        user_id: userId,
        skill_id: skillId,
        mastery_level: Math.min(100, delta),
        last_practiced: new Date().toISOString()
      });
    }

    LawAIApp.EventBus.emit('SkillMasteryUpdated', { userId, skillId, delta });
    return { success: true };
  }
};
