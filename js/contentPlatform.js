// contentPlatform.js
LawAIApp.ContentPlatform = (function() {
  // 自动注册现有课程作为内容（例）
  function seedContent() {
    const lessons = LawAIApp.LessonEngine.getAllLessons();
    lessons.slice(0, 10).forEach(lesson => {
      const contentId = `content_${lesson.lessonId}`;
      if (!LawAIApp.ContentRegistry.get(contentId)) {
        LawAIApp.ContentRegistry.register({
          contentId,
          academyId: 'academy_ai',
          courseId: null,
          moduleId: null,
          lessonId: lesson.lessonId,
          type: 'lesson',
          status: 'published',
          version: '1.0',
          author: 'Law Academy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        });
      }
    });
  }

  // 初始化
  seedContent();

  return {
    register: LawAIApp.ContentRegistry.register,
    get: LawAIApp.ContentRegistry.get,
    filter: LawAIApp.ContentRegistry.filter,
    archive: LawAIApp.ContentRegistry.archive,
    validate: LawAIApp.ContentValidator.fullCheck,
    advance: LawAIApp.ContentPipeline.advance,
    createVersion: LawAIApp.ContentVersion.createVersion,
    getHistory: LawAIApp.ContentVersion.getHistory
  };
})();
