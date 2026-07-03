// manifestReader.js
LawAIApp.ManifestReader = {
  // 解析包清单（来自 pack 对象或 JSON）
  parse(packData) {
    return {
      packId: packData.packId || null,
      academyId: packData.academyId || null,
      title: packData.title || '',
      description: packData.description || '',
      version: packData.version || '1.0.0',
      language: packData.language || 'English',
      author: packData.author || 'Law Academy',
      status: packData.status || 'draft',
      dependencies: packData.dependencies || [],
      createdAt: packData.createdAt || new Date().toISOString(),
      updatedAt: packData.updatedAt || new Date().toISOString(),
      contentIndex: {
        courses: packData.courses || [],
        modules: packData.modules || [],
        lessons: packData.lessons || [],
        practices: packData.practices || [],
        quizzes: packData.quizzes || [],
        projects: packData.projects || [],
        resources: packData.resources || [],
        glossary: packData.glossary || []
      }
    };
  }
};
