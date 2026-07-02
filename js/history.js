// history.js
LawAIApp.History = {
  getHistory(limit = 20) {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completed = progress.completedLessons.map(id => {
      const lesson = allLessons.find(l => l.lessonId === id);
      return lesson ? { ...lesson, completedDate: lesson.completedDate } : null;
    }).filter(Boolean);

    // 按完成日期降序
    completed.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    return completed.slice(0, limit);
  },

  renderHTML() {
    const history = this.getHistory(30);
    if (history.length === 0) return '<p>No completed lessons yet.</p>';
    return history.map(l => `
      <div class="note-card" style="margin:0.5rem 0;">
        <strong>${l.title}</strong> <span style="color:var(--text-secondary)">· ${l.duration}</span><br>
        <small>${new Date(l.completedDate).toLocaleDateString()} · XP ${l.xpReward}</small>
      </div>
    `).join('');
  }
};
