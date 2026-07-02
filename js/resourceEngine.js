// resourceEngine.js
LawAIApp.ResourceEngine = (function() {
  // 初始化一些示例资源（如果没有）
  function seedDefaultResources() {
    const existing = LawAIApp.ResourceRegistry.getAll();
    if (existing.length > 0) return;

    const sampleResources = [
      {
        lessonId: 'day-1',
        title: 'Official AI Guide',
        description: 'A comprehensive introduction to AI concepts.',
        type: 'article',
        provider: 'OpenAI',
        url: 'https://example.com/ai-guide',
        difficulty: 'Beginner',
        estimatedMinutes: 10,
        language: 'English',
        qualityScore: 'official',
        license: 'CC BY',
        status: 'active',
        keywords: ['AI', 'introduction']
      },
      {
        lessonId: 'day-2',
        title: 'Prompt Engineering Basics',
        description: 'Learn how to craft effective prompts.',
        type: 'video',
        provider: 'YouTube',
        url: 'https://example.com/prompt-video',
        difficulty: 'Beginner',
        estimatedMinutes: 15,
        language: 'English',
        qualityScore: 'professional',
        license: 'Standard',
        status: 'active',
        keywords: ['prompt', 'ChatGPT']
      }
    ];

    sampleResources.forEach(r => LawAIApp.ResourceRegistry.add(r));
  }

  // 监听课程完成，为 AI Mentor 提供资源推荐（预留）
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    const lessonId = data.lessonId;
    const recommendation = LawAIApp.ResourceSearch.recommendForLesson(lessonId);
    if (recommendation.best) {
      LawAIApp.EventBus.emit('ResourceRecommended', { lessonId, recommendation });
    }
  });

  // 定期健康检查（每天一次）
  setInterval(() => {
    LawAIApp.ResourceHealth.autoDeprecate();
  }, 86400000);

  // 初始化默认资源
  seedDefaultResources();

  return {
    search: (query, filters) => LawAIApp.ResourceSearch.search(query, filters),
    getRecommendation: (lessonId) => LawAIApp.ResourceSearch.recommendForLesson(lessonId),
    addResource: (resource) => LawAIApp.ResourceRegistry.add(resource),
    updateResource: (id, updates) => LawAIApp.ResourceRegistry.update(id, updates),
    deprecateResource: (id) => LawAIApp.ResourceRegistry.deprecate(id),
    getHealthReport: () => LawAIApp.ResourceHealth.getUnhealthy(),
    getAllResources: (lessonId) => LawAIApp.ResourceRegistry.getAll(lessonId)
  };
})();
