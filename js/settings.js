LawAIApp.Settings = {
  render() {
    const darkMode = !document.body.classList.contains('light-mode');
    const html = `
      <div class="page">
        <h2>⚙️ Settings</h2>
        <div class="settings-group">
          <div class="settings-item" id="dark-toggle">
            <span>Dark Mode</span>
            <div class="toggle ${darkMode ? 'active' : ''}"></div>
          </div>
          <div class="settings-item"><span>About</span><span>v1.0.0</span></div>
          <div class="settings-item"><span>Version</span><span>Phase 1</span></div>
          <div class="settings-item" id="reset-progress"><span>Reset Progress</span><span style="color:var(--danger)">⚠️</span></div>
          <div class="settings-item"><span>Backup</span><span>Coming Soon</span></div>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    document.getElementById('dark-toggle').addEventListener('click', () => {
      LawAIApp.Theme.toggle();
      this.render(); // refresh to update toggle visual
    });
    document.getElementById('reset-progress').addEventListener('click', () => {
      if(confirm('Reset all progress?')) {
        localStorage.clear();
        LawAIApp.Storage.set('darkMode', !document.body.classList.contains('light-mode'));
        location.reload();
      }
    });
  }
};

// Tools & Prompt pages (static)
LawAIApp.Tools = {
  render() {
    const tools = ['ChatGPT','Claude','Gemini','Cursor','Perplexity','NotebookLM','GitHub','Supabase','Lovable','Bolt'];
    document.getElementById('app').innerHTML = `
      <div class="page">
        <h2>🛠️ AI Tools</h2>
        <div class="widget-grid">
          ${tools.map(t => `<div class="widget-card" onclick="alert('Coming Soon')">${t}</div>`).join('')}
        </div>
      </div>`;
  }
};

LawAIApp.Prompt = {
  render() {
    const cats = ['Coding','Writing','Business','Marketing','Fitness','Health','Email'];
    document.getElementById('app').innerHTML = `
      <div class="page">
        <h2>📋 Prompt Library</h2>
        <div class="widget-grid">
          ${cats.map(c => `<div class="widget-card">${c}<br><small>Coming Soon</small></div>`).join('')}
        </div>
      </div>`;
  }
};
