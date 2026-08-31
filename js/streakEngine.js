// streakEngine.js
LawAIApp.StreakEngine = {
  getStreakData() {
    const data = LawAIApp.StorageEngine.get('streakData') || {
      currentStreak: 0,
      longestStreak: 0,
      lastLearningDate: null
    };
    return data;
  },

  // 每天首次完成一节课时调用
  updateStreak() {
    const data = this.getStreakData();
    const today = new Date().toDateString(); // 日期字符串，无时间
    const last = data.lastLearningDate ? new Date(data.lastLearningDate).toDateString() : null;

    if (last === today) return data; // 今天已记录过

    if (last) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === yesterday) {
        data.currentStreak += 1;
      } else {
        data.currentStreak = 1; // 中断
      }
    } else {
      data.currentStreak = 1;
    }

    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    data.lastLearningDate = new Date().toISOString();
    LawAIApp.StorageEngine.set('streakData', data);
    return data;
  }
};
