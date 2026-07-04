// ===========================================
// adaptivePathEngine.js
// 自适应路径引擎：基于用户进度和技能图，推荐最优下一课
// ===========================================
LawAIApp.AdaptivePathEngine = {
  // 推荐下一课
  async getNextLesson(userId) {
    const userSkills = await LawAIApp.SkillApi.getUserSkills(userId);
    const userProgress = await LawAIApp.Database.from('user_progress').eq('user_id', userId).select();
    const completedIds = (userProgress.data || []).filter(p => p.completed).map(p => p.lesson_id);

    // 获取所有可用课程
    const { data: allLessons } = await LawAIApp.Database.from('lessons').select();
    if (!allLessons || allLessons.length === 0) return null;

    // 筛选未完成的课程
    let candidates = allLessons.filter(l => !completedIds.includes(l.id));
    if (candidates.length === 0) candidates = allLessons; // 全部完成则重新开始

    // 根据技能弱点排序：取用户掌握度最低的技能，寻找相关课程
    const weakSkills = userSkills.skills.filter(s => s.mastery_level < 50);
    if (weakSkills.length > 0) {
      candidates.sort((a, b) => {
        const aRelevant = weakSkills.some(s => a.title.toLowerCase().includes(s.skill_id.replace('skill_','').replace(/_/g,' ')));
        const bRelevant = weakSkills.some(s => b.title.toLowerCase().includes(s.skill_id.replace('skill_','').replace(/_/g,' ')));
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;
        return 0;
      });
    }

    // 返回最合适的下一课
    return candidates[0];
  },

  // 根据用户表现调整难度（返回建议难度级别）
  async suggestDifficulty(userId) {
    const { data: progress } = await LawAIApp.Database.from('user_progress').eq('user_id', userId).select();
    if (!progress || progress.length === 0) return 'beginner';

    const recent = progress.slice(-5);
    const avgScore = recent.reduce((sum, p) => sum + (p.score || 0), 0) / recent.length;

    if (avgScore >= 80) return 'advanced';
    if (avgScore >= 60) return 'intermediate';
    return 'beginner';
  }
};
