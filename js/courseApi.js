// ===========================================
// courseApi.js
// 课程相关 API
// ===========================================
LawAIApp.CourseApi = {
  async listCourses() {
    const { data, error } = await LawAIApp.Database.from('courses').select();
    return { success: !error, courses: data || [], error };
  },

  async getCourse(courseId) {
    const { data, error } = await LawAIApp.Database.from('courses').eq('id', courseId).select();
    return { success: !error, course: data?.[0] || null, error };
  },

  async createCourse(courseDef) {
    const { data, error } = await LawAIApp.Database.from('courses').insert({
      title: courseDef.title,
      description: courseDef.description || '',
      difficulty_level: courseDef.difficulty || 'beginner',
      domain: courseDef.domain || '',
      created_by_ai: courseDef.createdByAI || false
    });
    if (error) return { success: false, error };
    LawAIApp.EventBus.emit('CourseCreated', data[0]);
    return { success: true, course: data[0] };
  }
};
