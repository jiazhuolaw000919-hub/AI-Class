// heatmap.js
LawAIApp.Heatmap = {
  // 获取一年的每日学习数据（仅标记是否有学习活动）
  getYearActivity(year = new Date().getFullYear()) {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completedDates = {};
    progress.completedLessons.forEach(id => {
      const lesson = allLessons.find(l => l.lessonId === id);
      if (lesson && lesson.completedDate) {
        const dateStr = new Date(lesson.completedDate).toDateString();
        completedDates[dateStr] = (completedDates[dateStr] || 0) + 1;
      }
    });

    // 构造全年日期网格
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toDateString();
      dates.push({
        date: dateStr,
        count: completedDates[dateStr] || 0
      });
    }
    return dates;
  },

  // 生成简单的 HTML 热力图
  renderHeatmap(containerId, year = new Date().getFullYear()) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const data = this.getYearActivity(year);
    const max = Math.max(...data.map(d => d.count), 1);

    let html = '<div style="display:flex; flex-wrap:wrap; gap:3px;">';
    data.forEach(d => {
      const intensity = d.count / max;
      const color = intensity === 0 ? '#1e293b' : `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
      html += `<div title="${d.date}: ${d.count} lessons" style="width:12px; height:12px; border-radius:3px; background:${color};"></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  }
};
