// dailyBriefingCard.js
LawAIApp.DailyBriefingCard = {
  render() {
    const focus = LawAIApp.DailyFocusEngine.getTodayFocus();
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const health = LawAIApp.IntelligenceHealth.calculate();
    const memory = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.calculateMemoryHealth() : 100;

    return `
      <div class="dashboard-card" style="cursor:pointer;" onclick="LawAIApp.DailyBriefing.showFullExperience()">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <h3>☀️ Daily Briefing</h3>
          <span style="font-size:0.8rem; color:var(--primary);">Reopen</span>
        </div>
        <div style="display:flex; gap:1rem; margin:0.8rem 0;">
          <div style="text-align:center;"><div style="width:40px; height:40px; border-radius:50%; background:conic-gradient(var(--primary) ${health}%, transparent 0); display:flex; align-items:center; justify-content:center;"><span style="font-size:0.7rem;">${health}%</span></div><small>Health</small></div>
          <div style="text-align:center;"><div style="width:40px; height:40px; border-radius:50%; background:conic-gradient(#8b5cf6 ${memory}%, transparent 0); display:flex; align-items:center; justify-content:center;"><span style="font-size:0.7rem;">${memory}%</span></div><small>Memory</small></div>
          <div style="text-align:center;"><span style="font-size:1.2rem;">🔥</span><br><small>${streak} days</small></div>
        </div>
        <p><strong>${focus.title}</strong> <span style="color:var(--text-secondary);">⏱️ ${focus.estimatedMinutes} min</span></p>
      </div>
    `;
  }
};
