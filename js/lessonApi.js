// ===========================================
// lessonApi.js
// 课程内容与完成 API
// ===========================================
LawAIApp.LessonApi = {
  async getLesson(lessonId) {
    const { data, error } = await LawAIApp.Database.from('lessons').eq('id', lessonId).select();
    return { success: !error, lesson: data?.[0] || null, error };
  },

  async completeLesson(userId, lessonId, score = 100) {
    // 1. 插入或更新进度
    const existing = await LawAIApp.Database.from('user_progress')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select();
    
    if (existing.data && existing.data.length > 0) {
      await LawAIApp.Database.from('user_progress').update({
        id: existing.data[0].id,
        completed: true,
        score,
        last_updated: new Date().toISOString()
      }, 'id');
    } else {
      await LawAIApp.Database.from('user_progress').insert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        score
      });
    }

    // 2. 调用进度API触发连锁更新
    await LawAIApp.ProgressApi.updateProgress(userId, lessonId, score);
    
    return { success: true };
  }
};
