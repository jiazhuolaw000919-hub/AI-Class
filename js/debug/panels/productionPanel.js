// productionPanel.js — Part 56.5
(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug && 
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.ProductionPanel) {
        console.warn('[ProductionPanel] Already registered, skipping...');
        return;
    }

    var ProductionPanel = {
        _container: null,
        _refreshInterval: null,

        render: function(container) {
            this._container = container;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                ProductionPanel._refreshContent();
            }, 5000);

            console.log('[ProductionPanel] ✅ Rendered');
        },

        refresh: function() {
            this._refreshContent();
        },

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        _renderContent: function(container) {
            var hasProduction = window.LawAIApp && window.LawAIApp.ProductionReadiness;
            var stats = {};
            var latestHealth = null;
            var deploymentReady = false;

            if (hasProduction) {
                try {
                    stats = window.LawAIApp.ProductionReadiness.getStats ? 
                        window.LawAIApp.ProductionReadiness.getStats() : {};
                    latestHealth = window.LawAIApp.ProductionReadiness.getLatestHealthReport ?
                        window.LawAIApp.ProductionReadiness.getLatestHealthReport() : null;
                    var readiness = window.LawAIApp.ProductionReadiness.checkDeploymentReadiness ?
                        window.LawAIApp.ProductionReadiness.checkDeploymentReadiness() : null;
                    deploymentReady = readiness ? readiness.ready : false;
                } catch (e) { /* ignore */ }
            }

            var health = latestHealth ? latestHealth.overallScore : 0;
            var status = stats.currentHealth !== undefined ? 
                (stats.currentHealth >= 70 ? '✅ Ready' : '⚠️ Needs Attention') : '⏳ Pending';

            var html = `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🚀 Production Readiness</span>
                        <span style="font-size:9px;color:${hasProduction ? '#4ade80' : '#f87171'};">
                            ${hasProduction ? '✅ Active' : '⚠️ Not available'}
                        </span>
                    </div>

                    <!-- Health Score -->
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
                        <div style="font-size:24px;font-weight:700;color:${health >= 70 ? '#4ade80' : health >= 50 ? '#facc15' : '#f87171'};">
                            ${health}%
                        </div>
                        <div style="font-size:11px;color:#e2e8f0;">System Health</div>
                        <div style="font-size:10px;color:#475569;margin-left:auto;">${status}</div>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Reports', stats.totalReports || 0, '#60a5fa')}
                        ${this._statCard('Recoveries', stats.totalRecoveries || 0, '#4ade80')}
                        ${this._statCard('Recovery Rate', (stats.recoveryRate || 0) + '%', '#facc15')}
                        ${this._statCard('Deployment', deploymentReady ? '✅' : '⚠️', deploymentReady ? '#4ade80' : '#f87171')}
                    </div>

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        _statCard: function(label, value, color) {
            return `
                <div style="text-align:center;padding:4px;background:rgba(255,255,255,0.02);border-radius:4px;">
                    <div style="font-size:14px;font-weight:700;color:${color};">${value}</div>
                    <div style="font-size:7px;color:#475569;text-transform:uppercase;">${label}</div>
                </div>
            `;
        },

        destroy: function() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
            }
            this._container = null;
            console.log('[ProductionPanel] 🧹 Destroyed');
        }
    };

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.ProductionPanel = ProductionPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'production',
                ProductionPanel,
                'production-panel-placeholder',
                450
            );
            console.log('[ProductionPanel] ✅ Registered with DevPanel');
        }
    }, 100);

    console.log('[ProductionPanel] Part 56.5 loaded ✅');
})();
