// smartProjectData.js
LawAIApp.SmartProjectData = {
  getProjectsByModule(moduleId) {
    if (moduleId === 'module_ai_intro') {
      return [
        {
          projectId: 'proj_ai_intro_1',
          academyId: 'academy_ai_foundation',
          courseId: 'course_ai_fundamentals',
          moduleId: 'module_ai_intro',
          title: 'Create an AI Awareness Poster',
          description: 'Design a one-page visual that explains what AI is to a non-technical audience.',
          difficulty: 'Beginner',
          estimatedHours: 2,
          estimatedXP: 200,
          requiredSkills: ['AI Basics', 'Communication'],
          recommendedLessons: ['module_ai_intro_lesson1', 'module_ai_intro_lesson2'],
          milestones: [
            { id: 'm1', name: 'Research AI definition', completed: false },
            { id: 'm2', name: 'Draft content', completed: false },
            { id: 'm3', name: 'Design poster layout', completed: false },
            { id: 'm4', name: 'Final review', completed: false }
          ],
          checklist: [
            'Include a clear AI definition',
            'Use simple language',
            'Add at least one example',
            'Make it visually appealing'
          ],
          resources: [
            { title: 'AI Definition Guide', url: 'https://example.com/ai-definition', type: 'article' },
            { title: 'Canva Design Tool', url: 'https://www.canva.com', type: 'tool' }
          ],
          aiTips: [
            'Focus on one core message',
            'Use analogies to explain AI',
            'Keep the design clean'
          ]
        }
      ];
    }
    // 其他模块的项目...
    return [];
  }
};
