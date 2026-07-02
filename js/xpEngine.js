// xpEngine.js
LawAIApp.XPEngine = (function() {
  // 内部存储（也可用 StorageEngine，但为了独立）
  function getXPData() {
    return LawAIApp.StorageEngine.get('xp_data', { totalXP: 0, lifetimeXP: 0, currentLevel: 1 });
  }

  function saveXPData(data) {
    LawAIApp.StorageEngine.set('xp_data', data);
  }

  // 初始化时注册事件
  LawAIApp.EventBus.on('LessonCompleted', function(payload) {
    const lessonId = payload.lessonId;
    if (!lessonId) return;
    awardXP('lesson_completion', lessonId);
  });

  // 发放 XP
  function awardXP(source, lessonId, customMultiplier = 1.0) {
    const baseXP = LawAIApp.XPCalculator.getBaseXP(lessonId);
    const finalXP = LawAIApp.XPCalculator.calculateFinalXP(lessonId, customMultiplier);
    const data = getXPData();
    const previousLevel = data.currentLevel || 1;
    data.totalXP += finalXP;
    data.lifetimeXP += finalXP;

    // 计算新等级
    const levelInfo = LawAIApp.LevelSystem.getLevelInfo(data.totalXP);
    data.currentLevel = levelInfo.level;

    saveXPData(data);

    // 同步更新 Progress 中的 XP（保持兼容）
    const prog = LawAIApp.ProgressEngine.getProgress();
    prog.xp = data.totalXP;
    LawAIApp.ProgressEngine.saveProgress(prog);

    // 记录历史
    LawAIApp.XPHistory.addEntry({
      source: source,
      lessonId: lessonId,
      baseXP: baseXP,
      finalXP: finalXP,
      multiplier: customMultiplier,
      totalXP: data.totalXP
    });

    // 发布事件
    LawAIApp.EventBus.emit('XPAwarded', { lessonId, baseXP, finalXP, totalXP: data.totalXP });
    LawAIApp.EventBus.emit('XPUpdated', { totalXP: data.totalXP, level: data.currentLevel });
    if (data.currentLevel > previousLevel) {
      LawAIApp.EventBus.emit('LevelUp', { newLevel: data.currentLevel, totalXP: data.totalXP });
    }
  }

  function getCurrentXP() {
    return getXPData().totalXP;
  }

  function getLifetimeXP() {
    return getXPData().lifetimeXP;
  }

  function getCurrentLevel() {
    return getXPData().currentLevel;
  }

  return { awardXP, getCurrentXP, getLifetimeXP, getCurrentLevel };
})();
