// ============================================================
// devPanel.js
// Part 49.8.7 — DevPanel Core Final Cleanup (FIXED)
// Version: v4.9.8.7
// Status: Architecture Completion
// Module: Developer Experience Layer — Core
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

/**
 * DevPanel Core
 * 
 * 职责：
 * - Initialization
 * - Panel Registry Loading
 * - Lifecycle Management (show/hide/toggle)
 * - Global Refresh
 * - Global Destroy
 */
LawAIApp.Debug.DevPanel = {
    _panel: null,
    _isOpen: false,
    _registeredPanels: [],
    _initialized: false,
    _shortcutBound: false,
    _boundKeyHandler: null,

    // ============================================================
    // PANEL REGISTRY
    // ============================================================

    registerPanel: function(id, panel, placeholderId, delay) {
        this._registeredPanels.push({
            id: id,
            panel: panel,
            placeholderId: placeholderId,
            delay: delay || 50,
            rendered: false
        });
        console.log('[DevPanel] Registered panel: ' + id);
    },

    _registerAllPanels: function() {
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.RuntimePanel) {
            this.registerPanel('runtime', LawAIApp.Debug.Panels.RuntimePanel, 'runtime-panel-placeholder', 50);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.PerformancePanel) {
            this.registerPanel('performance', LawAIApp.Debug.Panels.PerformancePanel, 'performance-panel-placeholder', 50);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.EventPanel) {
            this.registerPanel('event', LawAIApp.Debug.Panels.EventPanel, 'event-panel-placeholder', 100);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.TracePanel) {
            this.registerPanel('trace', LawAIApp.Debug.Panels.TracePanel, 'trace-panel-placeholder', 150);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.StatePanel) {
            this.registerPanel('state', LawAIApp.Debug.Panels.StatePanel, 'state-panel-placeholder', 200);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.CognitivePanel) {
            this.registerPanel('cognitive', LawAIApp.Debug.Panels.CognitivePanel, 'cognitive-panel-placeholder', 250);
        }
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.GovernancePanel) {
            this.registerPanel('governance', LawAIApp.Debug.Panels.GovernancePanel, 'governance-panel-placeholder', 300);
        }

        // ── Part 49.9.6: ExplorerPanel ──
        if (LawAIApp.Debug.Panels && LawAIApp.Debug.Panels.ExplorerPanel) {
            this.registerPanel('explorer', LawAIApp.Debug.Panels.ExplorerPanel, 'explorer-panel-placeholder', 325);
        }
    },

    // ============================================================
    // CORE LIFECYCLE
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._registerAllPanels();
        this._setupKeyboardShortcut();
        this._initialized = true;
        console.log('🛠️ DevPanel Core initialized');
        console.log('   📋 Registered panels:', this._registeredPanels.map(function(p) { return p.id; }).join(', '));
    },

    toggle: function() {
        if (this._isOpen) {
            this.hide();
        } else {
            this.show();
        }
    },

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

        this._panel.innerHTML = this._buildHTML();
        document.body.appendChild(this._panel);
        this._isOpen = true;

        this._renderAllPanels();
        this._renderLegacyPanels();

        // ── 绑定 Import Input ──
        this._bindImportInput();
    },

    hide: function() {
        this._destroyAllPanels();
        if (this._panel) {
            this._panel.remove();
            this._panel = null;
        }
        this._isOpen = false;
    },

    refresh: function() {
        if (!this._isOpen) return;

        var errors = [];
        for (var i = 0; i < this._registeredPanels.length; i++) {
            var entry = this._registeredPanels[i];
            try {
                if (entry.panel && typeof entry.panel.refresh === 'function') {
                    entry.panel.refresh();
                }
            } catch (err) {
                errors.push(entry.id + ': ' + err.message);
                console.warn('[DevPanel] Refresh error on ' + entry.id + ':', err);
            }
        }
        this._refreshLegacyPanels();

        if (errors.length > 0) {
            console.warn('[DevPanel] Refresh completed with ' + errors.length + ' error(s):', errors);
        }
    },

    destroy: function() {
        this._destroyAllPanels();
        this._registeredPanels = [];
        this._initialized = false;
        this._removeKeyboardShortcut();
        console.log('🛠️ DevPanel destroyed');
    },

    // ============================================================
    // PANEL RENDER ENGINE
    // ============================================================

    _renderAllPanels: function() {
        var self = this;
        for (var i = 0; i < this._registeredPanels.length; i++) {
            var entry = this._registeredPanels[i];
            var delay = entry.delay || 50;

            (function(e) {
                setTimeout(function() {
                    var container = document.getElementById(e.placeholderId);
                    if (!container) {
                        console.warn('[DevPanel] Placeholder not found: ' + e.placeholderId);
                        return;
                    }

                    try {
                        if (e.panel && typeof e.panel.render === 'function') {
                            e.panel.render(container);
                            e.rendered = true;
                        } else {
                            container.innerHTML = self._getFallbackHTML(e.id);
                        }
                    } catch (err) {
                        console.error('[DevPanel] Error rendering ' + e.id + ':', err);
                        container.innerHTML = self._getErrorHTML(e.id, err.message);
                    }
                }, delay);
            })(entry);
        }
    },

        // ============================================================
    // EXPLORER METHODS
    // ============================================================

    /**
     * 打开 Runtime Explorer 浮窗
     * @private
     */
    _openExplorer: function() {
        console.log('🔍 Opening Runtime Explorer from DevPanel...');

        var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        if (!explorer || !explorer.isInitialized || !explorer.isInitialized()) {
            alert('⚠️ Runtime Explorer not available. Please check console for errors.');
            return;
        }

        var tree = explorer.getTree ? explorer.getTree() : null;
        var stats = explorer.getStats ? explorer.getStats() : null;
        var content = this._buildExplorerContent(tree, stats);
        this._createExplorerPopup(content);
    },

    /**
     * 构建 Explorer 内容
     * @private
     */
    _buildExplorerContent: function(tree, stats) {
        var html = '';
        html += '<div style="max-width:640px;max-height:85vh;overflow-y:auto;padding:4px;">';

        // Header
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;margin-bottom:10px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#4a9eff;">🔍 Runtime Explorer</span>';
        html += '<span style="font-size:10px;color:#475569;">v4.9.9.5</span>';
        html += '</div>';

        // Stats
        if (stats) {
            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">';
            html += '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#4a9eff;">' + stats.total + '</div><div style="font-size:9px;color:#475569;">Components</div></div>';
            html += '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#22c55e;">' + (stats.byStatus?.active || 0) + '</div><div style="font-size:9px;color:#475569;">Active</div></div>';
            html += '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#8b5cf6;">' + Object.keys(stats.byType || {}).length + '</div><div style="font-size:9px;color:#475569;">Types</div></div>';
            html += '</div>';
        }

        // Tree
        if (tree) {
            html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">📂 Runtime Structure</div>';
            html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:9px;font-family:monospace;max-height:300px;overflow-y:auto;white-space:pre;">';
            html += this._renderTree(tree, 0);
            html += '</div>';
        }

        // Type summary
        if (stats) {
            html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding:6px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:8px;color:#475569;">';
            for (var type in stats.byType) {
                if (stats.byType.hasOwnProperty(type)) {
                    html += '<span style="padding:2px 8px;background:rgba(255,255,255,0.04);border-radius:4px;">' + type + ': ' + stats.byType[type] + '</span>';
                }
            }
            html += '</div>';
        }

        // Actions
        html += '<div style="display:flex;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);flex-wrap:wrap;">';
        html += '<button onclick="LawAIApp.Runtime.Snapshot && LawAIApp.Runtime.Snapshot.export({format:\'json\',download:true})" style="padding:4px 12px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:6px;color:#4a9eff;font-size:10px;cursor:pointer;">📸 Export JSON</button>';
        html += '<button onclick="LawAIApp.Runtime.Snapshot && LawAIApp.Runtime.Snapshot.export({format:\'markdown\',download:true})" style="padding:4px 12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:6px;color:#8b5cf6;font-size:10px;cursor:pointer;">📊 Export MD</button>';
        html += '<button onclick="LawAIApp.Runtime.Snapshot && LawAIApp.Runtime.Snapshot.build && alert(\'✅ Snapshot built!\')" style="padding:4px 12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.15);border-radius:6px;color:#22c55e;font-size:10px;cursor:pointer;">📸 Snapshot</button>';
        html += '<button onclick="LawAIApp.Debug.DevPanel._closeExplorerPopup()" style="padding:4px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;font-size:10px;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * 渲染 Tree
     * @private
     */
    _renderTree: function(node, depth) {
        var indent = '  '.repeat(depth);
        var html = '';
        if (!node) return '';

        if (node.label) {
            var icon = node.type === 'root' ? '📁' : (node.type === 'collection' ? '📂' : '📄');
            var color = node.type === 'root' ? '#4a9eff' : (node.type === 'collection' ? '#f59e0b' : '#94a3b8');
            html += indent + '<span style="color:' + color + ';">' + icon + ' ' + node.label + '</span>';
            if (node.id && node.id !== node.label) {
                html += ' <span style="color:#475569;font-size:8px;">(' + node.id + ')</span>';
            }
            html += '\n';
        }

        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                html += this._renderTree(node.children[i], depth + 1);
            }
        }
        return html;
    },

    /**
     * 创建 Explorer 浮窗
     * @private
     */
    _createExplorerPopup: function(content) {
        this._closeExplorerPopup();

        var overlay = document.createElement('div');
        overlay.id = 'explorer-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;

        var popup = document.createElement('div');
        popup.id = 'explorer-popup';
        popup.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 20px;
            max-width: 640px;
            width: 90%;
            max-height: 85vh;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
        `;
        popup.innerHTML = content;

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                LawAIApp.Debug.DevPanel._closeExplorerPopup();
            }
        });

        var escHandler = function(e) {
            if (e.key === 'Escape') {
                LawAIApp.Debug.DevPanel._closeExplorerPopup();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        this._popupOverlay = overlay;
        this._popup = popup;
        this._popupEscHandler = escHandler;
    },

    /**
     * 关闭 Explorer 浮窗
     * @private
     */
    _closeExplorerPopup: function() {
        if (this._popupOverlay) {
            this._popupOverlay.remove();
            this._popupOverlay = null;
            this._popup = null;
        }
        if (this._popupEscHandler) {
            document.removeEventListener('keydown', this._popupEscHandler);
            this._popupEscHandler = null;
        }
    },

    _destroyAllPanels: function() {
        for (var i = 0; i < this._registeredPanels.length; i++) {
            var entry = this._registeredPanels[i];
            try {
                if (entry.panel && typeof entry.panel.destroy === 'function') {
                    entry.panel.destroy();
                }
            } catch (err) {
                console.warn('[DevPanel] Destroy error on ' + entry.id + ':', err);
            }
        }
    },

    _getFallbackHTML: function(id) {
        var labels = {
            'runtime': '⚡ Runtime',
            'performance': '⚡ Runtime Performance',
            'metrics': '📈 Runtime Metrics',
            'event': '🧠 Runtime Events',
            'trace': '🛰 Runtime Tracing',
            'state': '🔄 State Dashboard',
            'knowledge': '🧠 Knowledge Graph',
            'cognitive': '🧠 Cognitive Engine',
            'governance': '🏛️ Governance Layer'
        };
    
    var label = labels[id] || id;
    
        return [
            '<div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;">',
                '<div style="display:flex;justify-content:space-between;align-items:center;">',
                    '<span style="font-size:11px;color:#94a3b8;font-weight:600;">' + label + '</span>',
                    '<span style="font-size:10px;color:#f59e0b;">⏳ Loading...</span>',
                '</div>',
                '<div style="font-size:9px;color:#475569;margin-top:4px;">',
                    'Panel not available',
                '</div>',
            '</div>'
        ].join('');
    },

    _getErrorHTML: function(id, message) {
        return `
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(239,68,68,0.04);border-radius:8px;border-left:2px solid #ef4444;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚠️ ${id}</span>
                    <span style="font-size:10px;color:#ef4444;">Error</span>
                </div>
                <div style="font-size:9px;color:#ef4444;margin-top:4px;">
                    ${message || 'Render failed'}
                </div>
            </div>
        `;
    },
    
    // ============================================================
    // LEGACY PANELS
    // ============================================================

    _renderLegacyPanels: function() {
        setTimeout(function() {
            var aiContainer = document.getElementById('dev-panel-ai-section');
            if (aiContainer && LawAIApp.Debug && LawAIApp.Debug.DevPanelAI) {
                try {
                    LawAIApp.Debug.DevPanelAI.render(aiContainer);
                } catch (err) {
                    console.warn('[DevPanel] AI Assistant render error:', err);
                }
            }
        }, 100);

        setTimeout(function() {
            var kgContainer = document.getElementById('dev-panel-kg-section');
            if (kgContainer && LawAIApp.Debug && LawAIApp.Debug.DevPanelKnowledgeGraph) {
                try {
                    LawAIApp.Debug.DevPanelKnowledgeGraph.render(kgContainer);
                } catch (err) {
                    console.warn('[DevPanel] Knowledge Graph render error:', err);
                }
            }
        }, 200);
    },

    _refreshLegacyPanels: function() {
        var aiContainer = document.getElementById('dev-panel-ai-section');
        if (aiContainer && LawAIApp.Debug && LawAIApp.Debug.DevPanelAI) {
            try {
                if (typeof LawAIApp.Debug.DevPanelAI.refresh === 'function') {
                    LawAIApp.Debug.DevPanelAI.refresh();
                }
            } catch (err) { /* ignore */ }
        }

        var kgContainer = document.getElementById('dev-panel-kg-section');
        if (kgContainer && LawAIApp.Debug && LawAIApp.Debug.DevPanelKnowledgeGraph) {
            try {
                if (typeof LawAIApp.Debug.DevPanelKnowledgeGraph.refresh === 'function') {
                    LawAIApp.Debug.DevPanelKnowledgeGraph.refresh();
                }
            } catch (err) { /* ignore */ }
        }
    },

    // ============================================================
    // IMPORT BINDING
    // ============================================================

    _bindImportInput: function() {
        var importInput = document.getElementById('dev-import-input');
        if (!importInput) return;

        importInput.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;

            if (window.LawAIApp?.Debug?.Actions?.ImportBackup) {
                window.LawAIApp.Debug.Actions.ImportBackup.import(file);
            } else if (window.LawAIApp?.FactoryReset?.importBackup) {
                window.LawAIApp.FactoryReset.importBackup(file);
            } else {
                // Fallback import
                var reader = new FileReader();
                reader.onload = function(ev) {
                    try {
                        var backup = JSON.parse(ev.target.result);
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
            importInput.value = '';
        };
    },

    // ============================================================
    // UI BUILDING
    // ============================================================

    _buildHTML: function() {
    var version = (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) || '4.0.17';

    return `
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">
            <span style="font-size:16px;font-weight:700;color:#4a9eff;">🛠️ Dev Panel</span>
            <div style="display:flex;align-items:center;gap:8px;">
                <!-- 🔥 Explorer Button -->
                <button onclick="LawAIApp.Debug.DevPanel._openExplorer()" 
                        style="background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.2);border-radius:6px;color:#4a9eff;font-size:11px;padding:2px 10px;cursor:pointer;"
                        title="Open Runtime Explorer">
                    🔍 Explorer
                </button>
                <span style="font-size:10px;color:#475569;">v${version}</span>
                <button onclick="LawAIApp.Debug.DevPanel.hide()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button>
            </div>
        </div>

        <!-- ========================================================== -->
        <!-- PANEL PLACEHOLDERS — Click any panel for full details -->
        <!-- ========================================================== -->

        <div id="runtime-panel-placeholder"></div>
        <div id="performance-panel-placeholder"></div>
        <div id="metrics-panel-placeholder"></div>
        <div id="trace-panel-placeholder"></div>
        <div id="event-panel-placeholder"></div>
        <div id="state-panel-placeholder"></div>
        <div id="knowledge-panel-placeholder"></div>
        <div id="cognitive-panel-placeholder"></div>
        <div id="governance-panel-placeholder"></div>
        <div id="explorer-panel-placeholder"></div>

        <!-- ========================================================== -->
        <!-- LEGACY PANEL PLACEHOLDERS -->
        <!-- ========================================================== -->

        <div id="dev-panel-ai-section" style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;"></div>
        <div id="dev-panel-kg-section" style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;"></div>

        <!-- ========================================================== -->
        <!-- DEBUG ACTIONS -->
        <!-- ========================================================== -->

        <div id="debug-actions-container" style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;"></div>

        <input type="file" id="dev-import-input" accept=".json" style="display:none">

        <!-- ========================================================== -->
        <!-- FOOTER -->
        <!-- ========================================================== -->

        <div style="font-size:10px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:10px;margin-top:12px;">
            Press Ctrl+Shift+L to close
        </div>
    `;
},

        <!-- Panel Placeholders -->
        <div id="runtime-panel-placeholder"></div>
        <div id="performance-panel-placeholder"></div>
        <div id="metrics-panel-placeholder"></div>
        <div id="trace-panel-placeholder"></div>
        <div id="event-panel-placeholder"></div>
        <div id="state-panel-placeholder"></div>
        <div id="knowledge-panel-placeholder"></div>
        <div id="cognitive-panel-placeholder"></div>
        <div id="governance-panel-placeholder"></div>
        <div id="explorer-panel-placeholder"></div>

        <!-- Legacy Panel Placeholders -->
        <div id="dev-panel-ai-section" style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;"></div>
        <div id="dev-panel-kg-section" style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;"></div>

        <!-- Debug Actions -->
        <div id="debug-actions-container" style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;"></div>

        <input type="file" id="dev-import-input" accept=".json" style="display:none">

        <div style="font-size:10px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:10px;margin-top:12px;">
            Press Ctrl+Shift+L to close
        </div>
    `;
},

    // ============================================================
    // KEYBOARD SHORTCUT
    // ============================================================

    _setupKeyboardShortcut: function() {
        if (this._shortcutBound) return;
        this._boundKeyHandler = this._handleKeyDown.bind(this);
        document.addEventListener('keydown', this._boundKeyHandler);
        this._shortcutBound = true;
    },

    _handleKeyDown: function(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
            e.preventDefault();
            this.toggle();
        }
    },

    _removeKeyboardShortcut: function() {
        if (this._boundKeyHandler) {
            document.removeEventListener('keydown', this._boundKeyHandler);
            this._boundKeyHandler = null;
            this._shortcutBound = false;
        }
    }
};

// ============================================================
// ALIASES & AUTO-INIT
// ============================================================

if (!LawAIApp.DevPanel) {
    LawAIApp.DevPanel = LawAIApp.Debug.DevPanel;
}

LawAIApp.Debug.DevPanel.init();

console.log('🛠️ DevPanel Core ready (Ctrl+Shift+L)');
console.log('   ✅ Part 49.8.7 — DevPanel Core Final Cleanup');
console.log('   📋 Architecture: Core + Panel Registry');
console.log('   📦 Registered panels:', LawAIApp.Debug.DevPanel._registeredPanels.map(function(p) { return p.id; }).join(', '));
