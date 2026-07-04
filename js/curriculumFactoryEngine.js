// ===========================================
// curriculumFactoryEngine.js
// 课程工厂主引擎：统一接口，启动生产流水线
// ===========================================
LawAIApp.CurriculumFactoryEngine = {
  // 使用预定义的生产轨道
  productionTracks: [
    {
      id: 'ai_track',
      name: 'AI Mastery Track',
      skills: [
        { name: 'Machine Learning', children: [
          { name: 'Supervised Learning' },
          { name: 'Unsupervised Learning' },
          { name: 'Reinforcement Learning' }
        ]},
        { name: 'Deep Learning' },
        { name: 'Natural Language Processing' }
      ]
    },
    {
      id: 'coding_track',
      name: 'Coding Bootcamp',
      skills: [
        { name: 'Python Programming' },
        { name: 'Data Structures & Algorithms' },
        { name: 'Web Development Basics' }
      ]
    },
    {
      id: 'business_track',
      name: 'Business Strategy',
      skills: [
        { name: 'Strategic Thinking' },
        { name: 'Business Model Design' },
        { name: 'Market Analysis' }
      ]
    }
  ],

  // 启动工厂，生产所有轨道
  startProduction() {
    console.log('[Curriculum Factory] Starting mass production...');
    const reports = LawAIApp.MassCurriculumGenerator.produceMultiple(this.productionTracks);
    console.log('[Curriculum Factory] Production complete. Reports:', reports);
    return reports;
  },

  // 生产单个自定义领域
  produceCustomDomain(domainDef) {
    return LawAIApp.MassCurriculumGenerator.produceCurriculum(domainDef);
  }
};
