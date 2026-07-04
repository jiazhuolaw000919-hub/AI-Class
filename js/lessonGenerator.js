// ===========================================
// lessonGenerator.js
// 生成单个课时对象
// ===========================================
LawAIApp.LessonGenerator = {
  generateFromNode(node, context = {}) {
    const lesson = {
      id: 'gen_lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
      title: node.title || node.id,
      conceptExplanation: `Explanation for ${node.title || 'this topic'}.`,
      examples: [`Example 1 for ${node.title}`, `Example 2 for ${node.title}`],
      practiceTasks: [
        { type: 'mini_exercise', description: 'Summarize the core concept in one sentence.' }
      ],
      miniAssessment: {
        questions: [
          { question: `What is ${node.title}?`, answer: 'Answer' }
        ]
      },
      memoryReinforcement: context.retentionOptimized !== false,
      nodeId: node.id,
      generatedAt: new Date().toISOString()
    };
    return lesson;
  }
};
