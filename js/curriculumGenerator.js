// ===========================================
// curriculumGenerator.js
// 主引擎：实时自适应课程生成器
// ===========================================
LawAIApp.CurriculumGenerator = {
  strategies: ['shortest', 'mastery-first', 'weakness-targeted', 'project-driven'],
  async generate(strategy = 'mastery-first', options = {}) {
    if (!this.strategies.includes(strategy)) {
      strategy = 'mastery-first';
    }
    // 1. 收集用户状态
    const userState = LawAIApp.LearningStateManager.getState();
    // 2. 调用核心生成
    const course = await LawAIApp.AdaptiveCourseEngine.generateCourse(strategy, {
      ...options,
      userState
    });
    if (!course) return null;
    // 3. 编译为学习流
    const stream = await LawAIApp.RealTimeLearningCompiler.compileLessonStream(strategy);
    LawAIApp.EventBus.emit('CurriculumGenerated', { course, stream });
    return { course, stream };
  },
  // 便捷方法：根据用户当前弱项生成针对性课程
  async generateWeaknessCourse() {
    return this.generate('weakness-targeted');
  },
  // 根据长期目标生成课程
  async generateGoalAlignedCourse() {
    return this.generate('mastery-first');
  }
};
