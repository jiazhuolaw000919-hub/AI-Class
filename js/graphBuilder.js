// graphBuilder.js (Phase 38 专用)
LawAIApp.GraphBuilder = {
  // 从现有课程结构自动构建关系
  buildFromLessons() {
    const lessons = LawAIApp.LessonEngine.getAllLessons();
    const nodes = lessons.map(l => l.lessonId);

    // 清除旧关系（仅限 KRE 自身的关系，不影响其他引擎）
    // 注意：这里可以选择是否重置，第一次构建时自然为空
    const existing = LawAIApp.KRERegistry.getAll();
    if (existing.length > 0) return; // 已构建过，避免重复

    // 1. 相邻课程 -> recommendedBefore / recommendedAfter
    lessons.forEach((lesson, index) => {
      if (index > 0) {
        LawAIApp.KRERegistry.add(lessons[index-1].lessonId, lesson.lessonId, 'recommendedBefore', 1);
        LawAIApp.KRERegistry.add(lesson.lessonId, lessons[index-1].lessonId, 'recommendedAfter', 1);
      }
    });

    // 2. 同一 category -> related
    const categoryMap = {};
    lessons.forEach(l => {
      if (!categoryMap[l.category]) categoryMap[l.category] = [];
      categoryMap[l.category].push(l.lessonId);
    });
    Object.values(categoryMap).forEach(list => {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          LawAIApp.KRERegistry.add(list[i], list[j], 'related', 2);
        }
      }
    });

    // 3. 技能支持关系（从课程标签到技能）
    const skills = LawAIApp.SkillTracker.getAllSkills();
    skills.forEach(skill => {
      const relatedLessons = skill.relatedLessons || [];
      relatedLessons.forEach(lessonId => {
        LawAIApp.KRERegistry.add(lessonId, `skill_${skill.skillId}`, 'supportsSkill', 3);
      });
    });

    LawAIApp.EventBus.emit('KnowledgeGraphUpdated', { nodeCount: nodes.length });
  }
};
