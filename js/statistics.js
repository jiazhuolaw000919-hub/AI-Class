// statistics.js
LawAIApp.Statistics = {
  getStats() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const level = LawAIApp.LevelEngine.calculateLevel();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completed = progress.completedLessons;

    // 总学习时间估算（每课按 8 分钟估算）
    const totalMinutes = completed.length * 8;
    const hours = (totalMinutes / 60).toFixed(1);

    // 学过的类别
    const categories = new Set();
    completed.forEach(id => {
      const l = allLessons.find(ls => ls.lessonId === id);
      if (l) categories.add(l.category);
    });

    return {
      totalLessons: 365,
      completed: completed.length,
      completionPercent: progress.completionPercent.toFixed(1),
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      level: level.level,
      xp: progress.xp,
      hoursLearned: hours,
      categoriesLearned: [...categories]
    };
  },

  renderHTML() {
    const s = this.getStats();
    return `
      <div class="section-card">
        <h3>📊 Learning Stats</h3>
        <p>📚 Lessons: ${s.completed} / ${s.totalLessons} (${s.completionPercent}%)</p>
        <p>🔥 Streak: ${s.currentStreak} days (Best: ${s.longestStreak})</p>
        <p>⭐ Level ${s.level} · ${s.xp} XP</p>
        <p>⏱️ Time learned: ~${s.hoursLearned} hours</p>
        <p>🏷️ Categories: ${s.categoriesLearned.join(', ') || 'None yet'}</p>
      </div>
    `;
  }
};
