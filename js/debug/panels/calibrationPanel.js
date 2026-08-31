// js/debug/panels/calibrationPanel.js
// Part 62 — Calibration Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.CalibrationPanel) {
        console.warn('[CalibrationPanel] Already registered, skipping...');
        return;
    }

    var CalibrationPanel = {
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
                if (CalibrationPanel._visible) {
                    CalibrationPanel._refreshContent();
                }
            }, 10000);

            console.log('[CalibrationPanel] ✅ Rendered');
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
            console.log('[CalibrationPanel] 🧹 Destroyed');
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
            var observer = window.LawAIApp?.CalibrationObserver;
            var recommender = window.LawAIApp?.CalibrationRecommender;
            var model = window.LawAIApp?.CalibrationModel;

            var stats = observer ? observer.getStats() : { total: 0 };
            var recent = observer ? observer._observations.slice(-5).reverse() : [];
            var insights = observer ? observer.getRecentInsights({}, 3) : [];
            var recommendations = recommender ? recommender.getRecommendations({}, { limit: 2 }) : [];

            var html = this._buildHTML(stats, recent, insights, recommendations, model);
            container.innerHTML = html;
        },

        _buildHTML: function(stats, recent, insights, recommendations, model) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(251,146,60,0.04);border-radius:8px;border-left:2px solid #fb923c;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎯 Calibration</span>
                        <span style="font-size:9px;color:${stats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Observations', stats.total || 0, '#fb923c')}
                        ${this._statCard('Calibrated', stats.byCalibrationState?.CALIBRATED || 0, '#4ade80')}
                        ${this._statCard('Overconfident', stats.byCalibrationState?.OVERCONFIDENT || 0, '#f87171')}
                        ${this._statCard('Underconfident', stats.byCalibrationState?.UNDERCONFIDENT || 0, '#60a5fa')}
                    </div>

                    <!-- Calibration States -->
                    ${Object.keys(stats.byCalibrationState || {}).length > 0 ? `
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                            ${Object.keys(stats.byCalibrationState).map(function(state) {
                                var color = state === 'CALIBRATED' ? '#4ade80' : 
                                           state === 'OVERCONFIDENT' ? '#f87171' : 
                                           state === 'UNDERCONFIDENT' ? '#60a5fa' : '#94a3b8';
                                var label = model ? model.getStateLabel(state) : state;
                                return `<span style="background:${color}20;color:${color};padding:1px 8px;border-radius:8px;">${label}: ${stats.byCalibrationState[state]}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Recent Observations -->
                    ${recent.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Calibration</div>
                            ${recent.slice(0, 3).map(function(o) {
                                var stateLabel = model ? model.getStateLabel(o.calibrationState) : o.calibrationState;
                                var color = o.calibrationState === 'CALIBRATED' ? '#4ade80' : 
                                           o.calibrationState === 'OVERCONFIDENT' ? '#f87171' : 
                                           o.calibrationState === 'UNDERCONFIDENT' ? '#60a5fa' : '#94a3b8';
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${o.conceptId || 'unknown'}</span>
                                    <span style="color:${color};">${stateLabel}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Insights -->
                    ${insights.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Insights</div>
                            ${insights.slice(0, 2).map(function(i) {
                                return `<div style="font-size:8px;color:#94a3b8;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    ${i.label}: ${i.description}
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Recommendations -->
                    ${recommendations.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recommendations (${recommendations.length})</div>
                            ${recommendations.map(function(r) {
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${r.title || 'recommendation'}</span>
                                    <span style="color:#fb923c;">${r.isOptional ? 'optional' : 'suggested'}</span>
                                </div>`;
                            }).join('')}
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

    window.LawAIApp.Debug.Panels.CalibrationPanel = CalibrationPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'calibration',
                CalibrationPanel,
                'calibration-panel-placeholder',
                850
            );
            console.log('[CalibrationPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[CalibrationPanel] Part 62 loaded ✅');

})();
