// ================================================================
// calendar.js — Unified Calendar Module
// 合并 calendar.js + calendarDashboard.js
// 功能：日历视图 + 智能学习规划器 + 时间线 + 统计 + Second Brain
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Calendar = {
  // ============================================================
  // 状态
  // ============================================================
  currentTab: 'calendar',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  _initialized: false,
  _root: null,

  // ============================================================
  // 安全存储辅助
  // ============================================================
  _safeGet: function(key, defaultValue) {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
        return LawAIApp.StorageEngine.get(key, defaultValue);
      }
      var val = localStorage.getItem('lawai_' + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  _safeSet: function(key, value) {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
        LawAIApp.StorageEngine.set(key, value);
        return true;
      }
      localStorage.setItem('lawai_' + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  // ============================================================
  // 初始化
  // ============================================================
  init: function() {
    if (this._initialized) return;
    this._initialized = true;
    console.log('[Calendar] ✅ Initialized');
  },

  // ============================================================
  // 获取容器（优先 academy-root）
  // ============================================================
  _getContainer: function() {
    if (this._root) {
      return this._root;
    }
    
    var academyRoot = document.getElementById('academy-root');
    if (academyRoot) {
      return academyRoot;
    }
    
    var app = document.getElementById('app');
    if (app) {
      return app;
    }
    
    return document.getElementById('law-runtime-root');
  },

  // ============================================================
  // 🔥 返回 Academy
  // ============================================================
  goToAcademy: function() {
    console.log('[Calendar] 📚 Back to Academy');
    window.location.href = '/pages/academy.html';
  },

  // ============================================================
  // 🔥 返回上一页
  // ============================================================
  goBack: function() {
    console.log('[Calendar] ⬅️ Go back');
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  },

  // ============================================================
  // 主渲染入口
  // ============================================================
  render: function() {
    var container = this._getContainer();
    if (!container) {
      console.warn('[Calendar] No container found');
      return;
    }

    console.log('[Calendar] 🔥 Rendering to:', container.id);

    var coreResult = null;
    try {
      coreResult = LawAIApp.LearningJourneyAdapter 
          ? LawAIApp.LearningJourneyAdapter.getJourneyContextSafe() 
          : null;
    } catch (e) {
      coreResult = null;
    }
    
    var surfaceData = null;
    try {
      surfaceData = LawAIApp.CalendarSurfaceAdapter 
          ? LawAIApp.CalendarSurfaceAdapter.adapt(coreResult, this._getScheduleState())
          : null;
    } catch (e) {
      surfaceData = null;
    }
    
    var viewModel = null;
    try {
      viewModel = LawAIApp.CalendarViewModel 
          ? LawAIApp.CalendarViewModel.toRenderModel(surfaceData)
          : null;
    } catch (e) {
      viewModel = null;
    }
    
    // 如果 ViewModel 可用，使用它
    if (viewModel && !viewModel.isEmpty && LawAIApp.CalendarRenderer) {
      LawAIApp.CalendarRenderer.render(viewModel, container);
      console.log('[Calendar] ✅ Rendered with ViewModel');
      return;
    }
    
    // Fallback: 使用原生日历视图（包含 tabs）
    this._renderTabsView(container);
  },

  _getScheduleState: function() {
    return {
      currentTab: this.currentTab,
      currentYear: this.currentYear,
      currentMonth: this.currentMonth,
      events: [],
      availableWindows: [],
      conflicts: [],
      lastUpdated: null
    };
  },

  // ============================================================
  // 渲染：ViewModel 版本（CalendarRenderer）
  // ============================================================
  _renderWithViewModel: function(viewModel) {
    var container = this._getContainer();
    if (!container) return;
    
    if (LawAIApp.CalendarRenderer) {
      LawAIApp.CalendarRenderer.render(viewModel, container);
      return;
    }
    
    this._renderSimpleCalendar(container);
  },

  // ============================================================
  // 渲染：Tabs 视图（原生）
  // ============================================================
  _renderTabsView: function(container) {
    if (!container) {
      container = this._getContainer();
    }
    if (!container) return;

    var html = `
      <div class="page" style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
        
        <!-- 🔥 导航按钮组：Back to Academy + 返回上一页 -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
          <button onclick="LawAIApp.Calendar.goToAcademy()" style="
            background:rgba(74,158,255,0.08);
            border:1px solid rgba(74,158,255,0.15);
            color:#4a9eff;
            padding:10px 16px;
            border-radius:10px;
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            font-size:14px;
            font-family:inherit;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
            ← Back to Academy
          </button>
          
          <button onclick="LawAIApp.Calendar.goBack()" style="
            background:rgba(255,255,255,0.04);
            border:1px solid rgba(255,255,255,0.06);
            color:#94a3b8;
            padding:10px 16px;
            border-radius:10px;
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            font-size:14px;
            font-family:inherit;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
            ⬅️ 返回上一页
          </button>
        </div>

        <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">📅 Learning Memory</h2>
        
        <div class="tab-bar" style="display:flex; gap:0.5rem; margin:1rem 0; flex-wrap:wrap;">
          <button class="quick-btn tab-btn ${this.currentTab==='calendar'?'active':''}" data-tab="calendar" style="padding:6px 16px;background:${this.currentTab==='calendar'?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${this.currentTab==='calendar'?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.06)'};border-radius:100px;color:${this.currentTab==='calendar'?'#4a9eff':'#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">📅 Calendar</button>
          <button class="quick-btn tab-btn ${this.currentTab==='timeline'?'active':''}" data-tab="timeline" style="padding:6px 16px;background:${this.currentTab==='timeline'?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${this.currentTab==='timeline'?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.06)'};border-radius:100px;color:${this.currentTab==='timeline'?'#4a9eff':'#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">📜 Timeline</button>
          <button class="quick-btn tab-btn ${this.currentTab==='stats'?'active':''}" data-tab="stats" style="padding:6px 16px;background:${this.currentTab==='stats'?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${this.currentTab==='stats'?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.06)'};border-radius:100px;color:${this.currentTab==='stats'?'#4a9eff':'#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">📊 Stats</button>
          <button class="quick-btn tab-btn ${this.currentTab==='secondbrain'?'active':''}" data-tab="secondbrain" style="padding:6px 16px;background:${this.currentTab==='secondbrain'?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${this.currentTab==='secondbrain'?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.06)'};border-radius:100px;color:${this.currentTab==='secondbrain'?'#4a9eff':'#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">🧠 Second Brain</button>
          <button class="quick-btn tab-btn ${this.currentTab==='planner'?'active':''}" data-tab="planner" style="padding:6px 16px;background:${this.currentTab==='planner'?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${this.currentTab==='planner'?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.06)'};border-radius:100px;color:${this.currentTab==='planner'?'#4a9eff':'#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">⏳ Planner</button>
        </div>
        
        <div id="calendar-tab-content"></div>
      </div>
    `;
    
    container.innerHTML = html;
    this.attachTabEvents();
    this.renderCurrentTab();
  },

  // ============================================================
  // 简单日历（Fallback）
  // ============================================================
  _renderSimpleCalendar: function(container) {
    if (!container) return;
    
    var monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
    
    container.innerHTML = `
      <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;">
        
        <!-- 🔥 导航按钮 -->
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:12px;">
          <button onclick="LawAIApp.Calendar.goToAcademy()" style="
            background:rgba(74,158,255,0.08);
            border:1px solid rgba(74,158,255,0.15);
            color:#4a9eff;
            padding:8px 16px;
            border-radius:100px;
            cursor:pointer;
            font-family:inherit;
            font-size:13px;
          ">← Back to Academy</button>
          <button onclick="LawAIApp.Calendar.goBack()" style="
            background:rgba(255,255,255,0.04);
            border:1px solid rgba(255,255,255,0.06);
            color:#94a3b8;
            padding:8px 16px;
            border-radius:100px;
            cursor:pointer;
            font-family:inherit;
            font-size:13px;
          ">⬅️ 返回上一页</button>
        </div>

        <h2 style="margin:0 0 4px;">📅 Calendar</h2>
        <p style="color:#94a3b8;margin:0 0 16px;">Your learning schedule</p>
        
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <button onclick="LawAIApp.Calendar.changeMonth(-1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;font-family:inherit;">←</button>
          <span style="font-weight:600;">${monthName} ${this.currentYear}</span>
          <button onclick="LawAIApp.Calendar.changeMonth(1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;font-family:inherit;">→</button>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;color:#64748b;margin-bottom:4px;">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
          ${this._generateCalendarGrid()}
        </div>
      </div>
    `;
  },

  _generateCalendarGrid: function() {
    var daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    var firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    var html = '';
    
    for (var i = 0; i < firstDay; i++) {
      html += '<div style="padding:8px 4px;border-radius:6px;"></div>';
    }
    
    for (var d = 1; d <= daysInMonth; d++) {
      var isToday = d === new Date().getDate() && 
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
    if (window.LawAIApp?.Toast?.info) {
      LawAIApp.Toast.info('📅 Day ' + day + ' selected');
    } else {
      alert('📅 Day ' + day + ' selected');
    }
  },

  changeMonth: function(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.render();
  },

  _goToday: function() {
    var today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.render();
  },

  // ============================================================
  // Tab 事件
  // ============================================================
  attachTabEvents: function() {
    var self = this;
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        self.currentTab = e.currentTarget.dataset.tab;
        self.renderCurrentTab();
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(function(b) {
          b.style.background = 'rgba(255,255,255,0.04)';
          b.style.color = '#94a3b8';
          b.style.border = '1px solid rgba(255,255,255,0.06)';
        });
        e.currentTarget.style.background = 'rgba(74,158,255,0.12)';
        e.currentTarget.style.color = '#4a9eff';
        e.currentTarget.style.border = '1px solid rgba(74,158,255,0.2)';
      });
    });
  },

  renderCurrentTab: function() {
    var container = document.getElementById('calendar-tab-content');
    if (!container) return;
    
    switch (this.currentTab) {
      case 'calendar': this.renderCalendarView(container); break;
      case 'timeline': this.renderTimelineView(container); break;
      case 'stats': this.renderStatsView(container); break;
      case 'secondbrain': this.renderSecondBrainView(container); break;
      case 'planner': this.renderPlannerView(container); break;
      default: this.renderCalendarView(container); break;
    }
  },

  // ============================================================
  // 日历视图
  // ============================================================
  renderCalendarView: function(container) {
    var monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
    
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <button class="quick-btn" onclick="LawAIApp.Calendar.changeMonth(-1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;font-family:inherit;">←</button>
        <strong>${monthName} ${this.currentYear}</strong>
        <button class="quick-btn" onclick="LawAIApp.Calendar.changeMonth(1)" style="padding:6px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;font-family:inherit;">→</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;color:#64748b;margin-bottom:4px;">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
        ${this._generateCalendarGrid()}
      </div>
      <button onclick="LawAIApp.Calendar._goToday()" class="quick-btn" style="margin-top:0.5rem;padding:6px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;cursor:pointer;font-family:inherit;">Today</button>
    `;
  },

  // ============================================================
  // 时间线视图
  // ============================================================
  renderTimelineView: function(container) {
    container.innerHTML = `
      <h3 style="font-size:16px;font-weight:600;">📜 Learning Timeline</h3>
      <div class="search-box-container" style="margin:0.5rem 0;">
        <input class="search-box" id="timeline-search" placeholder="Search timeline..." style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:13px;">
      </div>
      <div id="timeline-list">
        ${window.LawAIApp?.Timeline?.renderHTML ? window.LawAIApp.Timeline.renderHTML() : '<p style="color:#94a3b8;">Timeline not available.</p>'}
      </div>
    `;
    
    var searchInput = document.getElementById('timeline-search');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        var q = e.target.value.toLowerCase();
        var all = window.LawAIApp?.History?.getHistory ? window.LawAIApp.History.getHistory(100) : [];
        var filtered = all.filter(function(l) {
          return (l.title || '').toLowerCase().includes(q) || (l.category || '').toLowerCase().includes(q);
        });
        var list = document.getElementById('timeline-list');
        if (list) {
          list.innerHTML = filtered.map(function(l) {
            return `
              <div class="note-card" style="margin:0.5rem 0;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
                <strong>${l.title}</strong> <span style="color:#94a3b8">· ${l.duration}</span><br>
                <small style="color:#64748b;">${new Date(l.completedDate).toLocaleDateString()} · XP ${l.xpReward}</small>
              </div>
            `;
          }).join('') || '<p style="color:#94a3b8;">No results.</p>';
        }
      });
    }
  },

  // ============================================================
  // 统计视图
  // ============================================================
  renderStatsView: function(container) {
    container.innerHTML = `
      ${window.LawAIApp?.Statistics?.renderHTML ? window.LawAIApp.Statistics.renderHTML() : '<p style="color:#94a3b8;">Statistics not available.</p>'}
      <div class="section-card" style="margin-top:12px;padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
        <h3 style="font-size:14px;font-weight:600;margin:0 0 8px;">🔥 Activity Heatmap</h3>
        <div id="heatmap-container"></div>
      </div>
    `;
    if (window.LawAIApp?.Heatmap?.renderHeatmap) {
      try {
        window.LawAIApp.Heatmap.renderHeatmap('heatmap-container');
      } catch (e) {}
    }
  },

  // ============================================================
  // Second Brain 视图
  // ============================================================
  renderSecondBrainView: function(container) {
    var entries = [];
    try {
      entries = window.LawAIApp?.SecondBrain?.getAllEntries ? window.LawAIApp.SecondBrain.getAllEntries() : [];
    } catch (e) {}
    
    container.innerHTML = `
      <h3 style="font-size:16px;font-weight:600;">🧠 Second Brain</h3>
      <input class="search-box" id="brain-search" placeholder="Search your knowledge base..." style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:13px;margin-bottom:8px;">
      <div id="brain-results" style="margin-top:1rem;">
        ${entries.length === 0 ? '<p style="color:#94a3b8;">No entries yet. Complete lessons to build your Second Brain.</p>' : ''}
        ${entries.slice(0,20).map(function(e) {
          return `
            <div class="note-card" style="margin:0.5rem 0;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
              <strong>${e.title}</strong>
              <p style="color:#94a3b8;font-size:13px;">${e.summary}</p>
              <small style="color:#64748b;">Keywords: ${e.keywords.join(', ')}</small><br>
              <small style="color:#64748b;">Completed: ${e.completedDate ? new Date(e.completedDate).toLocaleDateString() : 'N/A'}</small>
              <div class="quick-access" style="margin-top:0.3rem;">
                <button class="quick-btn" onclick="LawAIApp.Router?.navigate('lesson', {day:${parseInt(e.lessonId.split('-')[1])}})" style="padding:4px 12px;background:rgba(74,158,255,0.06);border:1px solid rgba(74,158,255,0.08);border-radius:100px;color:#4a9eff;font-size:11px;cursor:pointer;font-family:inherit;">Open Lesson</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    var searchInput = document.getElementById('brain-search');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        var q = e.target.value.toLowerCase();
        var filtered = [];
        try {
          filtered = window.LawAIApp?.SecondBrain?.search ? window.LawAIApp.SecondBrain.search(q) : [];
        } catch (err) {}
        var results = document.getElementById('brain-results');
        if (results) {
          results.innerHTML = filtered.map(function(e) {
            return `
              <div class="note-card" style="margin:0.5rem 0;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
                <strong>${e.title}</strong>
                <p style="color:#94a3b8;font-size:13px;">${e.summary}</p>
                <small style="color:#64748b;">Keywords: ${e.keywords.join(', ')}</small>
              </div>
            `;
          }).join('') || '<p style="color:#94a3b8;">No results.</p>';
        }
      });
    }
  },

  // ============================================================
  // Planner 视图
  // ============================================================
  renderPlannerView: function(container) {
    var plan = this._getPlan();
    var health = this._getHealth();
    var memory = this._getMemory();
    var weekSummary = this._getWeekSummary();

    container.innerHTML = `
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
            <div style="font-size:12px;color:#94a3b8;">❤️ Health</div>
            <div style="font-size:20px;font-weight:700;color:${health > 70 ? '#22c55e' : '#f59e0b'};">${health}%</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
            <div style="font-size:12px;color:#94a3b8;">🧠 Memory</div>
            <div style="font-size:20px;font-weight:700;color:${memory > 70 ? '#4a9eff' : '#f59e0b'};">${memory}%</div>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:14px;color:#94a3b8;font-weight:400;">⏳ Today's Plan</h3>
            <div style="display:flex;align-items:center;gap:8px;">
              <label style="font-size:12px;color:#94a3b8;">Time Block:</label>
              <select id="time-block-select" style="
                padding:4px 8px;
                background:rgba(255,255,255,0.05);
                border:1px solid rgba(255,255,255,0.08);
                border-radius:6px;
                color:#e2e8f0;
                font-size:12px;
                font-family:inherit;
              ">
                <option value="15" ${plan.timeBlock === 15 ? 'selected' : ''}>15 min</option>
                <option value="30" ${plan.timeBlock === 30 ? 'selected' : ''}>30 min</option>
                <option value="45" ${plan.timeBlock === 45 ? 'selected' : ''}>45 min</option>
                <option value="60" ${plan.timeBlock === 60 ? 'selected' : ''}>60 min</option>
              </select>
            </div>
          </div>
          <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">${plan.usedMinutes || 0} / ${plan.timeBlock || 30} min used</p>
          <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-bottom:8px;">
            <div style="width:${plan.timeBlock > 0 ? Math.min(100, (plan.usedMinutes / plan.timeBlock) * 100) : 0}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;"></div>
          </div>
          ${plan.tasks && plan.tasks.length > 0 ? plan.tasks.map(function(task) {
            return `
              <div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;">
                <div>
                  <span style="font-size:13px;">${task.title || 'Task'}</span>
                  <small style="color:#94a3b8;display:block;font-size:11px;">${task.description || ''} · ${task.estimatedMinutes || 10} min</small>
                </div>
                <button onclick="LawAIApp.Calendar._completeTask('${task.id || ''}')" style="
                  padding:4px 12px;
                  background:rgba(34,197,94,0.1);
                  border:1px solid rgba(34,197,94,0.15);
                  border-radius:6px;
                  color:#22c55e;
                  font-size:11px;
                  cursor:pointer;
                  font-family:inherit;
                ">✅</button>
              </div>
            `;
          }).join('') : '<p style="color:#94a3b8;font-size:13px;">No tasks scheduled. Enjoy your free time!</p>'}
        </div>

        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
          <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📆 Upcoming Week</h3>
          ${weekSummary.map(function(day) {
            return `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:13px;">${day.date}</span>
                <span style="font-size:12px;color:#94a3b8;">📖 ${day.newLessons || 0} new · 🔁 ${day.reviews || 0} reviews</span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="background:rgba(139,92,246,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(139,92,246,0.1);">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:24px;">🤖</span>
            <div>
              <h4 style="margin:0 0 4px;font-size:14px;color:#8b5cf6;">Mentor Suggestion</h4>
              <p style="margin:0;color:#cbd5e1;font-size:13px;">${memory < 70 ? '🧠 Prioritize reviews to protect your memory retention.' : '📚 You\'re ready for a challenge! Add a new topic to your learning path.'}</p>
              // 在 </div> 结束前，Mentor Suggestion 下方添加
        <button onclick="LawAIApp.Calendar._showCreateTaskModal()" style="
          margin-top:12px;
          padding:8px 20px;
          background:rgba(74,158,255,0.08);
          border:1px solid rgba(74,158,255,0.12);
          border-radius:100px;
          color:#4a9eff;
          font-size:13px;
          cursor:pointer;
          font-family:inherit;
          width:100%;
        ">+ Add Learning Task</button>
            </div>
          </div>
        </div>
      </div>
    `;

    var select = document.getElementById('time-block-select');
    if (select) {
      var self = this;
      select.addEventListener('change', function(e) {
        var minutes = parseInt(e.target.value);
        self._generatePlan(minutes);
        self.renderPlannerView(container);
      });
    }
  },

  // ============================================================
  // Planner 辅助方法
  // ============================================================
  _getPlan: function() {
    var stored = this._safeGet('dailyPlan');
    if (stored) return stored;

    var defaultPlan = {
      timeBlock: 30,
      usedMinutes: 0,
      tasks: [
        { id: 'task_1', title: 'Complete Daily Lesson', description: 'Day ' + (this._getCompletedLessons() + 1), estimatedMinutes: 15 },
        { id: 'task_2', title: 'Review Previous Lesson', description: 'Reinforce learning', estimatedMinutes: 10 }
      ]
    };
    this._safeSet('dailyPlan', defaultPlan);
    return defaultPlan;
  },

  _generatePlan: function(minutes) {
    var plan = this._getPlan();
    plan.timeBlock = minutes;
    var completed = this._getCompletedLessons();
    plan.tasks = [
      { id: 'task_' + Date.now() + '_1', title: 'Complete Daily Lesson', description: 'Day ' + (completed + 1), estimatedMinutes: Math.min(20, minutes * 0.5) },
      { id: 'task_' + Date.now() + '_2', title: 'Review Previous Lesson', description: 'Reinforce learning', estimatedMinutes: Math.min(15, minutes * 0.3) }
    ];
    if (minutes > 30) {
      plan.tasks.push({ id: 'task_' + Date.now() + '_3', title: 'Practice Exercise', description: 'Apply what you learned', estimatedMinutes: Math.min(20, minutes * 0.2) });
    }
    plan.usedMinutes = plan.tasks.reduce(function(sum, t) { return sum + (t.estimatedMinutes || 0); }, 0);
    this._safeSet('dailyPlan', plan);
  },

  _getCompletedLessons: function() {
    try {
      if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
        var progress = LawAIApp.ProgressEngine.getProgress();
        return progress.completedLessons?.length || 0;
      }
    } catch (e) {}
    return 0;
  },

  _getHealth: function() {
    try {
      if (LawAIApp.LearningIntelligence && typeof LawAIApp.LearningIntelligence.getHealth === 'function') {
        var h = LawAIApp.LearningIntelligence.getHealth();
        return h?.overall || 70;
      }
    } catch (e) {}
    return 70;
  },

  _getMemory: function() {
    try {
      if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getAll === 'function') {
        var memories = LawAIApp.MemoryEngine.getAll() || {};
        var keys = Object.keys(memories);
        if (keys.length > 0) {
          var total = 0;
          for (var key in memories) {
            total += memories[key].strength || 50;
          }
          return Math.round(total / keys.length);
        }
      }
    } catch (e) {}
    return 80;
  },

  _getWeekSummary: function() {
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(function(day, index) {
      return {
        date: day,
        newLessons: index === 0 ? 1 : 0,
        reviews: index === 2 ? 2 : 0
      };
    });
  },

  _completeTask: function(taskId) {
    var plan = this._getPlan();
    plan.tasks = plan.tasks.filter(function(t) { return t.id !== taskId; });
    this._safeSet('dailyPlan', plan);
    
    if (window.LawAIApp?.Toast?.success) {
      LawAIApp.Toast.success('✅ Task completed!');
    } else {
      alert('✅ Task completed!');
    }
    
    this.render();
  }

  // ============================================================
  // Part 106: Schedule CRUD
  // ============================================================

  _getScheduleKey: function() {
    return 'lawai_calendar_schedule_' + (this._userId || 'default');
  },

  _getAllSchedules: function() {
    try {
      var stored = localStorage.getItem(this._getScheduleKey());
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  _saveSchedules: function(schedules) {
    try {
      localStorage.setItem(this._getScheduleKey(), JSON.stringify(schedules));
      return true;
    } catch (e) {
      return false;
    }
  },

  _getScheduleForDate: function(dateStr) {
    var schedules = this._getAllSchedules();
    return schedules.filter(function(s) { return s.date === dateStr; });
  },

  _createSchedule: function(title, date, startTime, endTime, description) {
    var schedule = {
      id: 'sch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: title || 'Learning Session',
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      description: description || '',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'calendar'
    };

    var schedules = this._getAllSchedules();
    schedules.push(schedule);
    this._saveSchedules(schedules);

    // 发送事件到 Core
    this._emitScheduleEvent('SCHEDULE_CREATED', schedule);

    return schedule;
  },

  _updateSchedule: function(id, updates) {
    var schedules = this._getAllSchedules();
    var index = schedules.findIndex(function(s) { return s.id === id; });
    if (index === -1) return null;

    schedules[index] = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._saveSchedules(schedules);

    this._emitScheduleEvent('SCHEDULE_UPDATED', schedules[index]);
    return schedules[index];
  },

  _deleteSchedule: function(id) {
    var schedules = this._getAllSchedules();
    var deleted = schedules.find(function(s) { return s.id === id; });
    schedules = schedules.filter(function(s) { return s.id !== id; });
    this._saveSchedules(schedules);

    if (deleted) {
      this._emitScheduleEvent('SCHEDULE_CANCELLED', deleted);
    }
    return deleted;
  },

  _emitScheduleEvent: function(eventType, payload) {
    try {
      var event = new CustomEvent(eventType, {
        detail: {
          eventId: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          source: 'calendar',
          actor: 'learner',
          timestamp: new Date().toISOString(),
          eventType: eventType,
          payload: payload || {},
          schemaVersion: '1.0.0'
        }
      });
      document.dispatchEvent(event);
      window.dispatchEvent(event);
      console.log('[Calendar] Event emitted:', eventType);
    } catch (e) {}
  },

  _showCreateTaskModal: function() {
    var container = this._getContainer();
    if (!container) return;

    var modalHtml = `
      <div id="schedule-modal" style="
        position:fixed;
        top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.6);
        backdrop-filter:blur(4px);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:1000;
      ">
        <div style="
          background:#1a2639;
          border-radius:16px;
          padding:24px;
          max-width:400px;
          width:90%;
          border:1px solid rgba(255,255,255,0.06);
        ">
          <h3 style="margin:0 0 16px;font-size:18px;">📅 New Learning Task</h3>
          
          <div style="margin-bottom:12px;">
            <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Title *</label>
            <input id="modal-task-title" placeholder="e.g. Review AI Fundamentals" style="
              width:100%;
              padding:8px 12px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.06);
              border-radius:8px;
              color:#e2e8f0;
              font-family:inherit;
              font-size:13px;
            ">
          </div>
          
          <div style="margin-bottom:12px;">
            <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Date *</label>
            <input id="modal-task-date" type="date" value="${new Date().toISOString().split('T')[0]}" style="
              width:100%;
              padding:8px 12px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.06);
              border-radius:8px;
              color:#e2e8f0;
              font-family:inherit;
              font-size:13px;
            ">
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div>
              <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Start</label>
              <input id="modal-task-start" type="time" value="09:00" style="
                width:100%;
                padding:8px 12px;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.06);
                border-radius:8px;
                color:#e2e8f0;
                font-family:inherit;
                font-size:13px;
              ">
            </div>
            <div>
              <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">End</label>
              <input id="modal-task-end" type="time" value="10:00" style="
                width:100%;
                padding:8px 12px;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.06);
                border-radius:8px;
                color:#e2e8f0;
                font-family:inherit;
                font-size:13px;
              ">
            </div>
          </div>
          
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button onclick="LawAIApp.Calendar._confirmCreateTask()" style="
              flex:1;
              padding:10px;
              background:#4a9eff;
              border:none;
              border-radius:8px;
              color:white;
              font-size:14px;
              font-weight:600;
              cursor:pointer;
              font-family:inherit;
            ">Create</button>
            <button onclick="LawAIApp.Calendar._closeModal()" style="
              flex:1;
              padding:10px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.06);
              border-radius:8px;
              color:#94a3b8;
              font-size:14px;
              cursor:pointer;
              font-family:inherit;
            ">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // 移除旧 modal
    var oldModal = document.getElementById('schedule-modal');
    if (oldModal) oldModal.remove();

    container.insertAdjacentHTML('beforeend', modalHtml);
  },

  _closeModal: function() {
    var modal = document.getElementById('schedule-modal');
    if (modal) modal.remove();
  },

  _confirmCreateTask: function() {
    var title = document.getElementById('modal-task-title')?.value || 'Learning Session';
    var date = document.getElementById('modal-task-date')?.value || new Date().toISOString().split('T')[0];
    var start = document.getElementById('modal-task-start')?.value || '09:00';
    var end = document.getElementById('modal-task-end')?.value || '10:00';

    this._createSchedule(title, date, start, end);
    this._closeModal();

    if (window.LawAIApp?.Toast?.success) {
      LawAIApp.Toast.success('✅ Task created!');
    }
    this.render();
  },
};

// ============================================================
// 兼容旧 API
// ============================================================
LawAIApp.Views.calendarDashboard = LawAIApp.Calendar;

console.log('📅 Unified Calendar module loaded');
