// js/debug/panels/agencyPanel.js
// Part 64 — Agency Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.AgencyPanel) {
        console.warn('[AgencyPanel] Already registered, skipping...');
        return;
    }

    var AgencyPanel = {
        _container: null,
        _refreshInterval: null,
        _visible: false,

        render: function(container) {
            this._container = container;
            this._visible = true;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                if (AgencyPanel._visible) {
                    AgencyPanel._refreshContent();
                }
            }, 8000);

            console.log('[AgencyPanel] ✅ Rendered');
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
            console.log('[AgencyPanel] 🧹 Destroyed');
        },

        isVisible: function() {
            return this._visible;
        },

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        _renderContent: function(container) {
            var agency = window.LawAIApp?.AgencySupport;
            var de = window.LawAIApp?.DecisionExperience;

            var status = agency ? agency.getStatus() : { initialized: false };
            var conditions = agency ? agency.CONDITIONS : {};
            var quality = agency ? agency.QUALITY : {};

            // 获取最近决策
            var recentDecisions = [];
            if (de && typeof de.getHistory === 'function') {
                try {
                    recentDecisions = de.getHistory(5);
                } catch (e) {
                    console.warn('[AgencyPanel] Decision history error:', e);
                }
            }

            var html = this._buildHTML(status, conditions, quality, recentDecisions, agency);
            container.innerHTML = html;
        },

        _buildHTML: function(status, conditions, quality, recentDecisions, agency) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(236,72,153,0.04);border-radius:8px;border-left:2px solid #ec4899;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎯 Agency Capability</span>
                        <span style="font-size:9px;color:${status.initialized ? '#4ade80' : '#64748b'};">
                            ${status.initialized ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Agency Conditions -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        <div style="text-align:center;padding:4px;background:rgba(74,158,255,0.04);border-radius:4px;">
                            <div style="font-size:14px;font-weight:700;color:#4a9eff;">○</div>
                            <div style="font-size:7px;color:#475569;text-transform:uppercase;">Opportunity</div>
                        </div>
                        <div style="text-align:center;padding:4px;background:rgba(139,92,246,0.04);border-radius:4px;">
                            <div style="font-size:14px;font-weight:700;color:#8b5cf6;">○</div>
                            <div style="font-size:7px;color:#475569;text-transform:uppercase;">Capability</div>
                        </div>
                        <div style="text-align:center;padding:4px;background:rgba(34,197,94,0.04);border-radius:4px;">
                            <div style="font-size:14px;font-weight:700;color:#22c55e;">○</div>
                            <div style="font-size:7px;color:#475569;text-transform:uppercase;">Action</div>
                        </div>
                        <div style="text-align:center;padding:4px;background:rgba(251,146,60,0.04);border-radius:4px;">
                            <div style="font-size:14px;font-weight:700;color:#fb923c;">○</div>
                            <div style="font-size:7px;color:#475569;text-transform:uppercase;">Reflection</div>
                        </div>
                    </div>

                    <!-- Conditions Legend -->
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:7px;color:#475569;">
                        <span>Four conditions of agency: Opportunity + Capability + Action + Reflection</span>
                    </div>

                    <!-- Decision Quality -->
                    ${Object.keys(quality).length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Decision Quality</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                                ${Object.keys(quality).filter(function(k) { return k !== 'UNKNOWN'; }).map(function(q) {
                                    var label = quality[q] || q;
                                    var colors = {
                                        'WELL_CONSIDERED': '#4ade80',
                                        'POORLY_CONSIDERED': '#f87171',
                                        'CONTEXTUAL': '#fb923c'
                                    };
                                    var color = colors[q] || '#64748b';
                                    return `<span style="font-size:7px;background:${color}20;color:${color};padding:1px 6px;border-radius:4px;">${label}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Recent Decisions -->
                    ${recentDecisions.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Decisions (${recentDecisions.length})</div>
                            ${recentDecisions.slice(0, 3).map(function(d) {
                                var state = d.state || 'SELECTED';
                                var color = state === 'SELECTED' ? '#4ade80' : 
                                           state === 'DISMISSED' ? '#64748b' : 
                                           state === 'SKIPPED' ? '#f59e0b' : '#94a3b8';
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${d.optionId || 'decision'}</span>
                                    <span style="color:${color};">${state}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Agency Status -->
                    <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                        <div style="display:flex;justify-content:space-between;font-size:8px;color:#475569;">
                            <span>⚡ Agency</span>
                            <span style="color:${status.initialized ? '#4ade80' : '#64748b'};">${status.initialized ? 'Enabled' : 'Not initialized'}</span>
                        </div>
                    </div>

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;

            return html;
        }
    };

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.AgencyPanel = AgencyPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'agency',
                AgencyPanel,
                'agency-panel-placeholder',
                950
            );
            console.log('[AgencyPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[AgencyPanel] Part 64 loaded ✅');

})();
