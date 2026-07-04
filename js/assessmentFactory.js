// ===========================================
// assessmentFactory.js
// 评估工厂：为课程自动生成测验与评估规则
// ===========================================
LawAIApp.AssessmentFactory = {
  // 为某个课程生成评估节点，并返回评估 ID
  generateAssessment(lessonId) {
    const node = LawAIApp.GraphNodeManager.getNode(lessonId);
    if (!node) return null;
    const assessmentId = `assess_${lessonId}`;
    // 创建评估节点
    LawAIApp.GraphNodeManager.addNode(assessmentId, 'assessment', {
      title: `Assessment for ${node.title}`,
      type: 'quiz',
      questions: [
        { q: `What is the main concept of ${node.title}?`, a: 'Answer' },
        { q: 'Provide an example of this concept.', a: 'Example' }
      ],
      passingScore: 70,
      lessonId
    });
    // 关联课程与评估
    LawAIApp.GraphEdgeManager.addEdge(lessonId, assessmentId, 'has_assessment', 1);
    return assessmentId;
  },

  // 批量生成评估
  generateForLessons(lessonIds) {
    return lessonIds.map(id => this.generateAssessment(id)).filter(Boolean);
  }
};
