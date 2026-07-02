// learningPathGenerator.js
LawAIApp.LearningPathGenerator = {
  getNextLesson() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const day = prog.currentLesson;
    const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
    return lesson ? lesson.lessonId : null;
  },

  getNextModule() {
    // 简单：当前课程所在模块的下一模块（根据课程ID映射，先返回null）
    return null; // 待实现，不影响推荐生成
  },

  getNextCourse() {
    return null;
  }
};
