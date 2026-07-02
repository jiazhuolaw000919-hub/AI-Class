// unlockEngine.js
LawAIApp.UnlockEngine = (function() {
  // 定义所有可解锁项目及其条件
  const unlocks = [
    { type: 'title', id: 'title_knowledge_seeker', name: 'Knowledge Seeker', condition: { lessonsCompleted: 10 } },
    { type: 'title', id: 'title_ai_apprentice', name: 'AI Apprentice', condition: { level: 5 } },
    { type: 'title', id: 'title_prompt_engineer', name: 'Prompt Engineer', condition: { lessonsCompleted: 50 } },
    { type: 'theme', id: 'forest', condition: { level: 10 } },
    { type: 'theme', id: 'sunset', condition: { level: 20 } },
    { type: 'avatar', id: 'avatar_bronze_border', name: 'Bronze Border', condition: { level: 5 } },
    { type: 'avatar', id: 'avatar_silver_border', name: 'Silver Border', condition: { level: 15 } },
    { type: 'environment', id: 'env_ai_lab', name: 'AI Lab', condition: { lessonsCompleted: 30 } }
  ];

  let unlockedItems = LawAIApp.StorageEngine.get('unlocked_items', []);

  function isUnlocked(type, id) {
    return unlockedItems.some(item => item.type === type && item.id === id);
  }

  function unlock(type, id, name) {
    if (!isUnlocked(type, id)) {
      unlockedItems.push({ type, id, name });
      LawAIApp.StorageEngine.set('unlocked_items', unlockedItems);
      LawAIApp.EventBus.emit(`${type.charAt(0).toUpperCase() + type.slice(1)}Unlocked`, { type, id, name });
    }
  }

  function checkAll() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();
    unlocks.forEach(u => {
      if (isUnlocked(u.type, u.id)) return;
      let satisfied = true;
      if (u.condition.lessonsCompleted && progress.completedLessons.length < u.condition.lessonsCompleted) satisfied = false;
      if (u.condition.level && levelInfo.level < u.condition.level) satisfied = false;
      if (satisfied) unlock(u.type, u.id, u.name);
    });
  }

  // 监听进度变化
  LawAIApp.EventBus.on('LessonCompleted', checkAll);
  LawAIApp.EventBus.on('LevelUp', checkAll);

  return { checkAll, isUnlocked, getUnlocked: () => [...unlockedItems] };
})();
