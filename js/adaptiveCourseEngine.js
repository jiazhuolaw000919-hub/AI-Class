// ===========================================
// adaptiveCourseEngine.js
// 生成完整课程对象
// ===========================================
LawAIApp.AdaptiveCourseEngine = {
  async generateCourse(strategy, options = {}) {
    const nodeIds = LawAIApp.GraphPathResolver.resolvePath(strategy, options);
    if (nodeIds.length === 0) return null;

    const context = { strategy, nodeIds };
    const curriculum = LawAIApp.AgentCurriculumConsensus.designCurriculum(context);
    const lessons = [];

    nodeIds.forEach(nodeId => {
      const node = LawAIApp.GraphNodeManager.getNode(nodeId);
      if (node) {
        lessons.push(LawAIApp.LessonGenerator.generateFromNode(node, curriculum));
      }
    });

    return {
      id: 'adaptive_course_' + Date.now(),
      strategy,
      generatedAt: new Date().toISOString(),
      lessons,
      curriculumMeta: curriculum
    };
  }
};
