// commandCenter.js
LawAIApp.CommandCenter = {
  render() {
    const predictions = LawAIApp.ForecastEngine.getAllPredictions();
    const progress = LawAIApp.ProgressEngine.getProgress();
    const health = LawAIApp.IntelligenceHealth ? LawAIApp.IntelligenceHealth.calculate() : 50;
    const memory = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.calculateMemoryHealth() : 100;
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const todayFocus = LawAIApp.DailyFocusEngine.getTodayFocus();
    const activityLog = LawAIApp.AnalyticsStorage.getEventLog().slice(-5).reverse();

    const radarSkills = [
      { name: 'Prompt Eng.', value: 70 },
      { name: 'Automation', value: 45 },
      { name: 'Critical Think.', value: 80 },
      { name: 'AI Workflow', value: 55 },
      { name: 'Projects', value: 60 },
      { name: 'Communication', value: 90 },
      { name: 'Problem Solving', value: 65 }
    ];

    const html = `
      <div class="page command-center" style="animation: fadeIn 0.8s ease;">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>🚀 Command Center</h2>

        <!-- Hero Section -->
        <div style="display:flex; justify-content:center; gap:2rem; margin:1.5rem 0; flex-wrap:wrap;">
          <div class="orb" style="position:relative; width:100px; height:100px; border-radius:50%; background:conic-gradient(var(--primary) ${health}%, transparent 0); display:flex; align-items:center; justify-content:center;">
            <span style="background:var(--bg); border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center; font-weight:bold;">❤️ ${health}%</span>
          </div>
          <div class="orb" style="position:relative; width:100px; height:100px; border-radius:50%; background:conic-gradient(#8b5cf6 ${memory}%, transparent 0); display:flex; align-items:center; justify-content:center;">
            <span style="background:var(--bg); border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center; font-weight:bold;">🧠 ${memory}%</span>
          </div>
        </div>

        <!-- Live Forecast -->
        <div class="section-card">
          <h3>📡 Live Forecast</h3>
          <div class="widget-grid">
            <div class="widget-card"><h4>🏁 Completion</h4><p>${predictions.completion.date} (${predictions.completion.daysNeeded}d)</p></div>
            <div class="widget-card"><h4>🧠 Memory (30d)</h4><p>${predictions.memory}%</p></div>
            <div class="widget-card"><h4>⭐ XP (30d)</h4><p>${predictions.xp.predicted} XP</p></div>
            <div class="widget-card"><h4>🎯 Goal Success</h4><p>${predictions.goalSuccess}%</p></div>
          </div>
        </div>

        <!-- Learning Radar -->
        <div class="section-card">
          <h3>📡 Learning Radar</h3>
          <div style="display:flex; justify-content:center;">
            ${LawAIApp.LearningRadar.render(radarSkills)}
          </div>
        </div>

        <!-- Momentum Timeline -->
        <div class="section-card">
          <h3>⏳ Momentum</h3>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <span class="badge">⭐ ${progress.xp} XP</span>
            <span class="badge">📚 ${progress.completedLessons.length} Lessons</span>
            <span class="badge">🔥 ${streak} Day Streak</span>
            <span class="badge">🏆 ${LawAIApp.AchievementEngine?.getUnlocked().length || 0} Achievements</span>
          </div>
        </div>

        <!-- Activity Stream -->
        <div class="section-card">
          <h3>📜 Recent Activity</h3>
          ${activityLog.map(e => `<div class="lesson-item"><small>${new Date(e.timestamp).toLocaleString()}</small> - ${e.eventType}</div>`).join('')}
        </div>

        <!-- Command Actions -->
        <div class="quick-access" style="margin-top:1rem;">
          <button class="quick-btn pulse-btn" onclick="LawAIApp.Router.navigate('learning')">▶️ Continue</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('adaptive-memory')">🧠 Review</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('planner')">📅 Planner</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('conversations')">💬 Ask AI</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
