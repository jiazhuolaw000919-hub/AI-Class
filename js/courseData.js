// courseData.js
LawAIApp.CourseData = {
  courses: [
    {
      id: 'course_ai_foundation',
      academyId: 'academy_ai',
      categoryId: 'cat_ai',
      name: 'AI Foundation',
      shortName: 'AI Foundation',
      description: 'Core principles of artificial intelligence.',
      thumbnail: '',
      banner: '',
      icon: '🧠',
      themeColor: '#3b82f6',
      difficulty: 'Beginner',
      difficultyScore: 10,
      status: 'active',
      enabled: true,
      order: 1,
      estimatedHours: 8,
      estimatedLessons: 30,
      estimatedXP: 600,
      learningObjectives: ['Understand AI basics', 'Learn ML algorithms', 'Build simple models'],
      prerequisites: [],
      recommendedNext: ['course_prompt_engineering', 'course_ai_coding'],
      tags: ['AI', 'Machine Learning', 'Beginner'],
      officialResources: [
        { title: 'AI Guide', url: 'https://example.com/ai', type: 'Documentation' }
      ],
      author: 'Law Academy',
      version: '1.0',
      language: 'English',
      progress: 0,
      completedLessons: 0,
      favorite: false,
      bookmark: false,
      lastOpened: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'course_prompt_engineering',
      academyId: 'academy_ai',
      categoryId: 'cat_ai',
      name: 'Prompt Engineering',
      shortName: 'Prompt Eng.',
      description: 'Master the art of crafting effective prompts.',
      thumbnail: '',
      banner: '',
      icon: '✍️',
      themeColor: '#8b5cf6',
      difficulty: 'Intermediate',
      difficultyScore: 40,
      status: 'active',
      enabled: true,
      order: 2,
      estimatedHours: 5,
      estimatedLessons: 20,
      estimatedXP: 500,
      learningObjectives: ['Write clear prompts', 'Optimize for different models', 'Apply chain-of-thought'],
      prerequisites: ['course_ai_foundation'],
      recommendedNext: ['course_ai_automation'],
      tags: ['Prompt', 'ChatGPT', 'Gemini'],
      officialResources: [
        { title: 'Prompt Guide', url: 'https://example.com/prompt', type: 'Documentation' }
      ],
      author: 'Law Academy',
      version: '1.0',
      language: 'English',
      progress: 0,
      completedLessons: 0,
      favorite: false,
      bookmark: false,
      lastOpened: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'course_ai_coding',
      academyId: 'academy_ai',
      categoryId: 'cat_programming',
      name: 'AI Coding',
      shortName: 'AI Coding',
      description: 'Build AI-powered applications with Python.',
      thumbnail: '',
      banner: '',
      icon: '💻',
      themeColor: '#22c55e',
      difficulty: 'Advanced',
      difficultyScore: 70,
      status: 'active',
      enabled: true,
      order: 3,
      estimatedHours: 12,
      estimatedLessons: 40,
      estimatedXP: 1200,
      learningObjectives: ['Use OpenAI API', 'Train custom models', 'Deploy AI apps'],
      prerequisites: ['course_ai_foundation'],
      recommendedNext: [],
      tags: ['Coding', 'Python', 'API'],
      officialResources: [
        { title: 'OpenAI Docs', url: 'https://platform.openai.com/docs', type: 'Official' }
      ],
      author: 'Law Academy',
      version: '1.0',
      language: 'English',
      progress: 0,
      completedLessons: 0,
      favorite: false,
      bookmark: false,
      lastOpened: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  getById(id) {
    return this.courses.find(c => c.id === id) || null;
  },

  getByAcademyId(academyId) {
    return this.courses.filter(c => c.academyId === academyId);
  },

  getByCategoryId(categoryId) {
    return this.courses.filter(c => c.categoryId === categoryId);
  }
};
