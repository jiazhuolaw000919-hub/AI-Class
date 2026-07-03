// mentorBrain.js
LawAIApp.MentorBrain = (function() {
  // 监听事件，自动更新档案和发送消息
  LawAIApp.EventBus.on('LessonCompleted', () => {
    LawAIApp.MentorProfile.updateFromSignals();
  });
  LawAIApp.EventBus.on('PracticeCompleted', () => {
    LawAIApp.MentorProfile.updateFromSignals();
  });
  LawAIApp.EventBus.on('ProjectFinished', () => {
    LawAIApp.MentorProfile.updateFromSignals();
    const msg = LawAIApp.MentorMessages.generateOnProjectComplete();
    if (msg) LawAIApp.StorageEngine.set('mentor_message', msg);
  });
  LawAIApp.EventBus.on('LevelUp', (data) => {
    const msg = LawAIApp.MentorMessages.generateOnLevelUp(data.newLevel);
    if (msg) LawAIApp.StorageEngine.set('mentor_message', msg);
  });
  LawAIApp.EventBus.on('StreakMilestone', (data) => {
    const msg = LawAIApp.MentorMessages.generateOnStreak(data.streak);
    if (msg) LawAIApp.StorageEngine.set('mentor_message', msg);
  });
  // 定期检查记忆健康
  setInterval(() => {
    const health = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    if (health < 60) {
      LawAIApp.StorageEngine.set('mentor_message', LawAIApp.MentorMessages.generateOnMemoryDrop());
    }
  }, 3600000);

  function renderDashboard() {
    const profile = LawAIApp.MentorProfile.get();
    const plan = LawAIApp.MentorPlanner.getDailyPlan();
    const recs = LawAIApp.MentorRecommendations.generate();
    const message = LawAIApp.StorageEngine.get('mentor_message', '');

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>🤖 AI Mentor Brain</h2>
        ${message ? `<div class="dashboard-card" style="background:rgba(139,92,246,0.15);"><p>💬 ${message}</p></div>` : ''}
        <div class="widget-grid">
          <div class="widget-card"><h3>🧠 Style</h3><p>${profile.learningStyle}</p></div>
          <div class="widget-card"><h3>⚡ Momentum</h3><p>${profile.learningMomentum}/100</p></div>
          <div class="widget-card"><h3>💪 Strengths</h3><p>${profile.strongSkills.length ? profile.strongSkills.join(', ') : 'Discovering...'}</p></div>
          <div class="widget-card"><h3>🎯 Gaps</h3><p>${profile.knowledgeGaps.length ? profile.knowledgeGaps.join(', ') : 'None detected'}</p></div>
        </div>
        <div class="section-card">
          <h3>🗓️ Today's Plan</h3>
          <p><strong>Focus:</strong> ${plan.todayFocus}</p>
          <p>⏱️ ${plan.estimatedMinutes} min</p>
          <p>${plan.encouragement}</p>
        </div>
        <div class="section-card">
          <h3>💡 Recommendations</h3>
          ${recs.map(r => `<p>[${r.priority}] ${r.message}</p>`).join('')}
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }

  return { renderDashboard, getProfile: () => LawAIApp.MentorProfile.get(), getPlan: () => LawAIApp.MentorPlanner.getDailyPlan() };
})();
