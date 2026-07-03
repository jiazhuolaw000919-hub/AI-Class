// dailyPromptExperience.js
LawAIApp.DailyPromptExperience = {
  render(onClose) {
    const greeting = LawAIApp.DailyGreeting.get();
    const quote = LawAIApp.DailyQuoteEngine.getTodayQuote();
    const focus = LawAIApp.DailyFocusEngine.getTodayFocus();
    const health = LawAIApp.IntelligenceHealth.calculate();
    const memoryHealth = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.calculateMemoryHealth() : 100;
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const longestStreak = LawAIApp.StreakEngine.getStreakData().longestStreak;
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();
    const progress = LawAIApp.ProgressEngine.getProgress();
    const nextAchievement = LawAIApp.AchievementEngine ? LawAIApp.AchievementEngine.getNextAchievement ? LawAIApp.AchievementEngine.getNextAchievement() : null : null;
    const mentorInsight = LawAIApp.IntelligenceRecommendations ? LawAIApp.IntelligenceRecommendations.generate()[0] : null;

    const html = `
      <div id="daily-prompt-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(20px); z-index:10000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.5s ease;">
        <div style="background:var(--card); border-radius:28px; max-width:420px; width:90%; max-height:90vh; overflow-y:auto; padding:2rem 1.5rem; box-shadow:0 20px 40px rgba(0,0,0,0.5); position:relative;">
          <button id="close-daily-prompt" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:var(--text-secondary); font-size:1.5rem; cursor:pointer;">✕</button>
          <div style="text-align:center;">
            <div style="font-size:1.8rem; font-weight:bold; margin-bottom:0.5rem; animation:slideUp 0.6s ease;">${greeting}</div>
            <p style="color:var(--text-secondary); font-style:italic; animation:slideUp 0.8s ease;">"${quote}"</p>
          </div>

          <div style="display:flex; justify-content:space-around; margin:1.5rem 0; animation:slideUp 1s ease;">
            <div style="text-align:center;">
              <svg width="70" height="70"><circle cx="35" cy="35" r="30" fill="none" stroke="var(--card)" stroke-width="6"/><circle id="health-ring" cx="35" cy="35" r="30" fill="none" stroke="var(--primary)" stroke-width="6" stroke-dasharray="188.5" stroke-dashoffset="188.5" transform="rotate(-90 35 35)"/><text x="35" y="40" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="bold" id="health-text">0%</text></svg>
              <p style="font-size:0.8rem;">Health</p>
            </div>
            <div style="text-align:center;">
              <svg width="70" height="70"><circle cx="35" cy="35" r="30" fill="none" stroke="var(--card)" stroke-width="6"/><circle id="memory-ring" cx="35" cy="35" r="30" fill="none" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="188.5" stroke-dashoffset="188.5" transform="rotate(-90 35 35)"/><text x="35" y="40" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="bold" id="memory-text">0%</text></svg>
              <p style="font-size:0.8rem;">Memory</p>
            </div>
            <div style="text-align:center;">
              <div style="font-size:2rem;" id="streak-count">0</div>
              <p style="font-size:0.8rem;">🔥 Streak</p>
              <small>Best: ${longestStreak}</small>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:1rem; margin:1rem 0; animation:slideUp 1.2s ease;">
            <p style="color:var(--primary); font-weight:bold;">⭐ Today's Focus</p>
            <h3>${focus.title}</h3>
            <p style="color:var(--text-secondary);">${focus.description}</p>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <span class="badge">⏱️ ${focus.estimatedMinutes} min</span>
              <span class="badge">Impact: ${focus.impact}</span>
            </div>
          </div>

          ${nextAchievement ? `<div style="animation:slideUp 1.4s ease;"><p>🏆 Next Achievement: ${nextAchievement.name}</p></div>` : ''}
          ${mentorInsight ? `<div style="background:rgba(139,92,246,0.15); border-radius:12px; padding:0.8rem; margin:0.5rem 0; animation:slideUp 1.6s ease;"><p style="font-size:0.9rem;">🤖 ${mentorInsight.title}: ${mentorInsight.description}</p></div>` : ''}

          <div style="display:flex; gap:0.5rem; margin-top:1.5rem; animation:slideUp 1.8s ease;">
            <button id="start-learning-btn" class="complete-btn" style="flex:1;">Start Learning</button>
            <button id="view-dashboard-btn" class="quick-btn" style="flex:1;">Dashboard</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // 动画
    setTimeout(() => {
      LawAIApp.DailyAnimation.animateRing(document.getElementById('health-ring'), health);
      LawAIApp.DailyAnimation.animateValue(document.getElementById('health-text'), 0, health, 1500);
      LawAIApp.DailyAnimation.animateRing(document.getElementById('memory-ring'), memoryHealth);
      LawAIApp.DailyAnimation.animateValue(document.getElementById('memory-text'), 0, memoryHealth, 1500);
      LawAIApp.DailyAnimation.animateValue(document.getElementById('streak-count'), 0, streak, 1000);
    }, 300);

    const close = () => {
      const overlay = document.getElementById('daily-prompt-overlay');
      if (overlay) overlay.remove();
      if (onClose) onClose();
    };

    document.getElementById('close-daily-prompt').addEventListener('click', close);
    document.getElementById('start-learning-btn').addEventListener('click', () => {
      close();
      LawAIApp.Router.navigate('learning');
    });
    document.getElementById('view-dashboard-btn').addEventListener('click', () => {
      close();
      LawAIApp.Router.navigate('dashboard');
    });
  }
};
