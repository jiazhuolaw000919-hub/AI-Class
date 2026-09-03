// calendar.js — Smart Calendar + Timeline + Stats + Second Brain
LawAIApp.Calendar = {
  currentTab: 'calendar',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  render() {
    var coreResult = LawAIApp.LearningJourneyAdapter 
        ? LawAIApp.LearningJourneyAdapter.getJourneyContextSafe() 
        : null;
    
    var surfaceData = LawAIApp.CalendarSurfaceAdapter 
        ? LawAIApp.CalendarSurfaceAdapter.adapt(coreResult, this._getScheduleState())
        : null;
    
    var viewModel = LawAIApp.CalendarViewModel 
        ? LawAIApp.CalendarViewModel.toRenderModel(surfaceData)
        : null;
    
    // 如果 ViewModel 可用，用它，否则回退到原有逻辑
    if (viewModel) {
      this._renderWithViewModel(viewModel);
      return;
  }
    
    const tabs = ['calendar', 'timeline', 'stats', 'secondbrain', 'planner'];
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

  _renderWithViewModel: function(viewModel) {
    var container = document.getElementById('app');
    if (!container) return;
    
    // 如果有 CalendarRenderer，使用它
    if (LawAIApp.CalendarRenderer) {
        LawAIApp.CalendarRenderer.render(viewModel, container);
        return;
    }
    
    // Fallback: 显示空状态 + 日历网格
    var monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
    
    container.innerHTML = `
        <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;">
            <h2 style="margin:0 0 4px;">📅 Calendar</h2>
            <p style="color:#94a3b8;margin:0 0 16px;">${viewModel.isEmpty ? 'No scheduled events yet.' : 'Your learning schedule'}</p>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <button onclick="LawAIApp.Calendar.changeMonth(-1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;">←</button>
                <span style="font-weight:600;">${monthName} ${this.currentYear}</span>
                <button onclick="LawAIApp.Calendar.changeMonth(1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;">→</button>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;color:#64748b;margin-bottom:4px;">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
                ${this._generateCalendarGrid()}
            </div>
            
            ${viewModel.isEmpty ? `
                <div style="text-align:center;padding:30px 0;color:#94a3b8;">
                    <div style="font-size:32px;margin-bottom:8px;">📅</div>
                    <p>No events scheduled yet.</p>
                    <button onclick="window.location.href='/pages/academy.html'" style="
                        padding:6px 20px;
                        background:#4a9eff;
                        border:none;
                        border-radius:100px;
                        color:white;
                        font-size:13px;
                        cursor:pointer;
                        margin-top:8px;
                    ">Explore Academy</button>
                </div>
            ` : `
                <div style="margin-top:12px;padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
                    <div style="font-size:12px;color:#64748b;">📋 ${viewModel.events?.length || 0} events scheduled</div>
                </div>
            `}
        </div>
    `;
},

_generateCalendarGrid: function() {
    const { daysInMonth, firstDay } = LawAIApp.CalendarEngine.getMonthData(this.currentYear, this.currentMonth);
    let html = '';
    for (let i = 0; i < firstDay; i++) {
        html += '<div style="padding:8px 4px;border-radius:6px;"></div>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === new Date().getDate() && 
                        this.currentMonth === new Date().getMonth() && 
                        this.currentYear === new Date().getFullYear();
        html += `
            <div style="
                padding:8px 4px;
                text-align:center;
                border-radius:6px;
                background:${isToday ? 'rgba(74,158,255,0.12)' : 'transparent'};
                border:${isToday ? '1px solid rgba(74,158,255,0.2)' : 'none'};
                color:${isToday ? '#4a9eff' : '#e2e8f0'};
                font-size:14px;
                cursor:pointer;
            " onclick="LawAIApp.Calendar._onDayClick(${d})">
                ${d}
            </div>
        `;
    }
    return html;
},

_onDayClick: function(day) {
    if (window.LawAIApp?.Toast) {
        LawAIApp.Toast.info('Day ' + day + ' selected');
    }
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
    const progress = CalendarSurfaceAdapter.getProgress();
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
    // 🔥 重新调用 render，而不是直接渲染子视图
    this.render();
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
