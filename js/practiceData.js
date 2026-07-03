// practiceData.js
LawAIApp.PracticeData = {
  // 获取某模块的实践任务列表
  getPracticesByModule(moduleId) {
    if (moduleId === 'module_ai_intro') {
      return [
        {
          practiceId: 'practice_ai_intro_1',
          moduleId: 'module_ai_intro',
          courseId: 'course_ai_fundamentals',
          academyId: 'academy_ai_foundation',
          lessonId: 'module_ai_intro_lesson1', // 关联到第1课
          title: 'Define AI in Your Own Words',
          description: 'Apply what you learned about the definition of AI.',
          difficulty: 'Easy',
          estimatedMinutes: 5,
          estimatedXP: 20,
          objectives: [
            'Explain AI to a non-technical person',
            'Use simple language'
          ],
          successCriteria: 'Your explanation should be clear and avoid jargon.',
          hints: [
            'Think about how you would describe AI to a friend.',
            'Mention that AI can learn from data.'
          ],
          status: 'published'
        },
        {
          practiceId: 'practice_ai_intro_2',
          moduleId: 'module_ai_intro',
          courseId: 'course_ai_fundamentals',
          academyId: 'academy_ai_foundation',
          lessonId: 'module_ai_intro_lesson2',
          title: 'Compare AI and Automation',
          description: 'Identify three differences between AI and traditional automation.',
          difficulty: 'Normal',
          estimatedMinutes: 8,
          estimatedXP: 30,
          objectives: [
            'Understand the distinction between AI and automation',
            'Provide concrete examples'
          ],
          successCriteria: 'List at least 3 clear differences with examples.',
          hints: [
            'Think about a self-driving car vs. a washing machine.',
            'Consider adaptability.'
          ],
          status: 'published'
        }
      ];
    }
    return [];
  }
};
