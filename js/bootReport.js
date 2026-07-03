// bootReport.js
LawAIApp.BootReport = {
  generate(registry, missingEngines, errors) {
    const report = {
      timestamp: new Date().toISOString(),
      loadedAcademies: registry.academies.length,
      loadedCourses: registry.courses.length,
      loadedModules: registry.modules.length,
      loadedLessons: registry.lessons.length,
      loadedResources: registry.resources.length,
      loadedProjects: registry.projects.length,
      missingEngines: missingEngines,
      errors: errors,
      status: errors.length === 0 && missingEngines.length === 0 ? 'healthy' : 'degraded'
    };
    LawAIApp.StorageEngine.set('boot_report', report);
    console.log('📊 Boot Report:', report);
    return report;
  }
};
