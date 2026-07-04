// ===========================================
// userInitializer.js
// 用户初始化器：新用户首次登录时执行
// ===========================================
LawAIApp.UserInitializer = {
  async initializeNewUser(user) {
    console.log('[UserInit] Initializing new user profile for ' + user.name);

    // 1. 分配初始技能图谱（默认技能）
    const defaultSkills = ['AI Basics', 'Learning How to Learn', 'Productivity'];
    for (const skillName of defaultSkills) {
      const skillId = `skill_${skillName.toLowerCase().replace(/\s/g, '_')}`;
      await LawAIApp.SkillApi.updateMastery(user.id, skillId, 5);
    }

    // 2. 生成入门课程（调用AI引擎）
    const starterCourse = await LawAIApp.CourseGenerator?.generateCourse('AI Basics', 'beginner');
    if (starterCourse) {
      // 将课程保存到数据库
      await LawAIApp.CourseApi.createCourse({
        title: starterCourse.title,
        description: starterCourse.description,
        difficulty: 'beginner',
        domain: 'AI Basics',
        createdByAI: true
      });
    }

    // 3. 创建初始学习路径
    const initialPath = await LawAIApp.AdaptivePathEngine?.getNextBestLesson(user.id);
    LawAIApp.StorageEngine.set(`user_path_${user.id}`, initialPath);

    // 4. 触发新手引导
    LawAIApp.OnboardingEngine.startOnboarding(user);

    LawAIApp.EventBus.emit('UserInitialized', user);
    return true;
  }
};
