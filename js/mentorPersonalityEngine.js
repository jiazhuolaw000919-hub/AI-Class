// ===========================================
// mentorPersonalityEngine.js
// 导师个性引擎主控：集成所有导师模块，影响学习体验
// ===========================================
LawAIApp.MentorPersonalityEngine = {
  // 当前活跃的用户导师组合（临时缓存）
  _activeMentorId: null,

  // 初始化（设置默认导师）
  init(userId) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    this._activeMentorId = mentorId;
    // 监听导师切换事件
    LawAIApp.EventBus.on('MentorChanged', ({ userId, mentorId }) => {
      this._activeMentorId = mentorId;
      // 刷新 UI 或重新生成内容
    });
    console.log(`Mentor Personality Engine activated with ${mentorId}`);
  },

  // 获取当前导师档案
  getCurrentMentorProfile(userId) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    return LawAIApp.MentorProfiles.getMentor(mentorId);
  },

  // 获取导师记忆
  getMentorMemory(userId) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    return LawAIApp.MentorMemory.getMemory(userId, mentorId);
  },

  // 更新导师记忆
  updateMemory(userId, updates) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    LawAIApp.MentorMemory.updateMemory(userId, mentorId, updates);
  },

  // 应用导师个性到内容生成（示例：修改课程生成提示）
  async getPersonalizedCourse(userId, domain, difficulty) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    const context = {
      userLevel: LawAIApp.AuthService.getCurrentUser()?.level || 1,
      weakSkills: LawAIApp.MentorMemory.getMemory(userId, mentorId).weakSkills
    };
    // 构建带有个性的系统提示（未来用于真实 AI 调用）
    const systemPrompt = LawAIApp.MentorPromptBuilder.buildSystemPrompt(mentorId, context);
    // 模拟生成课程（实际应调用课程生成器并传入个性参数）
    const baseCourse = await LawAIApp.CourseGenerator?.generateCourse(domain, difficulty);
    return { ...baseCourse, mentorPersonality: mentorId, promptUsed: systemPrompt };
  },

  // 为任务获取个性化指令
  getInstructionsForTask(userId, taskType) {
    const mentorId = LawAIApp.MentorSelector.getCurrentMentor(userId);
    return LawAIApp.MentorPromptBuilder.getTaskInstructions(mentorId, taskType);
  },

  // 获取仪表盘数据
  getDashboard(userId) {
    const mentor = this.getCurrentMentorProfile(userId);
    const memory = this.getMentorMemory(userId);
    return {
      currentMentor: mentor,
      teachingPhilosophy: mentor.focus,
      strengths: mentor.bestFor,
      recommendedLearningStyle: mentor.style,
      compatibilityScore: Math.min(100, memory.interactionCount * 5 + 50),
      memory
    };
  }
};
