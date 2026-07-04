// ===========================================
// domainInitializer.js
// 领域初始化器：定义并启动所有核心学习领域
// ===========================================
LawAIApp.DomainInitializer = {
  coreDomains: [
    {
      id: 'ai_ml',
      name: 'AI & Machine Learning',
      skills: [
        { name: 'AI Fundamentals', children: [
          { name: 'Supervised Learning' },
          { name: 'Unsupervised Learning' }
        ]},
        { name: 'Neural Networks' },
        { name: 'Prompt Engineering' }
      ]
    },
    {
      id: 'programming',
      name: 'Programming & Software Engineering',
      skills: [
        { name: 'Python Basics' },
        { name: 'Data Structures' },
        { name: 'Algorithms' }
      ]
    },
    {
      id: 'productivity',
      name: 'Productivity Systems',
      skills: [
        { name: 'Task Management' },
        { name: 'Automation Basics' },
        { name: 'Workflow Design' }
      ]
    }
  ],

  // 初始化所有领域，生成技能树和课程内容
  initDomains() {
    this.coreDomains.forEach(domain => {
      const lessonIds = LawAIApp.ContentGeneratorCore.generateDomainContent(domain);
      console.log(`Domain [${domain.name}] bootstrapped with ${lessonIds.length} lessons.`);
    });
    LawAIApp.EventBus.emit('DomainsBootstrapped', { domains: this.coreDomains.map(d => d.id) });
  }
};
