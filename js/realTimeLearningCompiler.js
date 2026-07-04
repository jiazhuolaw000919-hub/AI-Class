// ===========================================
// realTimeLearningCompiler.js
// 编译最终学习流，提供给前端渲染
// ===========================================
LawAIApp.RealTimeLearningCompiler = {
  async compileLessonStream(strategy) {
    const course = await LawAIApp.AdaptiveCourseEngine.generateCourse(strategy);
    if (!course) return [];
    // 转换为界面可用的列表
    return course.lessons.map(l => ({
      id: l.id,
      title: l.title,
      explanation: l.conceptExplanation,
      practice: l.practiceTasks[0]?.description || '',
      assessment: l.miniAssessment.questions[0]?.question || ''
    }));
  }
};
