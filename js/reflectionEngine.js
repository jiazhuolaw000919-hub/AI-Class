// ===========================================
// reflectionEngine.js
// 反思引擎：收集并保存学习反思
// ===========================================
LawAIApp.ReflectionEngine = {
  // 记录反思
  saveReflection(userId, lessonId, reflection) {
    const key = `reflections_${userId}`;
    const reflections = LawAIApp.StorageEngine.get(key, []);
    reflections.push({
      lessonId,
      reflection,
      date: new Date().toISOString()
    });
    LawAIApp.StorageEngine.set(key, reflections);
    LawAIApp.EventBus.emit('ReflectionSaved', { userId, lessonId });
  },

  // 获取用户的所有反思
  getReflections(userId) {
    return LawAIApp.StorageEngine.get(`reflections_${userId}`, []);
  }
};
