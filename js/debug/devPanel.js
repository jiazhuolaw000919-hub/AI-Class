// ===========================================
// devPanel.js
// 开发者面板 - Ctrl+Shift+D 调出（Season 1.5 Part L 最终版 + Recovery Architecture）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.DevPanel = {
    _panel: null,
    _isOpen: false,

    /**
     * 切换面板
     */
    toggle: function() {
        if (this._isOpen) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * 显示面板
     */
    show: function() {
        if (this._panel) {
            this._panel.remove();
        }

        this._panel = document.createElement('div');
        this._panel.id = 'dev-panel';
        this._panel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 20px;
            max-width: 320px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
            backdrop-filter: blur(20px);
        `;

        // 获取状态
        var engineStatus = [];
        try {
            if (LawAIApp.StartupValidator && typeof LawAIApp.StartupValidator.validate === 'function') {
                engineStatus = LawAIApp.StartupValidator.validate() || [];
            }
        } catch (e) { engineStatus = ['StartupValidator not available']; }

        var storageReport = { totalKeys: 0, orphanKeys: [] };
        try {
            if (LawAIApp.Debug?.StorageAudit && typeof LawAIApp.Debug.StorageAudit.audit === 'function') {
                storageReport = LawAIApp.Debug.StorageAudit.audit();
            } else if (LawAIApp.StorageAudit && typeof LawAIApp.StorageAudit.audit === 'function') {
                storageReport = LawAIApp.StorageAudit.audit();
            }
        } catch (e) { /* ignore */ }

        var version = LawAIApp.SystemComposer?.version || '4.0.17';

        // ============================================================
        // 🔥 PART 1 RECOVERY: Get Architecture Info
        // ============================================================
        var archInfo = this._getArchitectureInfo();

        this._panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">
                <span style="font-size:16px;font-weight:700;color:#4a9eff;">🛠️ Dev Panel</span>
                <button onclick="LawAIApp.Debug.DevPanel.hide()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button>
            </div>

            <!-- 🔥 Architecture Status -->
            <div style="margin-bottom:10px;padding:8px 12px;background:rgba(74,158,255,0.06);border-radius:8px;border-left:2px solid #4a9eff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏗️ Architecture</span>
                    <span style="font-size:10px;color:${archInfo.ready ? '#22c55e' : '#f59e0b'};">${archInfo.ready ? '✅ Ready' : '⏳ Initializing'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Domains: ${archInfo.domains}</span>
                    <span>Layers: ${archInfo.layers}</span>
                    <span>Warnings: ${archInfo.warnings}</span>
                </div>
            </div>

            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#64748b;">Version</span>
                    <span style="color:#e2e8f0;font-weight:600;">${version}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#64748b;">Engines</span>
                    <span style="color:${engineStatus.length > 0 ? '#ef4444' : '#22c55e'};font-weight:600;">${engineStatus.length > 0 ? engineStatus.join(', ') : '✅ All loaded'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#64748b;">Storage Keys</span>
                    <span style="color:#e2e8f0;font-weight:600;">${storageReport.totalKeys} (${storageReport.orphanKeys?.length || 0} orphan)</span>
                </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
                <button onclick="if(confirm('⚠️ Delete ALL data?')){LawAIApp.FactoryReset?.resetAll?.() || LawAIApp.FactoryReset?.execute?.()}" style="padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-size:12px;cursor:pointer;">🗑️ Reset</button>
                <button onclick="LawAIApp.FactoryReset?.exportBackup?.() || LawAIApp.Debug?.StorageAudit?.exportAll?.()" style="padding:6px 14px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;font-size:12px;cursor:pointer;">💾 Export</button>
                <button onclick="document.getElementById('dev-import-input').click()" style="padding:6px 14px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;font-size:12px;cursor:pointer;">📥 Import</button>
                <button onclick="var r=LawAIApp.Debug?.StorageAudit?.cleanOrphans?.();if(r!==undefined){alert('Removed '+r+' orphan keys');}else{alert('StorageAudit not available');}" style="padding:6px 14px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15);border-radius:8px;color:#f59e0b;font-size:12px;cursor:pointer;">🧹 Clean</button>
                <button onclick="console.log('📋 Storage:', JSON.stringify(localStorage, null, 2));alert('Check console for storage dump')" style="padding:6px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:12px;cursor:pointer;">📋 Log</button>
                <button onclick="location.reload()" style="padding:6px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.15);border-radius:8px;color:#22c55e;font-size:12px;cursor:pointer;">🔄 Reload</button>
            </div>

            <!-- 🔥 Architecture Details (collapsible) -->
            <details style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">
                <summary style="font-size:10px;color:#64748b;cursor:pointer;">🏗️ Architecture Details</summary>
                <div style="font-size:9px;color:#475569;margin-top:6px;line-height:1.6;max-height:120px;overflow-y:auto;">
                    <div>Domains: ${archInfo.domainList || 'N/A'}</div>
                    <div>Layers: ${archInfo.layerList || 'N/A'}</div>
                    <div>Recovery Flags: ${archInfo.flags || 'N/A'}</div>
                </div>
            </details>

            <div style="font-size:10px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:10px;margin-top:12px;">
                Press Ctrl+Shift+D to close
            </div>

            <input type="file" id="dev-import-input" accept=".json" style="display:none" onchange="LawAIApp.FactoryReset?.importBackup?.(this.files[0]) || LawAIApp.Debug?.DevPanel?._importBackup?.(this.files[0])">
        `;

        document.body.appendChild(this._panel);
        this._isOpen = true;
    },

    /**
     * 🔥 PART 1 RECOVERY: Get architecture info from registries
     */
    _getArchitectureInfo: function() {
        var info = {
            ready: false,
            domains: 0,
            layers: 0,
            warnings: 0,
            domainList: '',
            layerList: '',
            flags: ''
        };

        try {
            // Domain Registry
            var domainRegistry = LawAIApp.DomainRegistry || window.domainRegistry;
            if (domainRegistry && typeof domainRegistry.list === 'function') {
                var domains = domainRegistry.list();
                info.domains = domains.length;
                info.domainList = domains.map(function(d) { return d.name; }).join(', ');
            }

            // Layer Registry
            var layerRegistry = LawAIApp.LayerRegistry || window.layerRegistry;
            if (layerRegistry && typeof layerRegistry.list === 'function') {
                var layers = layerRegistry.list();
                info.layers = Object.keys(layers).length;
                info.layerList = Object.keys(layers).join(', ');
            }

            // Architecture Validator - check warnings
            var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
            if (archValidator && archValidator.warnings) {
                info.warnings = archValidator.warnings.length || 0;
            }

            // Recovery Flags
            var constants = LawAIApp.ArchitectureConstants || window.architectureConstants;
            if (constants && constants.RECOVERY_FLAGS) {
                var flags = constants.RECOVERY_FLAGS;
                var flagStr = [];
                for (var key in flags) {
                    if (flags.hasOwnProperty(key)) {
                        flagStr.push(key + ':' + (flags[key] ? '✅' : '⏳'));
                    }
                }
                info.flags = flagStr.join(' ');
            }

            info.ready = info.domains > 0 && info.layers > 0;

        } catch (err) {
            console.warn('Could not get architecture info:', err);
        }

        return info;
    },

    /**
     * 隐藏面板
     */
    hide: function() {
        if (this._panel) {
            this._panel.remove();
            this._panel = null;
        }
        this._isOpen = false;
    },

    /**
     * 导入备份（备选方法）
     */
    _importBackup: function(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var backup = JSON.parse(e.target.result);
                var count = 0;
                for (var key in backup) {
                    if (backup.hasOwnProperty(key)) {
                        localStorage.setItem(key, JSON.stringify(backup[key]));
                        count++;
                    }
                }
                alert('✅ Imported ' + count + ' items. Refreshing...');
                setTimeout(function() { location.reload(); }, 1500);
            } catch (err) {
                alert('❌ Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
};

// 快捷键
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        LawAIApp.Debug.DevPanel.toggle();
    }
});

// 备选：如果 LawAIApp.DevPanel 还没定义，创建别名
if (!LawAIApp.DevPanel) {
    LawAIApp.DevPanel = LawAIApp.Debug.DevPanel;
}

console.log('🛠️ DevPanel ready (Ctrl+Shift+D) [Recovery Architecture Enabled]');
