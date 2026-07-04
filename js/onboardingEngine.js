// ===========================================
// onboardingEngine.js
// 新手引导引擎：欢迎 → 评估 → 路径推荐 → 第一课
// ===========================================
LawAIApp.OnboardingEngine = {
  async startOnboarding(user) {
    console.log('[Onboarding] Starting for ' + user.name);

    // 步骤1: 欢迎界面（可由UI控制，这里发送事件）
    LawAIApp.EventBus.emit('OnboardingStep', { step: 1, title: 'Welcome!', message: 'Your personalized learning journey begins now.' });

    // 步骤2: 技能评估（模拟快速测验）
    setTimeout(async () => {
      LawAIApp.EventBus.emit('OnboardingStep', { step: 2, title: 'Skill Assessment', message: 'Let us understand your current level.' });
      // 模拟评估完成
      LawAIApp.StorageEngine.set(`onboarding_${user.id}`, { step: 2, completed: true });
    }, 2000);

    // 步骤3: 生成推荐路径
    setTimeout(async () => {
      const path = await LawAIApp.AdaptivePathEngine?.getNextBestLesson(user.id);
      LawAIApp.EventBus.emit('OnboardingStep', { step: 3, title: 'Your Learning Path', message: 'We have prepared a custom path for you.', path });
    }, 4000);

    // 步骤4: 解锁第一课
    setTimeout(() => {
      LawAIApp.EventBus.emit('OnboardingStep', { step: 4, title: 'First Lesson Unlocked', message: 'Start your first lesson now!' });
    }, 6000);
  }
};
