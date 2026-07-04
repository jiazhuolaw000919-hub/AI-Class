// plannerDashboard.js
LawAIApp.PlannerDashboard = {
  render() {
    const plan = LawAIApp.StorageEngine.get('dailyPlan', null);
    const health = LawAIApp.IntelligenceHealth ? LawAIApp.IntelligenceHealth.calculate() : 50;
    const memory = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.calculateMemoryHealth() : 100;

    // 如果还没生成计划，默认 30 分钟
    if (!plan) {
      LawAIApp.PlannerTimeline.generateTimeline(30);
      return this.render();
    }

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>📅 Smart Learning Planner</h2>

        <!-- 学习健康条 -->
        <div class="widget-grid">
          <div class="widget-card"><h3>❤️ Health</h3><p>${health}%</p></div>
          <div class="widget-card"><h3>🧠 Memory</h3><p>${memory}%</p></div>
        </div>

        <!-- 时间块选择器 -->
        <div style="margin:1rem 0;">
          <label>Time Block: </label>
          <select id="time-block-select" class="quick-btn">
            <option value="5" ${plan.timeBlock === 5 ? 'selected' : ''}>5 min</option>
            <option value="10" ${plan.timeBlock === 10 ? 'selected' : ''}>10 min</option>
            <option value="20" ${plan.timeBlock === 20 ? 'selected' : ''}>20 min</option>
            <option value="30" ${plan.timeBlock === 30 ? 'selected' : ''}>30 min</option>
            <option value="45" ${plan.timeBlock === 45 ? 'selected' : ''}>45 min</option>
            <option value="60" ${plan.timeBlock === 60 ? 'selected' : ''}>60 min</option>
          </select>
        </div>

        <!-- 计划时间线 -->
        <div class="section-card">
          <h3>⏳ Today's Plan (${plan.usedMinutes} / ${plan.timeBlock} min)</h3>
          ${plan.tasks.length === 0 ? '<p style="color:var(--text-secondary);">No tasks scheduled. Enjoy your free time!</p>' : 
            plan.tasks.map(task => `
              <div class="lesson-item" style="justify-content:space-between;">
                <div>
                  <strong>${task.title}</strong>
                  <small style="display:block; color:var(--text-secondary);">${task.description} · ${task.estimatedMinutes} min</small>
                </div>
                <button class="quick-btn" onclick="LawAIApp.PlannerEngine.completeTask('${task.id}')">✅</button>
              </div>
            `).join('')
          }
        </div>

        <!-- 未来日历概览 -->
        <div class="section-card">
          <h3>📆 Upcoming Week</h3>
          ${(() => {
            const summary = LawAIApp.PlannerCalendar.getUpcomingSummary(7);
            return summary.map(day => `<div class="lesson-item">${day.date}: 📖 ${day.newLessons} new, 🔁 ${day.reviews} reviews</div>`).join('');
          })()}
        </div>

        <!-- AI 导师建议 -->
        <div class="section-card">
          <h3>🤖 Mentor Suggestion</h3>
          <p>${memory < 70 ? 'Prioritize reviews to protect your memory.' : 'You can add a challenge to boost your skills.'}</p>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
    this.attachEvents();
  },

  attachEvents() {
    const select = document.getElementById('time-block-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const minutes = parseInt(e.target.value);
        LawAIApp.PlannerEngine.generatePlan(minutes);
        this.render();
      });
    }
  }
};
