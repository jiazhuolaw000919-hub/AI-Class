// js/debug/panels/adaptationPanel.js
// Part 56 — Adaptation Panel (DevPanel Integration)
// Law AI Academy Developer Bible
//
// PURPOSE: Display adaptation transparency in DevPanel
// DATA: Read-only from AdaptationRecord, AdaptationExplainer, AdaptationGovernance

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.AdaptationPanel) {
        console.warn('[AdaptationPanel] Already registered, skipping...');
        return;
    }

    var AdaptationPanel = {
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
                if (AdaptationPanel._visible) {
                    AdaptationPanel._refreshContent();
                }
            }, 5000);

            console.log('[AdaptationPanel] ✅ Rendered');
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
            console.log('[AdaptationPanel] 🧹 Destroyed');
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
            var record = window.LawAIApp?.AdaptationRecord;
            var explainer = window.LawAIApp?.AdaptationExplainer;
            var governance = window.LawAIApp?.AdaptationGovernance;

            var stats = record ? record.getStats() : { total: 0 };
            var records = record ? record.getRecords(5) : [];
            var history = record ? record.getLearnerHistory(5) : [];

            var html = this._buildHTML(stats, records, history, record, explainer, governance);
            container.innerHTML = html;
        },

        // ============================================================
        // HTML BUILDERS
        // ============================================================

        _buildHTML: function(stats, records, history, record, explainer, governance) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏛️ Adaptation Governance</span>
                        <span style="font-size:9px;color:${stats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Records', stats.total || 0, '#8b5cf6')}
                        ${this._statCard('Overridden', stats.overridden || 0, '#f59e0b')}
                        ${this._statCard('Dismissed', stats.dismissed || 0, '#64748b')}
                        ${this._statCard('With Outcome', stats.withOutcome || 0, '#22c55e')}
                    </div>

                    <!-- Levels -->
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                        <span>L0: ${stats.byLevel?.[0] || 0}</span>
                        <span>L1: ${stats.byLevel?.[1] || 0}</span>
                        <span>L2: ${stats.byLevel?.[2] || 0}</span>
                        <span>L3: ${stats.byLevel?.[3] || 0}</span>
                        <span style="color:#ef4444;">L4: ${stats.byLevel?.[4] || 0}</span>
                    </div>

                    <!-- Recent Records -->
                    ${records.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Adaptations</div>
                            ${records.slice(0, 3).map(function(r) {
                                var time = new Date(r.timestamp).toLocaleTimeString();
                                var statusColor = r.status === 'APPLIED' ? '#4ade80' :
                                                  r.status === 'OVERRIDDEN' ? '#f59e0b' :
                                                  r.status === 'DISMISSED' ? '#64748b' : '#94a3b8';
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${r.trigger || 'unknown'}</span>
                                    <span style="color:${statusColor};">${r.status || 'APPLIED'}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Learner History (if available) -->
                    ${history.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Learner History</div>
                            ${history.slice(0, 2).map(function(h) {
                                return `<div style="font-size:8px;color:#64748b;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    ${h.reason || 'Adaptation applied'}
                                    ${h.override ? ' (overridden)' : ''}
                                    ${h.dismissed ? ' (dismissed)' : ''}
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Governance Status -->
                    ${governance ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="display:flex;justify-content:space-between;font-size:8px;color:#475569;">
                                <span>⚖️ Governance</span>
                                <span style="color:#4ade80;">✅ Active</span>
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
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;">⚠️ Adaptation</div>
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

    window.LawAIApp.Debug.Panels.AdaptationPanel = AdaptationPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'adaptation',
                AdaptationPanel,
                'adaptation-panel-placeholder',
                600
            );
            console.log('[AdaptationPanel] ✅ Registered with DevPanel');
        } else {
            console.log('[AdaptationPanel] DevPanel not ready, will register later');
        }
    }, 150);

    console.log('[AdaptationPanel] Part 56 loaded ✅');

})();
