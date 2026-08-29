// Part 61 — Transfer Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.TransferPanel) {
        console.warn('[TransferPanel] Already registered, skipping...');
        return;
    }

    var TransferPanel = {
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
                if (TransferPanel._visible) {
                    TransferPanel._refreshContent();
                }
            }, 10000);

            console.log('[TransferPanel] ✅ Rendered');
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
            console.log('[TransferPanel] 🧹 Destroyed');
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
            var observer = window.LawAIApp?.TransferObserver;
            var recommender = window.LawAIApp?.TransferRecommender;
            var model = window.LawAIApp?.TransferModel;

            var stats = observer ? observer.getStats() : { total: 0 };
            var observations = observer ? observer.getRecentTransfers(5) : [];
            var recommendations = recommender ? recommender.getRecommendations({}, { limit: 3 }) : [];

            var html = this._buildHTML(stats, observations, recommendations, model);
            container.innerHTML = html;
        },

        _buildHTML: function(stats, observations, recommendations, model) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(52,211,153,0.04);border-radius:8px;border-left:2px solid #34d399;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔄 Learning Transfer</span>
                        <span style="font-size:9px;color:${stats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Observations', stats.total || 0, '#34d399')}
                        ${this._statCard('Near', stats.byTransferType?.NEAR || 0, '#f59e0b')}
                        ${this._statCard('Far', stats.byTransferType?.FAR || 0, '#8b5cf6')}
                        ${this._statCard('Independent', stats.byAssistanceLevel?.NONE || 0, '#4ade80')}
                    </div>

                    <!-- Transfer Types -->
                    ${Object.keys(stats.byTransferType || {}).length > 0 ? `
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                            ${Object.keys(stats.byTransferType).map(function(type) {
                                return `<span style="background:rgba(255,255,255,0.04);padding:1px 8px;border-radius:8px;">${model ? model.getTransferTypeLabel(type) : type}: ${stats.byTransferType[type]}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Recent Observations -->
                    ${observations.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Observations</div>
                            ${observations.slice(0, 3).map(function(o) {
                                var time = new Date(o.timestamp).toLocaleDateString();
                                var typeLabel = model ? model.getTransferTypeLabel(o.transferType) : o.transferType;
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${typeLabel}</span>
                                    <span style="color:#475569;">${time}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Recommendations -->
                    ${recommendations.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Transfer Recommendations (${recommendations.length})</div>
                            ${recommendations.slice(0, 2).map(function(r) {
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${r.newContext || 'unknown'}</span>
                                    <span style="color:#34d399;">${r.isOptional ? 'optional' : 'required'}</span>
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

    window.LawAIApp.Debug.Panels.TransferPanel = TransferPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'transfer',
                TransferPanel,
                'transfer-panel-placeholder',
                800
            );
            console.log('[TransferPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[TransferPanel] Part 61 loaded ✅');

})();
