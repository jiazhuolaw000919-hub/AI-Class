// companionEngine.js
LawAIApp.CompanionEngine = (function() {
  let companion = LawAIApp.StorageEngine.get('companion', {
    type: 'owl',
    name: 'Ollie',
    level: 1,
    mood: 'happy',
    unlocked: true
  });

  function save() {
    LawAIApp.StorageEngine.set('companion', companion);
  }

  function getCompanion() {
    return { ...companion };
  }

  // 根据用户等级进化伙伴
  LawAIApp.EventBus.on('LevelUp', (data) => {
    companion.level = Math.min(data.newLevel, 50);
    companion.mood = 'excited';
    save();
    LawAIApp.EventBus.emit('CompanionUpdated', companion);
  });

  LawAIApp.EventBus.on('LessonCompleted', () => {
    companion.mood = 'happy';
    save();
  });

  return { getCompanion };
})();
