// lessonMemory.js
LawAIApp.LessonMemory = {
  generateSummary(lesson) {
    return `Summary for "${lesson.title}": ${lesson.description}`;
  },
  generateKeywords(lesson) {
    return lesson.keywords.join(', ');
  },
  generateMemoryHook(lesson) {
    return `Think of ${lesson.title} whenever you use a smartphone.`;
  }
};
