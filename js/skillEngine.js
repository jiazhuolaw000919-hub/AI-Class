// skillEngine.js
LawAIApp.SkillEngine = (function() {
  // 自动注册默认技能（从课程类别生成）
  function initDefaultSkills() {
    const categories = LawAIApp.AcademyData.academies[0]?.categories || [];
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const categorySet = new Set(allLessons.map(l => l.category));
    categorySet.forEach(cat => {
      LawAIApp.SkillTracker.register(`skill_${cat.toLowerCase().replace(/\s/g,'_')}`, {
        title: cat,
        description: `Ability in ${cat}`,
        academyId: 'academy_ai',
        category: cat,
        relatedLessons: allLessons.filter(l => l.category === cat).map(l => l.lessonId)
      });
    });
  }

  // 事件监听：课程完成、练习完成、项目完成时增加技能经验
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(data.lessonId.split('-')[1]));
    if (lesson) {
      LawAIApp.SkillTracker.addExperience(`skill_${lesson.category.toLowerCase().replace(/\s/g,'_')}`, 'lesson', 3);
    }
  });

  LawAIApp.EventBus.on('PracticeCompleted', (data) => {
    if (data.practice) {
      const lessonId = data.practice.lessonId;
      const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
      if (lesson) {
        LawAIApp.SkillTracker.addExperience(`skill_${lesson.category.toLowerCase().replace(/\s/g,'_')}`, 'practice', 5);
      }
    }
  });

  LawAIApp.EventBus.on('ProjectFinished', (data) => {
    const project = LawAIApp.ProjectTracker.getProject(data.projectId);
    if (project && project.skills) {
      project.skills.forEach(skillName => {
        const skillId = `skill_${skillName.toLowerCase().replace(/\s/g,'_')}`;
        LawAIApp.SkillTracker.register(skillId, { title: skillName, description: '', academyId: 'academy_ai', relatedLessons: [], category: skillName });
        LawAIApp.SkillTracker.addExperience(skillId, 'project', 15);
      });
    }
  });

  // 定期检查衰减（每天一次）
  setInterval(() => {
    LawAIApp.SkillTracker.checkDecay();
  }, 86400000);

  // 初始化默认技能
  initDefaultSkills();

  return {
    getSkill: (id) => LawAIApp.SkillTracker.getSkill(id),
    getRadar: () => LawAIApp.SkillRadar.generate(),
    getOverallMastery: () => LawAIApp.MasteryEngine.calculateOverallMastery(),
    getWeakestSkills: () => LawAIApp.MasteryEngine.getWeakestSkills(),
    getRecommended: () => LawAIApp.SkillAnalytics.getRecommendedSkills(),
    getGrowthTimeline: (id) => LawAIApp.SkillAnalytics.getGrowthTimeline(id)
  };
})();
