// settings.js — Settings Product Surface
// Part 110: Settings Revival
// Part 111: Verification & Stabilization

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Settings = {
  _initialized: false,
  _root: null,

  // ============================================================
  // 容器获取
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
  // 初始化
  // ============================================================
  init: function() {
    if (this._initialized) return;
    this._initialized = true;
    console.log('[Settings] ✅ Initialized');
  },

  // ============================================================
  // 返回 Dashboard
  // ============================================================
  goToDashboard: function() {
    console.log('[Settings] 📊 Back to Dashboard');
    
    // 🔥 不跳转页面，直接清除 Settings 并渲染 Dashboard
    var container = this._getContainer();
    if (container) {
        container.innerHTML = '';  // 清空 Settings 内容
    }
    
    // 调用 Dashboard 的强制渲染
    if (window.LawAIApp?.Dashboard) {
        // 重置 Dashboard 状态
        window.LawAIApp.Dashboard._rendered = false;
        window.LawAIApp.Dashboard.render();
    } else {
        // Fallback: 跳转首页
        window.location.href = '/';
    }
  },

  // ============================================================
  // 主渲染
  // ============================================================
  render: function() {
    var container = this._getContainer();
    if (!container) {
      console.warn('[Settings] No container found');
      return;
    }

    this.init();

    var darkMode = !document.body.classList.contains('light-mode');

    var html = `
      <div class="page" style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">

        <!-- 返回按钮 -->
        <button onclick="LawAIApp.Settings.goToDashboard()" style="
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
          margin-bottom:16px;
          transition:all 0.2s;
        " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
          ← Back to Dashboard
        </button>

        <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">⚙️ Settings</h2>

        <!-- 设置分组 -->
        <div style="
          background:rgba(255,255,255,0.02);
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
        ">

          <!-- Dark Mode -->
          <div id="dark-toggle" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
            <span style="font-size:14px;">🌙 Dark Mode</span>
            <div class="toggle ${darkMode ? 'active' : ''}" style="
              width:44px;
              height:24px;
              background:${darkMode ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.1)'};
              border-radius:100px;
              position:relative;
              transition:all 0.3s ease;
              flex-shrink:0;
            ">
              <div style="
                width:18px;
                height:18px;
                background:white;
                border-radius:50%;
                position:absolute;
                top:3px;
                left:${darkMode ? '23px' : '3px'};
                transition:all 0.3s ease;
                box-shadow:0 1px 4px rgba(0,0,0,0.2);
              "></div>
            </div>
          </div>

          <!-- 其他设置 -->
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
          ">
            <span style="font-size:14px;">ℹ️ About</span>
            <span style="color:#94a3b8;font-size:13px;">Law AI Academy</span>
          </div>

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
          ">
            <span style="font-size:14px;">📌 Version</span>
            <span style="color:#94a3b8;font-size:13px;">Season 4</span>
          </div>

          <!-- Reset Progress -->
          <div id="reset-progress" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(239,68,68,0.04)'" onmouseout="this.style.background='transparent'">
            <span style="font-size:14px;color:#ef4444;">⚠️ Reset Progress</span>
            <span style="color:#ef4444;font-size:12px;">Reset</span>
          </div>

          <!-- Export Backup -->
          <div id="export-backup" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            cursor:pointer;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(74,158,255,0.04)'" onmouseout="this.style.background='transparent'">
            <span style="font-size:14px;">💾 Export Backup</span>
            <span style="color:#4a9eff;font-size:12px;">Download</span>
          </div>
        </div>

        <!-- 底部 Authority 标记 -->
        <div style="
          margin-top:12px;
          padding:8px 14px;
          background:rgba(255,255,255,0.02);
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.03);
          display:flex;
          justify-content:space-between;
          font-size:10px;
          color:#475569;
        ">
          <span>🔒 Settings Authority</span>
          <span>Preference Authority</span>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // ============================================================
    // 事件绑定
    // ============================================================

    // 1. Dark Mode Toggle
    var darkToggle = document.getElementById('dark-toggle');
    if (darkToggle) {
      darkToggle.addEventListener('click', function() {
        // 使用 ThemeEngine 或 Theme.toggle
        if (LawAIApp.Theme && typeof LawAIApp.Theme.toggle === 'function') {
          LawAIApp.Theme.toggle();
        } else if (LawAIApp.ThemeEngine && typeof LawAIApp.ThemeEngine.applyTheme === 'function') {
          var current = LawAIApp.ThemeEngine.getCurrentThemeId ? LawAIApp.ThemeEngine.getCurrentThemeId() : 'dark_default';
          var next = current === 'dark_default' ? 'light_default' : 'dark_default';
          LawAIApp.ThemeEngine.applyTheme(next);
        } else {
          document.body.classList.toggle('light-mode');
        }
        // 重新渲染 Settings 以反映新状态
        setTimeout(function() { LawAIApp.Settings.render(); }, 100);
      });
    }

    // 2. Reset Progress
    var resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('⚠️ Reset all progress? This cannot be undone.\n\nThis will reset your learning progress but keep your preferences.')) {
          if (LawAIApp.FactoryReset && typeof LawAIApp.FactoryReset.execute === 'function') {
            LawAIApp.FactoryReset.execute();
          } else {
            // 安全 fallback: 只清除学习数据，保留偏好
            var darkModePref = localStorage.getItem('lawai_darkMode');
            var themePref = localStorage.getItem('lawai_current_theme');
            localStorage.clear();
            if (darkModePref) localStorage.setItem('lawai_darkMode', darkModePref);
            if (themePref) localStorage.setItem('lawai_current_theme', themePref);
            location.reload();
          }
        }
      });
    }

    // 3. Export Backup
    var exportBtn = document.getElementById('export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        if (LawAIApp.FactoryReset && typeof LawAIApp.FactoryReset.exportBackup === 'function') {
          LawAIApp.FactoryReset.exportBackup();
        } else {
          // 简单导出
          try {
            var data = {};
            for (var i = 0; i < localStorage.length; i++) {
              var key = localStorage.key(i);
              if (key && key.startsWith('lawai_')) {
                data[key] = localStorage.getItem(key);
              }
            }
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'lawai_backup_' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
          } catch (e) {
            alert('Export failed: ' + e.message);
          }
        }
      });
    }

    console.log('[Settings] ✅ Rendered');
  }
};

console.log('⚙️ Settings module loaded (Part 111)');
