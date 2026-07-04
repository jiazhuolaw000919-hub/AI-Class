// ===========================================
// lessonGenerator.js
// 课程生成引擎：支持图谱节点生成 + 个性化用户课程生成
// ✅ 保留全部旧功能（generateFromNode）
// ✅ 新增 Season 4 Chapter 3 功能（generatePersonalizedLesson）
// ===========================================
LawAIApp.LessonGenerator = {
  // ========== 旧功能：从图谱节点生成课时对象 ==========
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
  },

  // ========== 新功能：为特定用户生成个性化课程内容 ==========
  async generatePersonalizedLesson(courseId, userId) {
    // 获取用户技能（弱项）
    let weakSkills = [];
    try {
      const userSkills = await LawAIApp.SkillApi.getUserSkills(userId);
      weakSkills = (userSkills.skills || [])
        .filter(s => s.mastery_level < 50)
        .map(s => s.skill_id);
    } catch (e) {
      // 兼容 SkillApi 未加载的情况
      console.warn('SkillApi not available, proceeding without weak skill data.');
    }

    // 获取用户已完成课程
    let completedLessons = [];
    try {
      const userProgress = await LawAIApp.Database.from('user_progress')
        .eq('user_id', userId)
        .select();
      completedLessons = (userProgress.data || [])
        .filter(p => p.completed)
        .map(p => p.lesson_id);
    } catch (e) {
      console.warn('Database not available, proceeding without progress data.');
    }

    // 获取课程的所有课程
    let lessons = [];
    try {
      const { data } = await LawAIApp.Database.from('lessons')
        .eq('course_id', courseId)
        .select();
      lessons = data || [];
    } catch (e) {
      // 回退到课程引擎中的课程数据
      const allLessons = LawAIApp.LessonEngine?.getAllLessons() || [];
      lessons = allLessons.map(l => ({
        id: l.lessonId,
        title: l.title,
        content: l,
        order_index: l.day || 0
      }));
    }

    if (!lessons || lessons.length === 0) return null;

    // 挑选尚未完成的课程，优先包含弱项相关内容的课程
    let candidates = lessons.filter(l => !completedLessons.includes(l.id));
    if (candidates.length === 0) candidates = lessons;

    // 简单加权：如果课程标题包含弱技能名，给予更高优先级
    candidates.sort((a, b) => {
      const aMatch = weakSkills.some(skill =>
        a.title.toLowerCase().includes(skill.replace('skill_','').replace(/_/g,' '))
      );
      const bMatch = weakSkills.some(skill =>
        b.title.toLowerCase().includes(skill.replace('skill_','').replace(/_/g,' '))
      );
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return (a.order_index || 0) - (b.order_index || 0);
    });

    const selectedLesson = candidates[0];

    // 个性化内容：在原有内容基础上注入弱项提示
    let content = selectedLesson.content;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch (e) { content = {}; }
    }
    if (!content || typeof content !== 'object') content = {};

    if (weakSkills.length > 0) {
      content.personalizedNote = `This lesson will help strengthen your weak areas: ${weakSkills.join(', ')}.`;
    }

    return { ...selectedLesson, content };
  }
};
