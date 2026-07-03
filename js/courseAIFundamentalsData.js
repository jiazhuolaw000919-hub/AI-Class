// courseAIFundamentalsData.js
LawAIApp.CourseAIFundamentalsData = {
  course: {
    id: 'course_ai_fundamentals',
    academyId: 'academy_ai_foundation',
    name: 'AI Fundamentals',
    shortName: 'AI Fundamentals',
    description: 'Your first step into the world of Artificial Intelligence. No prior experience required.',
    version: '1.0',
    status: 'published',
    difficulty: 'Beginner',
    estimatedHours: '4-6',
    estimatedXP: 500,
    learningObjectives: [
      'Explain AI in simple language',
      'Identify common AI tools',
      'Understand AI strengths and limitations',
      'Recognize responsible AI usage',
      'Prepare for advanced topics'
    ],
    skillsGained: [
      'AI Basics',
      'AI Vocabulary',
      'Critical Thinking',
      'AI Awareness',
      'Technology Literacy'
    ],
    prerequisites: [],
    modules: [
      { id: 'module_ai_intro', name: 'Introduction to AI', order: 1 },
      { id: 'module_ai_history', name: 'History of AI', order: 2 },
      { id: 'module_ai_how', name: 'How Modern AI Works', order: 3 },
      { id: 'module_ai_types', name: 'Types of AI', order: 4 },
      { id: 'module_ai_apps', name: 'Real World Applications', order: 5 },
      { id: 'module_ai_myths', name: 'AI Myths', order: 6 },
      { id: 'module_ai_responsible', name: 'Responsible AI', order: 7 },
      { id: 'module_ai_review', name: 'Course Review', order: 8 }
    ],
    resources: [
      { title: 'What is AI?', url: 'https://example.com/what-is-ai', type: 'article' },
      { title: 'AI for Everyone', url: 'https://example.com/ai-for-everyone', type: 'video' }
    ]
  }
};
