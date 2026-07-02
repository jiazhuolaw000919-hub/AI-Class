// identityEngine.js
LawAIApp.IdentityEngine = (function() {
  const defaultProfile = {
    displayName: 'Law',
    title: 'New Explorer',
    knowledgeRank: 1,
    knowledgeScore: 0,
    consistencyScore: 0,
    learningStyle: 'balanced',
    favoriteAcademy: 'academy_ai'
  };

  let profile = LawAIApp.StorageEngine.get('identity_profile', defaultProfile);

  function save() {
    LawAIApp.StorageEngine.set('identity_profile', profile);
  }

  // 更新属性
  function update(key, value) {
    profile[key] = value;
    save();
    LawAIApp.EventBus.emit('IdentityUpdated', { key, value });
  }

  function getProfile() {
    return { ...profile };
  }

  // 监听事件自动更新知识分数、一致性等
  LawAIApp.EventBus.on('LessonCompleted', () => {
    profile.knowledgeScore += 10;
    profile.consistencyScore = LawAIApp.StreakEngine.getStreakData().currentStreak;
    save();
  });
  LawAIApp.EventBus.on('LevelUp', (data) => {
    profile.knowledgeRank = data.newLevel;
    save();
  });

  return { getProfile, update };
})();
