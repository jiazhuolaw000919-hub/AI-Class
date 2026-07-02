// progressEvents.js
LawAIApp.ProgressEvents = {
  emitLessonCompleted(lessonId) {
    LawAIApp.EventBus.emit('LessonCompleted', { lessonId }, 'normal');
  },

  emitModuleCompleted(moduleId) {
    LawAIApp.EventBus.emit('ModuleCompleted', { moduleId }, 'normal');
  },

  emitCourseCompleted(courseId) {
    LawAIApp.EventBus.emit('CourseCompleted', { courseId }, 'normal');
  },

  emitAcademyCompleted(academyId) {
    LawAIApp.EventBus.emit('AcademyCompleted', { academyId }, 'normal');
  },

  emitProgressUpdated(payload) {
    LawAIApp.EventBus.emit('ProgressUpdated', payload, 'low');
  }
};
