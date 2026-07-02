// lessonEvents.js
LawAIApp.LessonEvents = {
  // 当课程完成时触发的完整事件流
  onLessonCompleted(lessonId) {
    console.log(`Event: Lesson ${lessonId} completed`);
    // 1. 更新进度 (ProgressEngine)
    LawAIApp.ProgressEngine.completeLesson(lessonId);
    // 2. 更新连续签到
    LawAIApp.StreakEngine.updateStreak();
    // 3. 更新成就
    LawAIApp.AchievementEngine.checkAll();
    // 4. 添加到复习队列
    LawAIApp.ReviewQueue.addLessonToReview(lessonId);
    // 5. 创建第二大脑条目
    LawAIApp.SecondBrain.getEntry(lessonId);
    // 6. 更新课程/模块进度（以后实现）
    // 7. 通知 AI Mentor（预留）
    // 8. 更新统计（Statistics 在渲染时实时计算，无需额外操作）
    // 9. 存储当前课程状态 (已在 completeLesson 中)
    console.log(`Event flow completed for ${lessonId}`);
  },

  onLessonOpened(lessonId) {
    // 预留：更新 lastOpened 时间等
  }
};
