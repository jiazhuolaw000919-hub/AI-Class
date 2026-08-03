// ============================================================
// evolutionPanel.js
// Part 54 — Runtime Evolution DevPanel Integration
// Version: v5.4
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug && 
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.EvolutionPanel) {
        console.warn('[EvolutionPanel] Already registered, skipping...');
        return;
    }

    var EvolutionPanel = {
        _container: null,
        _refreshInterval: null,

        render: function(container) {
            this._container = container;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                EvolutionPanel._refreshContent();
            }, 6000);

            console.log('[EvolutionPanel] ✅ Rendered');
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
            var hasEvolution = window.LawAIApp && window.LawAIApp.RuntimeEvolution;
            var hasIntel = window.LawAIApp && window.LawAIApp.EvolutionIntelligence;
            var hasAdapt = window.LawAIApp && window.LawAIApp.RuntimeAdaptation;
            var hasCap = window.LawAIApp && window.LawAIApp.CapabilityGrowth;
            var hasGov = window.LawAIApp && window.LawAIApp.EvolutionGovernance;

            var stats = {};
            var growthScore = 0;
            var proposals = [];

            if (hasEvolution) {
                try {
                    stats = window.LawAIApp.RuntimeEvolution.getStats ? 
                        window.LawAIApp.RuntimeEvolution.getStats() : {};
                } catch (e) { /* ignore */ }
            }

            if (hasCap) {
                try {
                    growthScore = window.LawAIApp.CapabilityGrowth.getGrowthScore ? 
                        window.LawAIApp.CapabilityGrowth.getGrowthScore() : 0;
                } catch (e) { /* ignore */ }
            }

            if (hasGov) {
                try {
                    var pending = window.LawAIApp.EvolutionGovernance.getPendingReviews ?
                        window.LawAIApp.EvolutionGovernance.getPendingReviews() : [];
                    proposals = pending.slice(0, 3);
                } catch (e) { /* ignore */ }
            }

            var html = `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧬 Runtime Evolution</span>
                        <span style="font-size:9px;color:${hasEvolution ? '#4ade80' : '#f87171'};">
                            ${hasEvolution ? '✅ Active' : '⚠️ Not available'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Opportunities', stats.total || 0, '#22c55e')}
                        ${this._statCard('Proposals', stats.proposals || 0, '#8b5cf6')}
                        ${this._statCard('Growth', growthScore + '%', '#4ade80')}
                        ${this._statCard('Pending', proposals.length || 0, '#facc15')}
                    </div>

                    <!-- Growth Score Bar -->
                    <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                        <div style="display:flex;justify-content:space-between;font-size:9px;color:#475569;">
                            <span>Growth Score</span>
                            <span>${growthScore}%</span>
                        </div>
                        <div style="width:100%;height:4px;background:#1a1a2e;border-radius:2px;overflow:hidden;margin-top:2px;">
                            <div style="width:${Math.min(growthScore, 100)}%;height:100%;background:${growthScore > 70 ? '#4ade80' : growthScore > 40 ? '#facc15' : '#f87171'};border-radius:2px;"></div>
                        </div>
                    </div>

                    ${proposals.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">📋 Pending Proposals</div>
                            ${proposals.map(function(p) {
                                return `<div style="display:flex;justify-content:space-between;font-size:9px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                                    <span style="color:#e2e8f0;">${p.target || 'proposal'}</span>
                                    <span style="color:#facc15;">pending</span>
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
            console.log('[EvolutionPanel] 🧹 Destroyed');
        }
    };

    // Register with DevPanel
    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.EvolutionPanel = EvolutionPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'evolution',
                EvolutionPanel,
                'evolution-panel-placeholder',
                400
            );
            console.log('[EvolutionPanel] ✅ Registered with DevPanel');
        }
    }, 100);

    console.log('[EvolutionPanel] Part 54 loaded ✅');

})();
