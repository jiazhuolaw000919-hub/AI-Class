// goalDashboard.js
LawAIApp.GoalDashboard = {
  render() {
    const activeGoals = LawAIApp.GoalIntelligenceEngine.getActiveGoals();
    if (activeGoals.length === 0) {
      document.getElementById('app').innerHTML = `
        <div class="page">
          <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
          <h2>🎯 Goal Intelligence</h2>
          <p style="color:var(--text-secondary);">No active goals. Create one to see your personalized roadmap.</p>
          <button class="quick-btn" id="create-demo-goal">Create Demo Goal</button>
        </div>
      `;
      document.getElementById('create-demo-goal')?.addEventListener('click', () => {
        LawAIApp.GoalIntelligenceEngine.createGoal({
          title: 'Complete AI Foundation',
          description: 'Finish all lessons in the AI Foundation Academy',
          type: 'course',
          priority: 'high',
          deadline: new Date(Date.now() + 30 * 86400000).toISOString()
        });
        this.render();
      });
      return;
    }

    const goalData = LawAIApp.GoalIntelligenceEngine.getEnhancedGoal(activeGoals[0].goalId);
    if (!goalData) return;

    const { goal, analytics, forecast, roadmap, actions, alerts } = goalData;
    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>🎯 ${goal.title}</h2>
        <p>${goal.description}</p>
        <div class="widget-grid">
          <div class="widget-card"><h3>⏳ Progress</h3><p style="font-size:1.5rem;">${analytics.progress.toFixed(1)}%</p></div>
          <div class="widget-card"><h3>📅 Deadline</h3><p>${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'None'}</p></div>
          <div class="widget-card"><h3>⚡ Risk</h3><p style="color:${analytics.risk === 'high' ? 'var(--danger)' : 'var(--success)'};">${analytics.risk.toUpperCase()}</p></div>
          <div class="widget-card"><h3>📈 Velocity</h3><p>${analytics.dailyVelocity.toFixed(1)} lessons/day</p></div>
        </div>

        ${alerts.length > 0 ? `<div class="section-card" style="background:rgba(239,68,68,0.1);">${alerts.map(a => `<p>⚠️ ${a.message}</p>`).join('')}</div>` : ''}

        <div class="section-card">
          <h3>🗺️ Roadmap</h3>
          <p><strong>Daily Target:</strong> ${roadmap.dailyLessons} lesson(s)</p>
          <p><strong>Estimated Completion:</strong> ${roadmap.estimatedCompletion}</p>
          <div class="milestone-list">
            ${roadmap.milestones.map(m => `<div class="lesson-item">${m.date}: reach ${m.targetLesson} lessons</div>`).join('')}
          </div>
        </div>

        <div class="section-card">
          <h3>🚀 Recommended Actions</h3>
          ${actions.map(a => `<div class="lesson-item" style="justify-content:space-between;"><span>${a.description}</span><span class="badge">${a.priority}</span></div>`).join('')}
        </div>

        <div class="section-card">
          <h3>🤖 Mentor Suggestion</h3>
          <p>${analytics.risk === 'high' ? 'Consider adjusting your deadline or increasing daily study time.' : 'Keep up the great work! You are on track.'}</p>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
