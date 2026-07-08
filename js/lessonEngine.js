// lessonEngine.js
// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.LessonEngine = {
  categories: [
    'Foundation', 'Prompt Engineering', 'ChatGPT', 'Claude', 'Gemini',
    'AI Tools', 'Coding', 'GitHub', 'Supabase', 'API',
    'Automation', 'Business', 'Health AI', 'Future Tech'
  ],

  stages: [
    { name: 'Foundation', range: [1, 30] },
    { name: 'Prompt Engineering', range: [31, 70] },
    { name: 'AI Tools', range: [71, 120] },
    { name: 'AI Development', range: [121, 220] },
    { name: 'Projects', range: [221, 300] },
    { name: 'AI Business', range: [301, 365] }
  ],

  // 生成单节课对象（可扩展属性）
  createLesson(day) {
    // 防御性检查：确保 day 是有效数字
    const validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
    
    const stage = this.stages.find(s => validDay >= s.range[0] && validDay <= s.range[1]);
    const category = this.categories[validDay % this.categories.length] || 'General';
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const difficulty = difficulties[Math.min(Math.floor(validDay / 122), 2)] || 'Beginner';
    const baseXP = 20 + Math.floor(validDay / 5);

    return {
      lessonId: `day-${validDay}`,
      day: validDay,
      title: `Day ${validDay}: ${category} Fundamentals`,
      subtitle: `Deep dive into ${category} concepts`,
      category: category,
      difficulty: difficulty,
      duration: `${Math.floor(Math.random() * 10) + 5} min`,
      estimatedTime: Math.floor(Math.random() * 12) + 5,
      officialArticle: `https://example.com/article/day-${validDay}`,
      officialVideo: `https://example.com/video/day-${validDay}`,
      summary: `Fake summary for day ${validDay}. Learn about ${category}.`,
      notes: [],
      quiz: [
        {
          question: `What is the core idea of ${category}?`,
          options: ['Option A', 'Option B', 'Option C'],
          correct: 0
        },
        {
          question: `Which tool is NOT used in ${category}?`,
          options: ['Tool1', 'Tool2', 'Tool3'],
          correct: 1
        },
        {
          question: `True or False: ${category} is only for experts.`,
          options: ['True', 'False'],
          correct: 1
        }
      ],
      practice: [],
      completed: false,
      completedDate: null,
      reviewLevel: 'Need Review',
      xpReward: baseXP,
      tags: [category.toLowerCase(), difficulty.toLowerCase()],
      futureAIUpdate: {}
    };
  },

  // 批量生成全部课程，已存在则跳过（幂等）
  generateAllLessons(force = false) {
    // 确保 StorageEngine 存在
    if (!LawAIApp.StorageEngine || typeof LawAIApp.StorageEngine.get !== 'function') {
      console.warn('⚠️ StorageEngine not available, generating lessons in memory');
      const lessons = [];
      for (let i = 1; i <= 365; i++) {
        lessons.push(this.createLesson(i));
      }
      return lessons;
    }

    const existing = LawAIApp.StorageEngine.get('allLessons', []);
    if (existing.length === 365 && !force) return existing;

    const lessons = [];
    for (let i = 1; i <= 365; i++) {
      lessons.push(this.createLesson(i));
    }
    LawAIApp.StorageEngine.set('allLessons', lessons);
    return lessons;
  },

  // 获取所有课程
  getAllLessons() {
    return this.generateAllLessons();
  },

  // 根据 day 获取单节课
  getLessonByDay(day) {
    const validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
    const lessons = this.getAllLessons();
    return lessons.find(l => l.day === validDay) || null;
  }
};

// 如果 LessonEngine 还没挂载到 LawAIApp，确保挂载
if (window.LawAIApp && !window.LawAIApp.LessonEngine) {
  window.LawAIApp.LessonEngine = LawAIApp.LessonEngine;
}
