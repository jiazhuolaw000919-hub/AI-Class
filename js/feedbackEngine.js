// ===========================================
// feedbackEngine.js
// 反馈智能引擎：根据测验和进度数据生成个性化反馈与改进建议
// ===========================================
LawAIApp.FeedbackEngine = {
  // 生成课后反馈
  async generateLessonFeedback(userId, lessonId, score) {
    const userSkills = await LawAIApp.SkillApi.getUserSkills(userId);
    const weakSkills = userSkills.skills.filter(s => s.mastery_level < 50).map(s => s.skill_id.replace('skill_','').replace(/_/g,' '));
    
    let message = '';
    let motivation = '';
    let suggestions = [];

    if (score >= 80) {
      message = 'Excellent work! You have a strong understanding of this topic.';
      motivation = 'Keep up the great momentum!';
    } else if (score >= 50) {
      message = 'Good effort! There are a few areas to review.';
      if (weakSkills.length > 0) {
        suggestions = weakSkills.map(s => `Review concepts related to ${s}.`);
      }
    } else {
      message = 'This topic seems challenging. Let’s break it down together.';
      suggestions = ['Revisit the core explanation.', 'Try the practice task again.'];
    }

    const feedback = {
      userId,
      lessonId,
      score,
      message,
      motivation,
      suggestions,
      generatedAt: new Date().toISOString()
    };

    // 存储反馈（可存入 assessment_results 或自定义表）
    LawAIApp.EventBus.emit('FeedbackGenerated', feedback);
    return feedback;
  }
};

// ===========================================
// 集成入口：当课程完成时自动调用反馈引擎
// ===========================================
LawAIApp.EventBus.on('ProgressUpdated', (data) => {
  if (data.lessonId && data.score) {
    LawAIApp.FeedbackEngine.generateLessonFeedback(data.userId, data.lessonId, data.score);
  }
});
