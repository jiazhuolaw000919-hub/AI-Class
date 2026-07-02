LawAIApp.Dashboard = {
  render() {
    const user = LawAIApp.Data.fakeUser();
    const challenge = LawAIApp.Data.weeklyChallenge();
    const notes = LawAIApp.Data.fakeNotes().slice(0,2);

    const html = `
      <div class="page">
        <h2 class="greeting">Good Morning Law 👋</h2>
        <div class="widget-grid">
          <div class="widget-card"><h3>🔥 Streak</h3><p>${user.streak} days</p><div class="streak-bar"><div class="xp-fill" style="width:70%"></div></div></div>
          <div class="widget-card"><h3>⭐ XP</h3><p>${user.xp} XP</p>${LawAIApp.Components.progressBar(user.xp, user.level*300).outerHTML}</div>
          <div class="widget-card"><h3>📊 Level</h3><p>Level ${user.level}</p><small>Next: ${user.level*300 - user.xp} XP</small></div>
        </div>
        <div class="lesson-card" onclick="LawAIApp.Router.navigate('learning')">
          <div><strong>Today's Lesson</strong><br><small>Day ${user.currentLesson} – ${LawAIApp.Data.generateLessons()[user.currentLesson-1]?.title}</small></div>
          <span style="font-size:1.5rem">▶️</span>
        </div>
        <h3 style="margin-top:1rem">📈 Weekly Challenge</h3>
        <div class="widget-card">${challenge.title}<br>${LawAIApp.Components.progressBar(challenge.progress, 100).outerHTML}</div>
        <h3 style="margin-top:1rem">📝 Recent Notes</h3>
        ${notes.map(n => `<div class="note-card"><strong>${n.title}</strong><p>${n.summary}</p><span class="tag">${n.tags[0]}</span></div>`).join('')}
        <h3 style="margin-top:1rem">Quick Access</h3>
        <div class="quick-access">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('tools')">🛠️ Tools</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('prompt')">📋 Prompts</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
