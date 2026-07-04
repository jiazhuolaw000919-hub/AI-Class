// ===========================================
// apiClient.js (统一 API 客户端)
// 可切换为真实 Supabase 客户端
// ===========================================
LawAIApp.API = {
  // 配置连接 (未来填写 Supabase URL/Key)
  init(config) {
    this.baseUrl = config.baseUrl || '';
    // 如果提供了 Supabase 客户端，则使用
    // this.supabase = supabase.createClient(config.url, config.key);
  },
  // 便捷方法
  users: LawAIApp.UserApi,
  courses: LawAIApp.CourseApi,
  lessons: LawAIApp.LessonApi,
  progress: LawAIApp.ProgressApi,
  skills: LawAIApp.SkillApi
};
