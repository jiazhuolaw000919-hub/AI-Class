// ===========================================
// devPanel.js
// 开发者面板 - Ctrl+Shift+‘ 调出
// Recovery R1 Parts 1, 2, 3, 4 Complete
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
            max-width: 380px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
            backdrop-filter: blur(20px);
        `;

        // ============================================================
        // 🔥 COLLECT ALL RECOVERY INFO (Parts 1, 2, 3, 4)
        // ============================================================
        
        // Part 1: Architecture Info
        var archInfo = this._getArchitectureInfo();
        
        // Part 2: Runtime Info
        var runtimeInfo = this._getRuntimeInfo();
        
        // Part 3: Feature Governance Info
        var featureInfo = this._getFeatureInfo();
        
        // Part 4: UI Constitution Info
        var uiInfo = this._getUIInfo();

        // Engine Status
        var engineStatus = [];
        try {
            if (LawAIApp.StartupValidator && typeof LawAIApp.StartupValidator.validate === 'function') {
                engineStatus = LawAIApp.StartupValidator.validate() || [];
            }
        } catch (e) { engineStatus = ['StartupValidator not available']; }

        // Storage Report
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
        // BUILD PANEL HTML
        // ============================================================
        this._panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">
                <span style="font-size:16px;font-weight:700;color:#4a9eff;">🛠️ Dev Panel</span>
                <span style="font-size:10px;color:#475569;">v${version}</span>
                <button onclick="LawAIApp.Debug.DevPanel.hide()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 2: RUNTIME STATUS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.06);border-radius:8px;border-left:2px solid #4a9eff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime</span>
                    <span style="font-size:10px;color:${runtimeInfo.ready ? '#22c55e' : '#f59e0b'};">${runtimeInfo.ready ? '✅ Ready' : '⏳ ' + runtimeInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: ${runtimeInfo.status}</span>
                    <span>Uptime: ${runtimeInfo.uptime}</span>
                    <span>Version: ${runtimeInfo.version}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Registry: ${runtimeInfo.registryCount} modules loaded
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 1: ARCHITECTURE STATUS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #64748b;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏗️ Architecture</span>
                    <span style="font-size:10px;color:${archInfo.ready ? '#22c55e' : '#f59e0b'};">${archInfo.ready ? '✅ Ready' : '⏳ Initializing'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Domains: ${archInfo.domains}</span>
                    <span>Layers: ${archInfo.layers}</span>
                    <span>Warnings: ${archInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    Layers: ${archInfo.layerList || 'N/A'}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 3: FEATURE GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">📦 Feature Governance</span>
                    <span style="font-size:10px;color:${featureInfo.healthScore >= 80 ? '#22c55e' : '#ef4444'};">${featureInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${featureInfo.total}</span>
                    <span>✅ ${featureInfo.healthy}</span>
                    <span>❌ ${featureInfo.unhealthy}</span>
                    <span>⛔ ${featureInfo.disabled}</span>
                    <span>⚠️ ${featureInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Domains: ${featureInfo.domains}
                </div>
                ${featureInfo.broken > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${featureInfo.broken} broken features detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 4: UI CONSTITUTION -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(236,72,153,0.04);border-radius:8px;border-left:2px solid #ec4899;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎨 UI Constitution</span>
                    <span style="font-size:10px;color:${uiInfo.healthScore >= 80 ? '#22c55e' : '#ef4444'};">${uiInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${uiInfo.total}</span>
                    <span>✅ ${uiInfo.healthy}</span>
                    <span>❌ ${uiInfo.unhealthy}</span>
                    <span>📭 ${uiInfo.unused}</span>
                    <span>⚠️ ${uiInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Categories: ${uiInfo.categories}
                </div>
                ${uiInfo.broken > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${uiInfo.broken} broken components detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- SYSTEM INFO -->
            <!-- ========================================================== -->
            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#64748b;">Engines</span>
                    <span style="color:${engineStatus.length > 0 ? '#ef4444' : '#22c55e'};font-weight:600;">${engineStatus.length > 0 ? engineStatus.join(', ') : '✅ All loaded'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#64748b;">Storage Keys</span>
                    <span style="color:#e2e8f0;font-weight:600;">${storageReport.totalKeys} (${storageReport.orphanKeys?.length || 0} orphan)</span>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- ACTIONS -->
            <!-- ========================================================== -->
            <div style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
                <button onclick="if(confirm('⚠️ Delete ALL data?')){LawAIApp.FactoryReset?.resetAll?.() || LawAIApp.FactoryReset?.execute?.()}" style="padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-size:12px;cursor:pointer;">🗑️ Reset</button>
                <button onclick="LawAIApp.FactoryReset?.exportBackup?.() || LawAIApp.Debug?.StorageAudit?.exportAll?.()" style="padding:6px 14px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;font-size:12px;cursor:pointer;">💾 Export</button>
                <button onclick="document.getElementById('dev-import-input').click()" style="padding:6px 14px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;font-size:12px;cursor:pointer;">📥 Import</button>
                <button onclick="var r=LawAIApp.Debug?.StorageAudit?.cleanOrphans?.();if(r!==undefined){alert('Removed '+r+' orphan keys');}else{alert('StorageAudit not available');}" style="padding:6px 14px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15);border-radius:8px;color:#f59e0b;font-size:12px;cursor:pointer;">🧹 Clean</button>
                <button onclick="console.log('📋 Storage:', JSON.stringify(localStorage, null, 2));alert('Check console for storage dump')" style="padding:6px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:12px;cursor:pointer;">📋 Log</button>
                <button onclick="location.reload()" style="padding:6px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.15);border-radius:8px;color:#22c55e;font-size:12px;cursor:pointer;">🔄 Reload</button>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 DETAILS (Collapsible) -->
            <!-- ========================================================== -->
            <details style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">
                <summary style="font-size:10px;color:#64748b;cursor:pointer;">📋 Recovery Details (Parts 1-4)</summary>
                <div style="font-size:9px;color:#475569;margin-top:6px;line-height:1.8;max-height:150px;overflow-y:auto;">
                    <div><strong>Part 1 - Architecture:</strong></div>
                    <div style="padding-left:12px;">Domains: ${archInfo.domainList || 'N/A'}</div>
                    <div style="padding-left:12px;">Flags: ${archInfo.flags || 'N/A'}</div>
                    <div><strong>Part 2 - Runtime:</strong></div>
                    <div style="padding-left:12px;">Status: ${runtimeInfo.status}</div>
                    <div style="padding-left:12px;">Registry: ${runtimeInfo.registryCount} modules</div>
                    <div><strong>Part 3 - Features:</strong></div>
                    <div style="padding-left:12px;">Total: ${featureInfo.total}</div>
                    <div style="padding-left:12px;">Health: ${featureInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Broken: ${featureInfo.broken}</div>
                    <div><strong>Part 4 - UI Constitution:</strong></div>
                    <div style="padding-left:12px;">Total: ${uiInfo.total}</div>
                    <div style="padding-left:12px;">Health: ${uiInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Broken: ${uiInfo.broken}</div>
                </div>
            </details>

            <div style="font-size:10px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:10px;margin-top:12px;">
                Press Ctrl+Shift+‘ to close
            </div>

            <input type="file" id="dev-import-input" accept=".json" style="display:none" onchange="LawAIApp.FactoryReset?.importBackup?.(this.files[0]) || LawAIApp.Debug?.DevPanel?._importBackup?.(this.files[0])">
        `;

        document.body.appendChild(this._panel);
        this._isOpen = true;
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

    // ============================================================
    // 🔥 PART 1: ARCHITECTURE INFO
    // ============================================================

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

    // ============================================================
    // 🔥 PART 2: RUNTIME INFO
    // ============================================================

    _getRuntimeInfo: function() {
        var info = {
            ready: false,
            status: 'unknown',
            uptime: '0s',
            version: 'N/A',
            registryCount: 0,
            registryModules: ''
        };

        try {
            // Runtime Status
            var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
            if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
                info.status = runtimeStatus.getStatus();
                info.ready = runtimeStatus.isReady ? runtimeStatus.isReady() : false;
            }

            // Runtime Kernel
            var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
            if (runtimeKernel && typeof runtimeKernel.health === 'function') {
                var health = runtimeKernel.health();
                info.version = health.version || 'N/A';
                info.uptime = health.uptime ? Math.round(health.uptime / 1000) + 's' : '0s';
            }

            // Runtime Registry
            var runtimeRegistry = LawAIApp.RuntimeRegistry || window.runtimeRegistry;
            if (runtimeRegistry && typeof runtimeRegistry.getAll === 'function') {
                var all = runtimeRegistry.getAll();
                info.registryCount = all.length;
                info.registryModules = all.map(function(e) { return e.name; }).join(', ');
            }

        } catch (err) {
            console.warn('Could not get runtime info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 3: FEATURE GOVERNANCE INFO
    // ============================================================

    _getFeatureInfo: function() {
        var info = {
            total: 0,
            healthy: 0,
            unhealthy: 0,
            disabled: 0,
            warnings: 0,
            broken: 0,
            healthScore: 0,
            domains: 'N/A',
            brokenList: []
        };

        try {
            // Feature Registry
            var featureRegistry = LawAIApp.FeatureRegistry || window.featureRegistry;
            if (featureRegistry && typeof featureRegistry.list === 'function') {
                var features = featureRegistry.list();
                info.total = features.length;
                
                // Count healthy/unhealthy
                var healthyCount = 0;
                var unhealthyCount = 0;
                var disabledCount = 0;
                var brokenList = [];
                
                for (var i = 0; i < features.length; i++) {
                    var f = features[i];
                    if (f.status === 'disabled') {
                        disabledCount++;
                    } else if (f.healthy === false) {
                        unhealthyCount++;
                        brokenList.push(f.name || f.id);
                    } else {
                        healthyCount++;
                    }
                }
                
                info.healthy = healthyCount;
                info.unhealthy = unhealthyCount;
                info.disabled = disabledCount;
                info.broken = brokenList.length;
                info.brokenList = brokenList;
                
                // Health score
                var total = features.length - disabledCount;
                if (total > 0) {
                    info.healthScore = Math.round((healthyCount / total) * 100);
                }
                
                // Domains
                if (typeof featureRegistry.getDomains === 'function') {
                    var domains = featureRegistry.getDomains();
                    info.domains = domains.join(', ');
                }
            }

            // Feature Validator warnings
            var featureValidator = LawAIApp.FeatureValidator || window.featureValidator;
            if (featureValidator && typeof featureValidator.getWarnings === 'function') {
                var warnings = featureValidator.getWarnings();
                info.warnings = warnings.length || 0;
            }

        } catch (err) {
            console.warn('Could not get feature info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 4: UI CONSTITUTION INFO
    // ============================================================

    _getUIInfo: function() {
        var info = {
            total: 0,
            healthy: 0,
            unhealthy: 0,
            unused: 0,
            warnings: 0,
            broken: 0,
            healthScore: 0,
            categories: 'N/A',
            brokenList: []
        };

        try {
            // UI Registry
            var uiRegistry = LawAIApp.UIRegistry || window.uiRegistry;
            if (uiRegistry && typeof uiRegistry.list === 'function') {
                var components = uiRegistry.list();
                info.total = components.length;
                
                // Count healthy/unhealthy
                var healthyCount = 0;
                var unhealthyCount = 0;
                var unusedCount = 0;
                var brokenList = [];
                
                for (var i = 0; i < components.length; i++) {
                    var c = components[i];
                    if (!c.used) unusedCount++;
                    if (c.healthy === false) {
                        unhealthyCount++;
                        brokenList.push(c.name || c.id);
                    } else {
                        healthyCount++;
                    }
                }
                
                info.healthy = healthyCount;
                info.unhealthy = unhealthyCount;
                info.unused = unusedCount;
                info.broken = brokenList.length;
                info.brokenList = brokenList;
                
                // Health score
                if (info.total > 0) {
                    info.healthScore = Math.round((healthyCount / info.total) * 100);
                }
                
                // Categories
                if (typeof uiRegistry.getCategories === 'function') {
                    var categories = uiRegistry.getCategories();
                    info.categories = categories.join(', ');
                }
            }

            // UI Validator warnings
            var uiValidator = LawAIApp.UIValidator || window.uiValidator;
            if (uiValidator && typeof uiValidator.getWarnings === 'function') {
                var warnings = uiValidator.getWarnings();
                info.warnings = warnings.length || 0;
            }

        } catch (err) {
            console.warn('Could not get UI info:', err);
        }

        return info;
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

// ============================================================
// KEYBOARD SHORTCUT - Ctrl+Shift+‘
// ============================================================

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        LawAIApp.Debug.DevPanel.toggle();
    }
});

// ============================================================
// ALIASES
// ============================================================

if (!LawAIApp.DevPanel) {
    LawAIApp.DevPanel = LawAIApp.Debug.DevPanel;
}

console.log('🛠️ DevPanel ready (Ctrl+Shift+‘)');
console.log('   ✅ Recovery R1 Part 1 - Architecture');
console.log('   ✅ Recovery R1 Part 2 - Runtime');
console.log('   ✅ Recovery R1 Part 3 - Feature Governance');
console.log('   ✅ Recovery R1 Part 4 - UI Constitution');
