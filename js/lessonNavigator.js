// lessonNavigator.js
LawAIApp.LessonNavigator = {
  getNextLessonId(currentLessonId, moduleId) {
    const lessons = LawAIApp.LessonData.getLessonsByModule(moduleId);
    const currentIdx = lessons.findIndex(l => l.lessonId === currentLessonId);
    if (currentIdx !== -1 && currentIdx < lessons.length - 1) {
      return lessons[currentIdx + 1].lessonId;
    }
    return null;
  },
  getPrevLessonId(currentLessonId, moduleId) {
    const lessons = LawAIApp.LessonData.getLessonsByModule(moduleId);
    const currentIdx = lessons.findIndex(l => l.lessonId === currentLessonId);
    if (currentIdx > 0) {
      return lessons[currentIdx - 1].lessonId;
    }
    return null;
  }
};
