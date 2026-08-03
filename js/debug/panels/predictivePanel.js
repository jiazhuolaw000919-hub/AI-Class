// ============================================================
// predictivePanel.js
// Part 53 — Predictive Runtime DevPanel Integration
// Version: v5.3
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug && 
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.PredictivePanel) {
        console.warn('[PredictivePanel] Already registered, skipping...');
        return;
    }

    var PredictivePanel = {
        _container: null,
        _refreshInterval: null,

        render: function(container) {
            this._container = container;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                PredictivePanel._refreshContent();
            }, 5000);

            console.log('[PredictivePanel] ✅ Rendered');
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
            var hasPredictive = window.LawAIApp && window.LawAIApp.PredictiveIntelligence;
            var hasTrend = window.LawAIApp && window.LawAIApp.TrendPrediction;
            var hasRisk = window.LawAIApp && window.LawAIApp.RiskForecasting;
            var hasFailure = window.LawAIApp && window.LawAIApp.FailurePrediction;
            var hasRec = window.LawAIApp && window.LawAIApp.PredictiveRecommendation;

            var stats = {};
            var topRisks = [];
            var mostLikelyFailure = null;
            var recommendations = [];

            if (hasPredictive) {
                try {
                    stats = window.LawAIApp.PredictiveIntelligence.getStats ? 
                        window.LawAIApp.PredictiveIntelligence.getStats() : {};
                } catch (e) { /* ignore */ }
            }

            if (hasRisk) {
                try {
                    topRisks = window.LawAIApp.RiskForecasting.getTopRisks ? 
                        window.LawAIApp.RiskForecasting.getTopRisks(3) : [];
                } catch (e) { /* ignore */ }
            }

            if (hasFailure) {
                try {
                    mostLikelyFailure = window.LawAIApp.FailurePrediction.getMostLikelyFailure ? 
                        window.LawAIApp.FailurePrediction.getMostLikelyFailure() : null;
                } catch (e) { /* ignore */ }
            }

            if (hasRec) {
                try {
                    recommendations = window.LawAIApp.PredictiveRecommendation.getTopPriority ?
                        window.LawAIApp.PredictiveRecommendation.getTopPriority(3) : [];
                } catch (e) { /* ignore */ }
            }

            var html = `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔮 Predictive Runtime</span>
                        <span style="font-size:9px;color:${hasPredictive ? '#4ade80' : '#f87171'};">
                            ${hasPredictive ? '✅ Active' : '⚠️ Not available'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Predictions', stats.total || 0, '#8b5cf6')}
                        ${this._statCard('Risks', topRisks.length || 0, '#f97316')}
                        ${this._statCard('Failures', stats.totalFailures || 0, '#ef4444')}
                        ${this._statCard('Recommendations', recommendations.length || 0, '#22c55e')}
                    </div>

                    <!-- Most Likely Failure -->
                    ${mostLikelyFailure ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">⚠️ Most Likely Failure</div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 6px;background:rgba(239,68,68,0.08);border-radius:4px;">
                                <span style="color:#e2e8f0;">${mostLikelyFailure.target || 'unknown'}</span>
                                <span style="color:#ef4444;">${mostLikelyFailure.probability || 0}%</span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Top Risks -->
                    ${topRisks.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">🔥 Top Risks</div>
                            ${topRisks.slice(0,2).map(function(r) {
                                return `<div style="display:flex;justify-content:space-between;font-size:9px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                                    <span style="color:#e2e8f0;">${r.target || 'risk'}</span>
                                    <span style="color:${r.severity === 'CRITICAL' ? '#ef4444' : r.severity === 'HIGH' ? '#f97316' : '#eab308'};">${r.severity || 'LOW'}</span>
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
            console.log('[PredictivePanel] 🧹 Destroyed');
        }
    };

    // Register with DevPanel
    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.PredictivePanel = PredictivePanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'predictive',
                PredictivePanel,
                'predictive-panel-placeholder',
                375
            );
            console.log('[PredictivePanel] ✅ Registered with DevPanel');
        }
    }, 100);

    console.log('[PredictivePanel] Part 53 loaded ✅');

})();
