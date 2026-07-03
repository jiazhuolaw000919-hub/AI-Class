// careerEngine.js
LawAIApp.CareerEngine = (function() {
  // 默认职业模板
  const defaultCareers = [
    {
      careerId: 'ai_engineer',
      careerName: 'AI Engineer',
      description: 'Build and deploy AI models and systems.',
      requiredSkills: ['AI Basics','Machine Learning','Prompt Engineering','API Usage'],
      recommendedProjects: [],
      estimatedLearningHours: 200
    },
    {
      careerId: 'prompt_engineer',
      careerName: 'Prompt Engineer',
      description: 'Design effective prompts for large language models.',
      requiredSkills: ['Prompt Engineering','ChatGPT','AI Basics'],
      recommendedProjects: [],
      estimatedLearningHours: 80
    }
  ];

  // 初始化默认职业（如果尚未创建）
  function seedCareers() {
    defaultCareers.forEach(c => {
      if (!LawAIApp.CareerProfile.getCareer(c.careerId)) {
        LawAIApp.CareerProfile.setCareer(c);
      }
    });
  }

  // 当技能更新时，刷新相关职业的统计
  LawAIApp.EventBus.on('SkillUpdated', (data) => {
    const careers = LawAIApp.CareerProfile.getAll();
    careers.forEach(c => {
      const skillName = LawAIApp.SkillTracker.getSkill(data.skillId)?.title;
      if (c.requiredSkills.includes(skillName)) {
        const readiness = LawAIApp.CareerAnalytics.getReadiness(c.careerId);
        const confidence = LawAIApp.CareerAnalytics.getConfidence(c.careerId);
        LawAIApp.CareerProfile.setCareer({ ...c, careerReadiness: readiness, careerConfidence: confidence });
      }
    });
  });

  // 项目完成时同样更新
  LawAIApp.EventBus.on('ProjectFinished', () => {
    const careers = LawAIApp.CareerProfile.getAll();
    careers.forEach(c => {
      const readiness = LawAIApp.CareerAnalytics.getReadiness(c.careerId);
      LawAIApp.CareerProfile.setCareer({ ...c, careerReadiness: readiness });
    });
  });

  seedCareers();

  return {
    getCareers: () => LawAIApp.CareerProfile.getAll(),
    getCareer: (id) => LawAIApp.CareerProfile.getCareer(id),
    getReadiness: (id) => LawAIApp.CareerAnalytics.getReadiness(id),
    getConfidence: (id) => LawAIApp.CareerAnalytics.getConfidence(id),
    getGapReport: (id) => LawAIApp.CareerGapAnalyzer.generateReport(id),
    getRoadmap: (id) => LawAIApp.CareerRoadmap.get(id) || LawAIApp.CareerRoadmap.generate(id),
    setCareer: (def) => LawAIApp.CareerProfile.setCareer(def)
  };
})();
