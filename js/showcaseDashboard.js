// showcaseDashboard.js
LawAIApp.ShowcaseDashboard = {
  render() {
    const showcase = LawAIApp.PortfolioShowcase.getShowcase();
    const summary = LawAIApp.CareerStory.generateSummary();
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();

    const html = `
      <div class="page" style="animation: fadeIn 0.8s ease;">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>🚀 Career Showcase</h2>

        <!-- Summary -->
        <div class="dashboard-card" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white;">
          <h3>About Me</h3>
          <p>${summary}</p>
        </div>

        <!-- Stats -->
        <div class="widget-grid">
          <div class="widget-card"><h3>⭐ XP</h3><p>${showcase.stats.xp} XP</p></div>
          <div class="widget-card"><h3>📈 Level</h3><p>Level ${showcase.stats.level}</p></div>
          <div class="widget-card"><h3>📚 Completed</h3><p>${showcase.stats.lessonsCompleted} lessons</p></div>
          <div class="widget-card"><h3>🏗️ Projects</h3><p>${showcase.stats.totalProjects} completed</p></div>
        </div>

        <!-- Projects -->
        <div class="section-card">
          <h3>🛠️ Projects</h3>
          ${showcase.projects.length === 0 ? '<p style="color:var(--text-secondary);">No projects yet. Complete a project to showcase it here.</p>' :
            showcase.projects.map(p => `
              <div class="note-card">
                <strong>${p.title}</strong>
                <p>${p.description}</p>
                <small>Completed: ${p.completedDate ? new Date(p.completedDate).toLocaleDateString() : 'N/A'}</small>
                ${p.reflection ? `<p style="font-style:italic; color:var(--text-secondary);">"${p.reflection}"</p>` : ''}
              </div>
            `).join('')
          }
        </div>

        <!-- Skills -->
        <div class="section-card">
          <h3>⚡ Skills</h3>
          <div class="quick-access">
            ${showcase.skills.map(s => `
              <div class="widget-card" style="text-align:center;">
                <strong>${s.name}</strong>
                <div class="progress-bar" style="margin:0.3rem 0;">
                  <div class="progress-fill" style="width:${s.mastery}%"></div>
                </div>
                <small>${s.level}</small>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Achievements -->
        <div class="section-card">
          <h3>🏆 Achievements</h3>
          ${showcase.achievements.length === 0 ? '<p style="color:var(--text-secondary);">Unlock achievements by learning.</p>' :
            showcase.achievements.map(a => `<div class="lesson-item">🏅 ${a.name} – ${a.description}</div>`).join('')
          }
        </div>

        <!-- Share / Export -->
        <div style="text-align:center; margin-top:1rem;">
          <button class="quick-btn" onclick="alert('PDF export coming soon')">📤 Export as PDF</button>
          <button class="quick-btn" onclick="alert('Link copied (simulated)')">🔗 Share Link</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
