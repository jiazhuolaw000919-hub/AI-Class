// completion.js
LawAIApp.CompletionModule = {
  attachEvent(lessonId) {
    const btn = document.querySelector('.complete-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // 完成课程，更新进度、XP、成就等
      LawAIApp.ProgressEngine.completeLesson(lessonId);
      // 更新连续学习天数
      LawAIApp.StreakEngine.updateStreak();

      // Phase 4 新增：将课程添加到 Second Brain（永久知识库）
      if (LawAIApp.SecondBrain && LawAIApp.SecondBrain.getEntry) {
        LawAIApp.SecondBrain.getEntry(lessonId);
      }
      // Phase 4 新增：创建该课程的复习任务（1,3,7,30天后）
      if (LawAIApp.ReviewQueue && LawAIApp.ReviewQueue.addLessonToReview) {
        LawAIApp.ReviewQueue.addLessonToReview(lessonId);
      }

      // 保存用户在课程页面输入的笔记（原有功能）
      const noteArea = document.querySelector('.note-field');
      if (noteArea && noteArea.value.trim()) {
        const allLessons = LawAIApp.LessonEngine.getAllLessons();
        const lesson = allLessons.find(l => l.lessonId === lessonId);
        if (lesson) {
          lesson.notes = lesson.notes || [];
          lesson.notes.push({
            text: noteArea.value.trim(),
            date: new Date().toISOString()
          });
          LawAIApp.StorageEngine.set('allLessons', allLessons);
        }
      }

      // 返回学习列表
      LawAIApp.Router.navigate('learning');
    });
  }
};
