// ============================================================
// orchestrationPanel.js
// Part 55 — AI Orchestration DevPanel Integration
// Version: v5.5
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug && 
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.OrchestrationPanel) {
        console.warn('[OrchestrationPanel] Already registered, skipping...');
        return;
    }

    var OrchestrationPanel = {
        _container: null,
        _refreshInterval: null,

        render: function(container) {
            this._container = container;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                OrchestrationPanel._refreshContent();
            }, 5000);

            console.log('[OrchestrationPanel] ✅ Rendered');
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
            var hasOrchestration = window.LawAIApp && window.LawAIApp.AIOrchestration;
            var hasWorkflow = window.LawAIApp && window.LawAIApp.MultiAgentWorkflow;
            var hasPriority = window.LawAIApp && window.LawAIApp.IntelligencePriority;
            var hasGov = window.LawAIApp && window.LawAIApp.OrchestrationGovernance;

            var stats = {};
            var activeWorkflow = null;
            var queue = [];
            var intelligenceStatus = {};

            if (hasOrchestration) {
                try {
                    stats = window.LawAIApp.AIOrchestration.getStats ? 
                        window.LawAIApp.AIOrchestration.getStats() : {};
                    activeWorkflow = window.LawAIApp.AIOrchestration.getActiveWorkflow ?
                        window.LawAIApp.AIOrchestration.getActiveWorkflow() : null;
                    intelligenceStatus = window.LawAIApp.AIOrchestration.getIntelligenceStatus ?
                        window.LawAIApp.AIOrchestration.getIntelligenceStatus() : {};
                } catch (e) { /* ignore */ }
            }

            if (hasPriority) {
                try {
                    queue = window.LawAIApp.IntelligencePriority.getQueue ?
                        window.LawAIApp.IntelligencePriority.getQueue(3) : [];
                } catch (e) { /* ignore */ }
            }

            var availableIntelligences = intelligenceStatus.available || [];
            var html = `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎼 AI Orchestration</span>
                        <span style="font-size:9px;color:${hasOrchestration ? '#4ade80' : '#f87171'};">
                            ${hasOrchestration ? '✅ Active' : '⚠️ Not available'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Workflows', stats.total || 0, '#8b5cf6')}
                        ${this._statCard('Running', stats.running || 0, '#4ade80')}
                        ${this._statCard('Intelligences', availableIntelligences.length || 0, '#60a5fa')}
                        ${this._statCard('Queue', queue.length || 0, '#facc15')}
                    </div>

                    <!-- Active Workflow -->
                    ${activeWorkflow ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">⚡ Active Workflow</div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 6px;background:rgba(139,92,246,0.08);border-radius:4px;">
                                <span style="color:#e2e8f0;">${activeWorkflow.task || 'unknown'}</span>
                                <span style="color:#8b5cf6;">${activeWorkflow.status || 'running'}</span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Priority Queue -->
                    ${queue.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">📋 Priority Queue</div>
                            ${queue.slice(0,2).map(function(t) {
                                var level = t.level || 'MEDIUM';
                                var color = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MEDIUM' ? '#eab308' : '#22c55e';
                                return `<div style="display:flex;justify-content:space-between;font-size:9px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                                    <span style="color:#e2e8f0;">${t.intelligence || 'task'}</span>
                                    <span style="color:${color};">${level}</span>
                                </div>`;
                            }).join('')}
                            ${queue.length > 2 ? `<div style="font-size:8px;color:#475569;text-align:right;">+${queue.length - 2} more</div>` : ''}
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
            console.log('[OrchestrationPanel] 🧹 Destroyed');
        }
    };

    // Register with DevPanel
    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.OrchestrationPanel = OrchestrationPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'orchestration',
                OrchestrationPanel,
                'orchestration-panel-placeholder',
                425
            );
            console.log('[OrchestrationPanel] ✅ Registered with DevPanel');
        }
    }, 100);

    console.log('[OrchestrationPanel] Part 55 loaded ✅');

})();
