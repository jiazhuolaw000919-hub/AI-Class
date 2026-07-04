// ===========================================
// progressApi.js
// 进度追踪 API，触发 XP、技能图更新
// ===========================================
LawAIApp.ProgressApi = {
  async updateProgress(userId, lessonId, score) {
    // 1. 增加 XP (假设每课基础 20 XP，按分数加权)
    const xpGained = Math.round(20 * (score / 100));
    await LawAIApp.UserApi.updateXp(userId, xpGained);

    // 2. 更新技能图：获取课程关联的技能并提升掌握度
    const { data: lesson } = await LawAIApp.LessonApi.getLesson(lessonId);
    if (lesson) {
      // 简单模拟：从课程标题提取领域作为技能名
      const domainSkill = lesson.title.split('–')[0]?.trim() || 'General';
      const skillId = `skill_${domainSkill.toLowerCase().replace(/\s/g, '_')}`;
      await LawAIApp.SkillApi.updateMastery(userId, skillId, 10);
    }

    // 3. 通知事件总线 (AI系统可监听)
    LawAIApp.EventBus.emit('ProgressUpdated', { userId, lessonId, score, xpGained });
    return { success: true, xpGained };
  }
};
