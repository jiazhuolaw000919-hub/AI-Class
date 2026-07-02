// difficultyManager.js
LawAIApp.DifficultyManager = {
  // 根据最近5次实践的正确率调整难度
  adjustDifficulty(currentDifficulty, lessonId) {
    const recent = LawAIApp.PracticeHistory.getRecent(5);
    if (recent.length < 3) return currentDifficulty || 'normal';

    const accuracy = recent.filter(p => p.correct).length / recent.length;
    if (accuracy >= 0.8) return 'hard';
    if (accuracy <= 0.4) return 'easy';
    return 'normal';
  },

  // 获取当前用户适合的难度级别
  getCurrentLevel() {
    return LawAIApp.StorageEngine.get('practice_difficulty', 'normal');
  },

  setCurrentLevel(level) {
    LawAIApp.StorageEngine.set('practice_difficulty', level);
    LawAIApp.EventBus.emit('DifficultyAdjusted', { newLevel: level });
  }
};
