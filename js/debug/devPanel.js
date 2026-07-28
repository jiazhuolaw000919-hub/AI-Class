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
                <!-- 🆕 Explorer Button -->
                <button onclick="LawAIApp.Debug.DevPanel._openExplorer()" 
                        style="background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.2);border-radius:6px;color:#4a9eff;font-size:11px;padding:2px 10px;cursor:pointer;"
                        title="Open Runtime Explorer">
                    🔍 Explorer
                </button>
                <span style="font-size:10px;color:#475569;">v${version}</span>
                <button onclick="LawAIApp.Debug.DevPanel.hide()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button>
            </div>
        </div>

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
