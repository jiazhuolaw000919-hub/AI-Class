// completion.js
LawAIApp.CompletionModule = {
  attachEvent(lessonId) {
    const btn = document.querySelector('.complete-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      LawAIApp.ProgressEngine.completeLesson(lessonId);
      LawAIApp.StreakEngine.updateStreak();
      // 更新本地笔记（如果有）
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
      // 返回学习页面或显示完成状态
      LawAIApp.Router.navigate('learning');
    });
  }
};
