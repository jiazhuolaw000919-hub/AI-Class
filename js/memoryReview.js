// memoryReview.js
LawAIApp.MemoryReview = {
  // 对某个知识点执行一次复习，并返回反馈
  performReview(lessonId, method = 'flashcard') {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return { success: false, message: 'Lesson not found' };

    // 模拟复习活动（未来可接入实际UI）
    const quality = Math.random() > 0.3 ? 'good' : 'partial'; // 随机模拟结果
    LawAIApp.MemoryScheduler.completeReview(lessonId, quality);

    return {
      success: true,
      method,
      lessonTitle: lesson.title,
      quality,
      nextReviewDate: LawAIApp.MemoryTracker.getOrCreate(lessonId).nextReviewDate
    };
  },

  // 批量复习
  performBatchReview(lessonIds, method = 'mini_quiz') {
    const results = [];
    lessonIds.forEach(id => {
      results.push(this.performReview(id, method));
    });
    return results;
  },

  // 生成复习提示（闪卡问题等）
  generateRecallPrompt(lessonId) {
    if (LawAIApp.RecallEngine) {
      return LawAIApp.RecallEngine.generateRecallPrompt(lessonId);
    }
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    return lesson ? `What is the main concept of "${lesson.title}"?` : '';
  }
};
