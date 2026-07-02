// lessonEngine.js
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
    const stage = this.stages.find(s => day >= s.range[0] && day <= s.range[1]);
    const category = this.categories[day % this.categories.length];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const difficulty = difficulties[Math.min(Math.floor(day / 122), 2)];
    const baseXP = 20 + Math.floor(day / 5);

    return {
      lessonId: `day-${day}`,
      day: day,
      title: `Day ${day}: ${category} Fundamentals`,
      subtitle: `Deep dive into ${category} concepts`,
      category: category,
      difficulty: difficulty,
      duration: `${Math.floor(Math.random() * 10) + 5} min`,
      estimatedTime: Math.floor(Math.random() * 12) + 5, // 分钟
      officialArticle: `https://example.com/article/day-${day}`,
      officialVideo: `https://example.com/video/day-${day}`,
      summary: `Fake summary for day ${day}. Learn about ${category}.`,
      notes: [], // 用户笔记（未来）
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
      reviewLevel: 'Need Review', // Need Review, Reviewed, Mastered
      xpReward: baseXP,
      tags: [category.toLowerCase(), difficulty.toLowerCase()],
      futureAIUpdate: {}
    };
  },

  // 批量生成全部课程，已存在则跳过（幂等）
  generateAllLessons(force = false) {
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
    const lessons = this.getAllLessons();
    return lessons.find(l => l.day === day) || null;
  }
};
