// calendar.js — Smart Calendar + Timeline + Stats + Second Brain
LawAIApp.Calendar = {
  currentTab: 'calendar',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  render() {
    const tabs = ['calendar', 'timeline', 'stats', 'secondbrain'];
    const html = `
      <div class="page">
        <h2>📅 Learning Memory</h2>
        <div class="tab-bar" style="display:flex; gap:0.5rem; margin:1rem 0; flex-wrap:wrap;">
          <button class="quick-btn tab-btn ${this.currentTab==='calendar'?'active':''}" data-tab="calendar">Calendar</button>
          <button class="quick-btn tab-btn ${this.currentTab==='timeline'?'active':''}" data-tab="timeline">Timeline</button>
          <button class="quick-btn tab-btn ${this.currentTab==='stats'?'active':''}" data-tab="stats">Stats</button>
          <button class="quick-btn tab-btn ${this.currentTab==='secondbrain'?'active':''}" data-tab="secondbrain">Second Brain</button>
        </div>
        <div id="calendar-tab-content"></div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    this.attachTabEvents();
    this.renderCurrentTab();
  },

  attachTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTab = e.currentTarget.dataset.tab;
        this.renderCurrentTab();
        // 高亮当前标签
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  },

  renderCurrentTab() {
    const container = document.getElementById('calendar-tab-content');
    if (!container) return;
    switch (this.currentTab) {
      case 'calendar': this.renderCalendarView(container); break;
      case 'timeline': this.renderTimelineView(container); break;
      case 'stats': this.renderStatsView(container); break;
      case 'secondbrain': this.renderSecondBrainView(container); break;
    }
  },

  // ========== 日历视图 ==========
  renderCalendarView(container) {
    const { daysInMonth, firstDay } = LawAIApp.CalendarEngine.getMonthData(this.currentYear, this.currentMonth);
    const progress = LawAIApp.ProgressEngine.getProgress();
    const monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });

    let gridHTML = '';
    for (let i = 0; i < firstDay; i++) gridHTML += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const status = LawAIApp.CalendarEngine.getDayStatus(d, this.currentMonth, this.currentYear, progress);
      let bg = '';
      switch (status) {
        case 'completed': bg = 'var(--success)'; break;
        case 'current': bg = 'var(--primary)'; break;
        case 'locked': bg = '#334155'; break;
        default: bg = 'var(--card)';
      }
      const reviewToday = LawAIApp.ReviewQueue.getTodayReviews().includes(`day-${d}`) ? '🔁' : '';
      gridHTML += `<div class="day-cell" style="background:${bg};" data-day="${d}">${d}${reviewToday}</div>`;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <button class="quick-btn" id="prev-month">←</button>
        <strong>${monthName} ${this.currentYear}</strong>
        <button class="quick-btn" id="next-month">→</button>
      </div>
      <div class="month-grid">${gridHTML}</div>
      <button id="today-btn" class="quick-btn" style="margin-top:0.5rem;">Today</button>
      <div id="calendar-modal" class="modal" style="display:none">
        <div class="modal-content" id="modal-content"></div>
      </div>
    `;

    // 绑定月份切换
    document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
    document.getElementById('today-btn').addEventListener('click', () => {
      const today = new Date();
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth();
      this.renderCalendarView(container);
    });

    // 日期点击弹出
    document.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const day = parseInt(e.currentTarget.dataset.day);
        const summary = LawAIApp.CalendarEngine.getDaySummary(day);
        const modal = document.getElementById('calendar-modal');
        const modalContent = document.getElementById('modal-content');
        if (summary) {
          modalContent.innerHTML = `
            <h3>Day ${summary.day}: ${summary.title}</h3>
            <p><strong>Status:</strong> ${summary.completed ? '✅ Completed' : '❌ Not completed'}</p>
            ${summary.completedDate ? `<p>Completed: ${new Date(summary.completedDate).toLocaleDateString()}</p>` : ''}
            <p>Category: ${summary.category} · Difficulty: ${summary.difficulty}</p>
            <p>XP: ${summary.xp} · Time: ${summary.timeSpent}</p>
            <p>Review: ${summary.reviewStatus}</p>
            <p><em>Future AI Comment: ${summary.futureAIComment}</em></p>
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson', {day:${summary.day}})">Open Lesson</button>
            <button class="quick-btn" onclick="document.getElementById('calendar-modal').style.display='none'">Close</button>
          `;
        } else {
          modalContent.innerHTML = `<p>No lesson data.</p><button class="quick-btn" onclick="document.getElementById('calendar-modal').style.display='none'">Close</button>`;
        }
        modal.style.display = 'flex';
      });
    });

    // 点击模态背景关闭
    document.getElementById('calendar-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
    });
  },

  changeMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.renderCalendarView(document.getElementById('calendar-tab-content'));
  },

  // ========== 时间线视图 ==========
  renderTimelineView(container) {
    container.innerHTML = `
      <h3>📜 Learning Timeline</h3>
      <div class="search-box-container" style="margin:0.5rem 0;">
        <input class="search-box" id="timeline-search" placeholder="Search timeline...">
      </div>
      <div id="timeline-list">${LawAIApp.Timeline.renderHTML()}</div>
    `;
    document.getElementById('timeline-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const all = LawAIApp.History.getHistory(100);
      const filtered = all.filter(l => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));
      document.getElementById('timeline-list').innerHTML = filtered.map(l => `
        <div class="note-card" style="margin:0.5rem 0;">
          <strong>${l.title}</strong> <span style="color:var(--text-secondary)">· ${l.duration}</span><br>
          <small>${new Date(l.completedDate).toLocaleDateString()} · XP ${l.xpReward}</small>
        </div>
      `).join('') || '<p>No results.</p>';
    });
  },

  // ========== 统计视图 ==========
  renderStatsView(container) {
    container.innerHTML = `
      ${LawAIApp.Statistics.renderHTML()}
      <div class="section-card">
        <h3>🔥 Activity Heatmap</h3>
        <div id="heatmap-container"></div>
      </div>
    `;
    LawAIApp.Heatmap.renderHeatmap('heatmap-container');
  },

  // ========== Second Brain 视图 ==========
  renderSecondBrainView(container) {
    const entries = LawAIApp.SecondBrain.getAllEntries();
    container.innerHTML = `
      <h3>🧠 Second Brain</h3>
      <input class="search-box" id="brain-search" placeholder="Search your knowledge base...">
      <div id="brain-results" style="margin-top:1rem;">
        ${entries.length === 0 ? '<p>No entries yet. Complete lessons to build your Second Brain.</p>' : ''}
        ${entries.slice(0,20).map(e => `
          <div class="note-card">
            <strong>${e.title}</strong>
            <p>${e.summary}</p>
            <small>Keywords: ${e.keywords.join(', ')}</small><br>
            <small>Completed: ${e.completedDate ? new Date(e.completedDate).toLocaleDateString() : 'N/A'}</small>
            <div class="quick-access" style="margin-top:0.3rem;">
              <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson', {day:${parseInt(e.lessonId.split('-')[1])}})">Open Lesson</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('brain-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = LawAIApp.SecondBrain.search(q);
      document.getElementById('brain-results').innerHTML = filtered.map(e => `
        <div class="note-card">
          <strong>${e.title}</strong>
          <p>${e.summary}</p>
          <small>Keywords: ${e.keywords.join(', ')}</small>
          <div class="quick-access" style="margin-top:0.3rem;">
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson', {day:${parseInt(e.lessonId.split('-')[1])}})">Open Lesson</button>
          </div>
        </div>
      `).join('') || '<p>No results.</p>';
    });
  }
};
