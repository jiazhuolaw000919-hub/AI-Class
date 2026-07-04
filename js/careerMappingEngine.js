// ===========================================
// careerMappingEngine.js
// 职业映射引擎：将课程/技能映射到职业路径，展示需求与价值
// ===========================================
LawAIApp.CareerMappingEngine = {
  // 预设映射表（可扩展）
  careerMap: {
    'AI Basics': ['AI Engineer', 'Data Analyst', 'AI Product Manager'],
    'Prompt Engineering': ['Prompt Engineer', 'Automation Consultant', 'Customer Success AI'],
    'Programming Basics': ['Software Developer', 'QA Engineer', 'Technical Support'],
    'Business Strategy': ['Business Analyst', 'Strategy Consultant', 'Product Manager'],
    'Productivity Systems': ['Operations Manager', 'Executive Assistant', 'Workflow Designer']
  },

  // 根据课程标题获取关联职业
  getCareersForLesson(lessonTitle) {
    for (const [keyword, careers] of Object.entries(this.careerMap)) {
      if (lessonTitle.toLowerCase().includes(keyword.toLowerCase())) {
        return careers;
      }
    }
    return ['General Learner']; // 默认
  },

  // 获取技能价值面板数据
  getSkillValue(lessonTitle) {
    const difficultyMap = { 'AI Basics': 3, 'Prompt Engineering': 2, 'Programming Basics': 4, 'Business Strategy': 5 };
    const demandMap = { 'AI Basics': 90, 'Prompt Engineering': 85, 'Programming Basics': 80, 'Business Strategy': 75 };
    for (const [keyword, value] of Object.entries(difficultyMap)) {
      if (lessonTitle.includes(keyword)) {
        return {
          difficulty: value,
          demand: demandMap[keyword] || 70,
          industryUsage: ['Technology', 'Finance', 'Healthcare', 'Education'].slice(0, 2),
          relatedSkills: ['Critical Thinking', 'Problem Solving']
        };
      }
    }
    return { difficulty: 2, demand: 60, industryUsage: ['General'], relatedSkills: [] };
  }
};
