// memoryDashboard.js
LawAIApp.MemoryDashboard = {
  render() {
    const health = LawAIApp.MemoryScheduler.calculateMemoryHealth();
    const retention = LawAIApp.MemoryAnalytics.getRetentionRate();
    const todayList = LawAIApp.MemoryScheduler.getTodayReviewList();
    const atRisk = LawAIApp.MemoryScheduler.getAtRiskTopics();
    const upcoming = LawAIApp.MemoryScheduler.getUpcomingReviews(7);
    const trend = LawAIApp.MemoryAnalytics.getMemoryTrend();
    const reviewCompletion = LawAIApp.MemoryAnalytics.getReviewCompletionRate();

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="...">← Back</button>
        <h2>🧠 Adaptive Memory</h2>

        <!-- Memory Health -->
        <div class="widget-grid">
          <div class="widget-card"><h3>❤️ Health</h3><p style="font-size:1.5rem;">${health}%</p></div>
          <div class="widget-card"><h3>📈 Retention</h3><p style="font-size:1.5rem;">${retention}%</p></div>
          <div class="widget-card"><h3>✅ Completion</h3><p style="font-size:1.5rem;">${reviewCompletion}%</p></div>
          <div class="widget-card"><h3>📊 Trend</h3><p style="font-size:1.5rem;">${trend.trend === 'up' ? '⬆️ Up' : '⬇️ Down'}</p></div>
        </div>

        <!-- Today's Reviews -->
        <div class="section-card">
          <h3>📅 Today's Reviews (${todayList.length})</h3>
          ${todayList.length === 0 ? '<p style="color:var(--text-secondary);">No reviews scheduled today.</p>' : 
            todayList.map(id => {
              const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(id.split('-')[1]));
              return `<div class="lesson-item" style="justify-content:space-between; cursor:pointer;" onclick="LawAIApp.Router.navigate('lesson-detail', { lessonId: '${id}' })">
                <span>${lesson ? lesson.title : id}</span>
                <button class="quick-btn" onclick="event.stopPropagation(); LawAIApp.MemoryReview.performReview('${id}'); LawAIApp.MemoryDashboard.render();">Review</button>
              </div>`;
            }).join('')
          }
        </div>

        <!-- At Risk Topics -->
        ${atRisk.length > 0 ? `
          <div class="section-card">
            <h3>⚠️ At Risk (Strength < 40)</h3>
            ${atRisk.map(r => {
              const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(r.lessonId.split('-')[1]));
              return `<div class="lesson-item">${lesson ? lesson.title : r.lessonId} (${r.strength}%)</div>`;
            }).join('')}
          </div>
        ` : ''}

        <!-- Upcoming Reviews -->
        ${upcoming.length > 0 ? `
          <div class="section-card">
            <h3>🗓️ Upcoming</h3>
            ${upcoming.slice(0, 5).map(u => {
              const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(u.lessonId.split('-')[1]));
              return `<div class="lesson-item">${lesson ? lesson.title : u.lessonId} – ${new Date(u.date).toLocaleDateString()}</div>`;
            }).join('')}
          </div>
        ` : ''}

        <!-- AI Mentor Tip -->
        <div class="section-card">
          <h3>🤖 AI Mentor</h3>
          <p>${health > 80 ? 'Your memory is strong! Keep consistent.' : 'Focus on the at-risk topics to improve retention.'}</p>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
