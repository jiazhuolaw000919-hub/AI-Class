// devPanel.js
LawAIApp.DevPanel = {
  _panel: null,
  _isOpen: false,

  // 切换开发者面板
  toggle() {
    if (this._isOpen) {
      this.hide();
    } else {
      this.show();
    }
  },

  show() {
    if (this._panel) this._panel.remove();
    this._panel = document.createElement('div');
    this._panel.style.cssText = `
      position: fixed; top: 10px; left: 10px; z-index: 10000;
      background: var(--card); border-radius: 12px; padding: 1rem;
      max-width: 300px; max-height: 80vh; overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      font-size: 0.8rem;
    `;

    const engineStatus = LawAIApp.StartupValidator?.validate() || [];
    const storageReport = LawAIApp.StorageAudit?.audit() || { totalKeys: 0, orphanKeys: [] };

    this._panel.innerHTML = `
      <h3>🛠️ Developer Panel</h3>
      <hr>
      <p><strong>Version:</strong> Alpha 1.0 (Phase 40)</p>
      <p><strong>Engines Missing:</strong> ${engineStatus.length > 0 ? engineStatus.join(', ') : '✅ All loaded'}</p>
      <p><strong>Storage Keys:</strong> ${storageReport.totalKeys} (Orphan: ${storageReport.orphanKeys.length})</p>
      <hr>
      <button onclick="LawAIApp.FactoryReset.execute()">🧹 Factory Reset</button>
      <button onclick="LawAIApp.FactoryReset.exportBackup()">💾 Export Backup</button>
      <input type="file" id="dev-import-backup" style="display:none" onchange="LawAIApp.FactoryReset.importBackup(this.files[0])">
      <button onclick="document.getElementById('dev-import-backup').click()">📥 Import Backup</button>
      <button onclick="LawAIApp.StorageAudit.cleanOrphans()">🧽 Clean Orphan Data</button>
      <button onclick="console.log(JSON.stringify(localStorage, null, 2))">📋 Log Storage</button>
      <button onclick="LawAIApp.DevPanel.hide()">Close</button>
    `;

    document.body.appendChild(this._panel);
    this._isOpen = true;
  },

  hide() {
    if (this._panel) {
      this._panel.remove();
      this._panel = null;
    }
    this._isOpen = false;
  }
};

// 快捷键：Ctrl + Shift + D 打开/关闭开发者面板
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    LawAIApp.DevPanel.toggle();
  }
});
