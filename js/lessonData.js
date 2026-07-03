// lessonData.js
LawAIApp.LessonData = {
  // 获取模块内的课程列表
  getLessonsByModule(moduleId) {
    if (moduleId === 'module_ai_intro') {
      return [
        {
          lessonId: 'module_ai_intro_lesson1',
          moduleId: 'module_ai_intro',
          courseId: 'course_ai_fundamentals',
          academyId: 'academy_ai_foundation',
          title: 'What is Artificial Intelligence?',
          shortTitle: 'What is AI?',
          description: 'Learn the fundamental definition of AI and what makes machines intelligent.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          estimatedXP: 50,
          order: 1,
          tags: ['AI', 'Definition'],
          keywords: ['AI', 'Machine Learning', 'Automation'],
          version: '1.0',
          status: 'published',
          author: 'Law Academy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          lessonId: 'module_ai_intro_lesson2',
          moduleId: 'module_ai_intro',
          courseId: 'course_ai_fundamentals',
          academyId: 'academy_ai_foundation',
          title: 'AI vs Automation vs Human Intelligence',
          shortTitle: 'AI vs Automation',
          description: 'Understand the differences between AI, automation and human cognition.',
          difficulty: 'Beginner',
          estimatedMinutes: 12,
          estimatedXP: 60,
          order: 2,
          tags: ['AI', 'Comparison'],
          keywords: ['Automation', 'Human Intelligence', 'Differences'],
          version: '1.0',
          status: 'published',
          author: 'Law Academy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          lessonId: 'module_ai_intro_lesson3',
          moduleId: 'module_ai_intro',
          courseId: 'course_ai_fundamentals',
          academyId: 'academy_ai_foundation',
          title: 'Everyday AI: Examples Around You',
          shortTitle: 'Everyday AI',
          description: 'Explore how AI is already part of your daily life.',
          difficulty: 'Beginner',
          estimatedMinutes: 8,
          estimatedXP: 40,
          order: 3,
          tags: ['AI', 'Examples'],
          keywords: ['Smartphones', 'Recommendations', 'Voice Assistants'],
          version: '1.0',
          status: 'published',
          author: 'Law Academy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    // 其他模块的课程可类似添加
    return [];
  }
};
