// js/debug/panels/journeyPanel.js
// Part 63 — Journey Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.JourneyPanel) {
        console.warn('[JourneyPanel] Already registered, skipping...');
        return;
    }

    var JourneyPanel = {
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
                if (JourneyPanel._visible) {
                    JourneyPanel._refreshContent();
                }
            }, 8000);

            console.log('[JourneyPanel] ✅ Rendered');
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
            console.log('[JourneyPanel] 🧹 Destroyed');
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
            var orchestrator = window.LawAIApp?.JourneyOrchestrator;
            var stats = orchestrator ? orchestrator.getStats() : { componentCount: 0 };
            var status = orchestrator ? orchestrator.getStatus() : { components: [] };
            var authorityMap = orchestrator ? orchestrator.getAuthorityMap() : {};

            var html = this._buildHTML(stats, status, authorityMap);
            container.innerHTML = html;
        },

        _buildHTML: function(stats, status, authorityMap) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🚀 Journey Orchestration</span>
                        <span style="font-size:9px;color:${stats.componentCount > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.componentCount > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Components', stats.componentCount || 0, '#4a9eff')}
                        ${this._statCard('Support', status.supportLevel || 'NONE', '#f59e0b')}
                        ${this._statCard('Journey', stats.journeyHistory || 0, '#8b5cf6')}
                        ${this._statCard('Version', stats.version || '1.0.0', '#64748b')}
                    </div>

                    <!-- Components -->
                    ${status.components && status.components.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Components (${status.components.length})</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                                ${status.components.slice(0, 8).map(function(c) {
                                    return `<span style="font-size:7px;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;color:#94a3b8;">${c}</span>`;
                                }).join('')}
                                ${status.components.length > 8 ? `<span style="font-size:7px;color:#475569;">+${status.components.length - 8}</span>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Authority Map -->
                    ${Object.keys(authorityMap).length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Authority Map</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:7px;">
                                ${Object.keys(authorityMap).slice(0, 6).map(function(key) {
                                    var color = authorityMap[key].canOverride ? '#f59e0b' : '#4ade80';
                                    return `<span style="background:${color}20;color:${color};padding:1px 6px;border-radius:4px;">${key}: ${authorityMap[key].authority}</span>`;
                                }).join('')}
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
        }
    };

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.JourneyPanel = JourneyPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'journey',
                JourneyPanel,
                'journey-panel-placeholder',
                900
            );
            console.log('[JourneyPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[JourneyPanel] Part 63 loaded ✅');

})();
