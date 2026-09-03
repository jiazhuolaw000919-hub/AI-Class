// settings.js
LawAIApp.Settings = {
  _initialized: false,
  _root: null,

  _getContainer: function() {
    if (this._root) return this._root;
    var container = document.getElementById('academy-root') || 
                     document.getElementById('app') ||
                     document.getElementById('law-runtime-root');
    return container;
  },

  init: function() {
    if (this._initialized) return;
    this._initialized = true;
    console.log('[Settings] ✅ Initialized');
  },

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
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="
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
        ">
          ← Back to Dashboard
        </button>
        <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">⚙️ Settings</h2>
        <div class="settings-group" style="
          background:rgba(255,255,255,0.02);
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.04);
          padding:4px 0;
        ">
          <div class="settings-item" id="dark-toggle" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;
          ">
            <span style="font-size:14px;">Dark Mode</span>
            <div class="toggle ${darkMode ? 'active' : ''}" style="
              width:44px;
              height:24px;
              background:${darkMode ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.1)'};
              border-radius:100px;
              position:relative;
              transition:all 0.3s;
            ">
              <div style="
                width:18px;
                height:18px;
                background:white;
                border-radius:50%;
                position:absolute;
                top:3px;
                left:${darkMode ? '23px' : '3px'};
                transition:all 0.3s;
              "></div>
            </div>
          </div>
          <div class="settings-item" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
          ">
            <span style="font-size:14px;">About</span>
            <span style="color:#94a3b8;font-size:13px;">v1.0.0</span>
          </div>
          <div class="settings-item" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
          ">
            <span style="font-size:14px;">Version</span>
            <span style="color:#94a3b8;font-size:13px;">Season 4</span>
          </div>
          <div class="settings-item" id="reset-progress" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;
          ">
            <span style="font-size:14px;color:#ef4444;">Reset Progress</span>
            <span style="color:#ef4444;">⚠️</span>
          </div>
          <div class="settings-item" id="export-backup" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;
          ">
            <span style="font-size:14px;">Export Backup</span>
            <span style="color:#4a9eff;">💾</span>
          </div>
          <div class="settings-item" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:14px 18px;
          ">
            <span style="font-size:14px;color:#94a3b8;">Backup</span>
            <span style="color:#64748b;font-size:13px;">Coming Soon</span>
          </div>
          <div class="settings-item" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:12px 18px;
            border-top:1px solid rgba(255,255,255,0.04);
            margin-top:4px;
          ">
            <span style="font-size:10px;color:#475569;">🔒 Settings Authority</span>
            <span style="font-size:9px;color:#64748b;">Preference Authority</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 事件绑定
    var darkToggle = document.getElementById('dark-toggle');
    if (darkToggle) {
      darkToggle.addEventListener('click', function() {
        if (LawAIApp.Theme && typeof LawAIApp.Theme.toggle === 'function') {
          LawAIApp.Theme.toggle();
        } else if (LawAIApp.ThemeEngine && typeof LawAIApp.ThemeEngine.applyTheme === 'function') {
          var current = LawAIApp.ThemeEngine.getCurrentThemeId();
          var next = current === 'dark_default' ? 'light_default' : 'dark_default';
          LawAIApp.ThemeEngine.applyTheme(next);
        } else {
          document.body.classList.toggle('light-mode');
        }
        setTimeout(function() { LawAIApp.Settings.render(); }, 100);
      });
    }

    var resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (LawAIApp.FactoryReset && typeof LawAIApp.FactoryReset.execute === 'function') {
          LawAIApp.FactoryReset.execute();
        } else {
          if (confirm('⚠️ Reset all progress? This cannot be undone.')) {
            localStorage.clear();
            // 重新保存主题偏好
            var isDark = !document.body.classList.contains('light-mode');
            try {
              localStorage.setItem('lawai_darkMode', JSON.stringify(isDark));
            } catch (e) {}
            location.reload();
          }
        }
      });
    }

    var exportBtn = document.getElementById('export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        if (LawAIApp.FactoryReset && typeof LawAIApp.FactoryReset.exportBackup === 'function') {
          LawAIApp.FactoryReset.exportBackup();
        } else {
          alert('📦 Export backup: ' + JSON.stringify(localStorage, null, 2));
        }
      });
    }
  }
};
