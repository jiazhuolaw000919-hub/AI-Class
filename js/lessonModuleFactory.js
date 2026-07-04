// ===========================================
// lessonModuleFactory.js
// 课程模块工厂：为技能批量生成结构化的课程和练习题
// ===========================================
LawAIApp.LessonModuleFactory = {
  // 根据技能定义和所属领域生成一组课程
  generateLessonsForSkill(skillId, domainId, count = 3) {
    const skill = LawAIApp.SkillTracker?.getSkill(skillId);
    if (!skill) return [];
    const lessons = [];
    for (let i = 0; i < count; i++) {
      const lessonId = `gen_${domainId}_${skillId}_${i+1}`;
      // 确保课程节点存在于图谱
      LawAIApp.GraphNodeManager.addNode(lessonId, 'lesson', {
        title: `${skill.title} – Part ${i+1}`,
        category: skill.title,
        strength: 50 + i*5,
        completed: false
      });

      // 生成课程内容（模拟，真实内容可由AI填充）
      const lessonObj = {
        lessonId,
        title: `${skill.title} – Part ${i+1}`,
        description: `Learn the core concepts of ${skill.title}.`,
        content: `This is auto-generated content for ${skill.title}.`,
        practiceTasks: [
          {
            type: 'exercise',
            description: `Explain ${skill.title} in your own words.`
          }
        ],
        xpReward: 20 + i*10
      };
      // 注册到 LessonEngine（如果存在 createLesson 方法）
      if (LawAIApp.LessonEngine?.createLesson) {
        LawAIApp.LessonEngine.createLesson(lessonObj);
      }
      lessons.push(lessonId);

      // 建立技能与课程的边
      LawAIApp.GraphEdgeManager.addEdge(skillId, lessonId, 'contains_lesson', 1);
      // 为课程创建认证路径（前置关系链）
      if (i > 0) {
        const prevLessonId = `gen_${domainId}_${skillId}_${i}`;
        LawAIApp.GraphEdgeManager.addEdge(prevLessonId, lessonId, 'prerequisite', 1);
      }
    }
    return lessons;
  }
};
