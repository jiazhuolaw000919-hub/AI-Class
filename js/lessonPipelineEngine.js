// ===========================================
// lessonPipelineEngine.js
// 课程流水线引擎：批量生成结构化课程及其练习、评估
// ===========================================
LawAIApp.LessonPipelineEngine = {
  // 为给定的技能列表批量生成课程，返回 lessonIds
  generateLessonsForClusters(clusters, domainId, lessonsPerSkill = 3) {
    const allLessonIds = [];
    clusters.forEach(cluster => {
      for (let i = 0; i < lessonsPerSkill; i++) {
        const lessonId = `gen_${domainId}_${cluster.skillId}_${i+1}`;
        // 确保节点存在
        LawAIApp.GraphNodeManager.addNode(lessonId, 'lesson', {
          title: `${cluster.name} – Lesson ${i+1}`,
          category: cluster.name,
          strength: 60,
          completed: false
        });
        // 关联技能与课程
        LawAIApp.GraphEdgeManager.addEdge(cluster.skillId, lessonId, 'contains_lesson', 1);
        // 课程间前置关系
        if (i > 0) {
          const prevLessonId = `gen_${domainId}_${cluster.skillId}_${i}`;
          LawAIApp.GraphEdgeManager.addEdge(prevLessonId, lessonId, 'prerequisite', 1);
        }
        // 生成练习任务（通过图节点附加）
        LawAIApp.GraphNodeManager.addNode(`task_${lessonId}`, 'practice_task', {
          description: `Practice task for ${cluster.name} lesson ${i+1}`,
          lessonId,
          xp: 15
        });
        LawAIApp.GraphEdgeManager.addEdge(lessonId, `task_${lessonId}`, 'has_practice', 1);
        allLessonIds.push(lessonId);
      }
    });
    return allLessonIds;
  }
};
