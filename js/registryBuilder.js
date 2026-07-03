// registryBuilder.js
LawAIApp.RegistryBuilder = {
  build() {
    const registry = {
      academies: [],
      courses: [],
      modules: [],
      lessons: [],
      resources: [],
      projects: []
    };

    try {
      if (LawAIApp.AcademyData) {
        registry.academies = LawAIApp.AcademyData.academies || [];
      }
      if (LawAIApp.CourseData) {
        registry.courses = LawAIApp.CourseData.courses || [];
      }
      if (LawAIApp.ModuleData) {
        registry.modules = LawAIApp.ModuleData.modules || [];
      }
      if (LawAIApp.LessonEngine) {
        registry.lessons = LawAIApp.LessonEngine.getAllLessons() || [];
      }
      if (LawAIApp.ResourceEngine) {
        registry.resources = LawAIApp.ResourceEngine.getAllResources ? LawAIApp.ResourceEngine.getAllResources() : [];
      }
      if (LawAIApp.ProjectTracker) {
        registry.projects = LawAIApp.ProjectTracker.getActiveProjects() || [];
      }
    } catch (e) {
      console.warn('RegistryBuilder error:', e);
    }
    return registry;
  }
};
