// academyAIView.js
LawAIApp.AcademyAIView = {
  render() {
    const academy = LawAIApp.AcademyAIData.academy;
    const progress = LawAIApp.ProgressEngine.getProgress();
    const xp = LawAIApp.XPEngine.getCurrentXP();
    const level = LawAIApp.LevelEngine.calculateLevel().level;
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const completed = progress.completedLessons.length;
    const total = progress.totalLessons;
    const percent = progress.completionPercent.toFixed(1);
    const reviewCount = LawAIApp.ReviewQueue.getTodayReviews().length;

    const html = `
      <div class="academy-page">
        <!-- Back button -->
        <button class="back-btn" onclick="LawAIApp.Router.navigate('academy')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Academies
        </button>

        <!-- Academy Header -->
        <div class="continue-card" style="background: linear-gradient(135deg, ${academy.themeColor}, #6366f1);">
          <div style="font-size:2.5rem;">${academy.icon}</div>
          <h2>${academy.name}</h2>
          <p>${academy.description}</p>
          <div style="display:flex; gap:1rem; margin-top:0.5rem; font-size:0.85rem;">
            <span>⏱️ ${academy.estimatedHours} hours</span>
            <span>📊 ${academy.difficulty}</span>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="widget-grid" style="margin:1rem 0;">
          <div class="widget-card"><h3>📚 Progress</h3><p>${completed}/${total} lessons (${percent}%)</p></div>
          <div class="widget-card"><h3>⭐ XP</h3><p>${xp} XP · Level ${level}</p></div>
          <div class="widget-card"><h3>🔥 Streak</h3><p>${streak} days</p></div>
          <div class="widget-card"><h3>🔁 Review</h3><p>${reviewCount} items due</p></div>
        </div>

        <!-- Sidebar Navigation (simulated) -->
        <div class="quick-access" style="justify-content:center; flex-wrap:wrap;">
          <button class="quick-btn" onclick="LawAIApp.CourseAIFundamentals.open()">📖 Courses</button>
          <button class="quick-btn" onclick="alert('Coming soon')">🧠 Second Brain</button>
          <button class="quick-btn" onclick="alert('Coming soon')">📅 Timeline</button>
          <button class="quick-btn" onclick="alert('Coming soon')">📊 Statistics</button>
          <button class="quick-btn" onclick="alert('Coming soon')">🏆 Achievements</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('learning-hub')">📚 Learning Hub</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('knowledge-capture')">📓 My Notes</button>
          <button class="quick-btn" onclick="alert('Coming soon')">⚙️ Settings</button>
        </div>

        <!-- Empty state if no progress -->
        ${completed === 0 ? `
          <div class="empty-state" style="margin-top:2rem;">
            <div style="font-size:3rem;">👋</div>
            <h3>Welcome to ${academy.name}!</h3>
            <p>Start your first lesson and begin your AI journey.</p>
          </div>
        ` : ''}
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
