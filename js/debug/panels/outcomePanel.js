// js/debug/panels/outcomePanel.js
// Part 55 — Outcome Panel (DevPanel Integration)
// Law AI Academy Developer Bible
//
// PURPOSE: Display Action → Outcome → Adaptation state in DevPanel
// DATA: Read-only from ActionTracker, OutcomeNormalizer, OutcomeLinker, AdaptationSignal

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.OutcomePanel) {
        console.warn('[OutcomePanel] Already registered, skipping...');
        return;
    }

    var OutcomePanel = {
        _container: null,
        _refreshInterval: null,
        _visible: false,

        // ============================================================
        // PANEL CONTRACT
        // ============================================================

        render: function(container) {
            this._container = container;
            this._visible = true;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                if (OutcomePanel._visible) {
                    OutcomePanel._refreshContent();
                }
            }, 5000);

            console.log('[OutcomePanel] ✅ Rendered');
        },

        refresh: function() {
            if (this._visible && this._container) {
                this._renderContent(this._container);
            }
        },

        destroy: function() {
            this._visible = false;
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
            }
            this._container = null;
            console.log('[OutcomePanel] 🧹 Destroyed');
        },

        isVisible: function() {
            return this._visible;
        },

        // ============================================================
        // RENDER
        // ============================================================

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        _renderContent: function(container) {
            var actionTracker = window.LawAIApp?.ActionTracker;
            var outcomeNormalizer = window.LawAIApp?.OutcomeNormalizer;
            var outcomeLinker = window.LawAIApp?.OutcomeLinker;
            var adaptationSignal = window.LawAIApp?.AdaptationSignal;

            var actionStats = actionTracker ? actionTracker.getStats() : { total: 0, byType: {} };
            var linkerStats = outcomeLinker ? outcomeLinker.getStats() : { totalLinks: 0 };
            var signalStats = adaptationSignal ? adaptationSignal.getStats() : { total: 0 };
            var actionHistory = actionTracker ? actionTracker.getHistory(5) : [];
            var linkHistory = outcomeLinker ? outcomeLinker.getLinks(5) : [];

            var html = this._buildHTML(actionStats, linkerStats, signalStats, actionHistory, linkHistory);
            container.innerHTML = html;
        },

        // ============================================================
        // HTML BUILDERS
        // ============================================================

        _buildHTML: function(actionStats, linkerStats, signalStats, actionHistory, linkHistory) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔄 Action → Outcome → Adaptation</span>
                        <span style="font-size:9px;color:${actionStats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${actionStats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Actions', actionStats.total || 0, '#4a9eff')}
                        ${this._statCard('Links', linkerStats.totalLinks || 0, '#8b5cf6')}
                        ${this._statCard('Signals', signalStats.total || 0, '#22c55e')}
                        ${this._statCard('Actionable', signalStats.actionable || 0, '#f59e0b')}
                    </div>

                    <!-- Action Types -->
                    ${Object.keys(actionStats.byType || {}).length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Action Types</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                                ${Object.keys(actionStats.byType).map(function(type) {
                                    return `<span style="font-size:8px;background:rgba(255,255,255,0.04);padding:1px 8px;border-radius:8px;color:#94a3b8;">${type}: ${actionStats.byType[type]}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Recent Actions -->
                    ${actionHistory.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Actions</div>
                            ${actionHistory.slice(0, 3).map(function(a) {
                                var time = new Date(a.timestamp).toLocaleTimeString();
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${a.type}: ${a.target || 'unknown'}</span>
                                    <span style="color:#475569;">${time}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Adaptation Signals -->
                    ${signalStats.total > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="display:flex;justify-content:space-between;font-size:8px;color:#475569;">
                                <span>📡 Signals</span>
                                <span>L1: ${signalStats.byLevel?.[1] || 0} | L2: ${signalStats.byLevel?.[2] || 0} | L3: ${signalStats.byLevel?.[3] || 0} | L4: ${signalStats.byLevel?.[4] || 0}</span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;

            return html;
        },

        _statCard: function(label, value, color) {
            return `
                <div style="text-align:center;padding:4px;background:rgba(255,255,255,0.02);border-radius:4px;">
                    <div style="font-size:14px;font-weight:700;color:${color};">${value}</div>
                    <div style="font-size:7px;color:#475569;text-transform:uppercase;">${label}</div>
                </div>
            `;
        },

        _getErrorHTML: function(message) {
            return `
                <div style="margin-bottom:8px;padding:8px 12px;background:rgba(239,68,68,0.04);border-radius:8px;border-left:2px solid #ef4444;">
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;">⚠️ Outcome</div>
                    <div style="font-size:9px;color:#ef4444;margin-top:4px;">${message}</div>
                </div>
            `;
        }
    };

    // ============================================================
    // REGISTER WITH DEVPANEL
    // ============================================================

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.OutcomePanel = OutcomePanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'outcome',
                OutcomePanel,
                'outcome-panel-placeholder',
                550
            );
            console.log('[OutcomePanel] ✅ Registered with DevPanel');
        } else {
            console.log('[OutcomePanel] DevPanel not ready, will register later');
        }
    }, 150);

    console.log('[OutcomePanel] Part 55 loaded ✅');

})();
