// habitTracker.js
LawAIApp.HabitTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('habit_history', {});
  },
  _save(store) { LawAIApp.StorageEngine.set('habit_history', store); },

  record(type) {
    const today = new Date().toDateString();
    const store = this._getStore();
    if (!store[today]) {
      store[today] = { lessonsCompleted:0, reviewsDone:0, quizzesTaken:0, practicesDone:0, reflectionsDone:0 };
    }
    if (type === 'lesson') store[today].lessonsCompleted += 1;
    else if (type === 'review') store[today].reviewsDone += 1;
    else if (type === 'quiz') store[today].quizzesTaken += 1;
    else if (type === 'practice') store[today].practicesDone += 1;
    else if (type === 'reflection') store[today].reflectionsDone += 1;
    this._save(store);
    LawAIApp.EventBus.emit('HabitUpdated', { type, date: today });
  },

  getTodayHabits() {
    const today = new Date().toDateString();
    const store = this._getStore();
    return store[today] || { lessonsCompleted:0, reviewsDone:0, quizzesTaken:0, practicesDone:0, reflectionsDone:0 };
  },

  getWeekHistory() {
    const store = this._getStore();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toDateString();
      result.push({ date: d, ...(store[d] || { lessonsCompleted:0, reviewsDone:0, quizzesTaken:0, practicesDone:0, reflectionsDone:0 }) });
    }
    return result;
  }
};
