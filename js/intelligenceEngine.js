// intelligenceEngine.js
LawAIApp.IntelligenceEngine = (function() {
  // 事件监听：协调各引擎
  LawAIApp.EventBus.on('LessonCompleted', () => {
    LawAIApp.IntelligenceProfile.refreshFromSignals();
    // 更新健康分数缓存
    LawAIApp.IntelligenceHealth.calculate();
    LawAIApp.EventBus.emit('LearningHealthUpdated', { health: LawAIApp.IntelligenceHealth.calculate() });
  });

  LawAIApp.EventBus.on('PracticeCompleted', () => {
    LawAIApp.IntelligenceProfile.refreshFromSignals();
  });

  LawAIApp.EventBus.on('ProjectFinished', () => {
    LawAIApp.IntelligenceProfile.refreshFromSignals();
  });

  LawAIApp.EventBus.on('QuizCompleted', () => {
    LawAIApp.IntelligenceProfile.refreshFromSignals();
  });

  // 初始刷新
  setTimeout(() => LawAIApp.IntelligenceProfile.refreshFromSignals(), 500);

  return {
    getProfile: () => LawAIApp.IntelligenceProfile.get(),
    getHealth: () => LawAIApp.IntelligenceHealth.calculate(),
    getRecommendations: () => LawAIApp.IntelligenceRecommendations.generate(),
    getSignals: () => LawAIApp.IntelligenceSignals.getSignals(),

    // 全局仪表盘视图
    renderDashboard() {
      const health = this.getHealth();
      const profile = this.getProfile();
      const signals = this.getSignals();
      const recommendations = this.getRecommendations();
      const progress = LawAIApp.ProgressEngine.getProgress();
      const levelInfo = LawAIApp.LevelEngine.calculateLevel();
      const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;

      const html = `
        <div class="page">
          <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
          <h2>🧠 Learning Intelligence</h2>

          <!-- Health Ring -->
          <div style="text-align:center; margin:1rem 0;">
            <div style="position:relative; display:inline-block;">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--card)" stroke-width="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" stroke-width="10"
                  stroke-dasharray="${2*Math.PI*50}" stroke-dashoffset="${2*Math.PI*50*(1-health/100)}"
                  transform="rotate(-90 60 60)" style="transition: 1s;"/>
                <text x="60" y="60" text-anchor="middle" dy="0.3em" fill="var(--text)" font-size="24" font-weight="bold">${health}%</text>
              </svg>
            </div>
            <p>Learning Health</p>
          </div>

          <!-- Key Metrics -->
          <div class="widget-grid">
            <div class="widget-card"><h3>📚 Knowledge</h3><p>${progress.completionPercent.toFixed(1)}%</p></div>
            <div class="widget-card"><h3>🔥 Streak</h3><p>${streak} days</p></div>
            <div class="widget-card"><h3>⭐ XP</h3><p>${progress.xp} XP</p></div>
            <div class="widget-card"><h3>📈 Level</h3><p>Level ${levelInfo.level}</p></div>
          </div>

          <!-- Momentum and Memory -->
          <div class="widget-grid">
            <div class="widget-card"><h3>🚀 Momentum</h3><p>${profile.learningMomentum}</p></div>
            <div class="widget-card"><h3>🧠 Memory</h3><p>${profile.memoryHealth}%</p></div>
          </div>

          <!-- Recommendations -->
          <div class="section-card">
            <h3>💡 Personalized Recommendations</h3>
            ${recommendations.map(r => `
              <div class="lesson-item" style="justify-content:space-between;">
                <span>${r.title} – ${r.description}</span>
                <span class="badge">${r.priority}</span>
              </div>
            `).join('')}
          </div>

          <!-- Goal and Project Summary -->
          <div class="section-card">
            <h3>🎯 Active Goals</h3>
            <p>${LawAIApp.GoalEngine?.getActiveGoals().length || 0} goal(s)</p>
          </div>
        </div>
      `;
      document.getElementById('app').innerHTML = html;
    }
  };
})();
