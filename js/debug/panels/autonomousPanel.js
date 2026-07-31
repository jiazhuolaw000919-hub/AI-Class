// ============================================================
// autonomousPanel.js
// Part 50.7 — Autonomous Dashboard DevPanel Integration
// Version: v5.0.7
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug && 
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.AutonomousPanel) {
        console.warn('[AutonomousPanel] Already registered, skipping...');
        return;
    }

    // ============================================================
    // Autonomous Panel Definition
    // ============================================================

    var AutonomousPanel = {
        _container: null,
        _refreshInterval: null,

        // ────────────────────────────────────────
        // Render
        // ────────────────────────────────────────

        render: function(container) {
            this._container = container;
            this._renderContent(container);

            // Auto-refresh every 3 seconds
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                AutonomousPanel._refreshContent();
            }, 3000);

            console.log('[AutonomousPanel] ✅ Rendered');
        },

        // ────────────────────────────────────────
        // Refresh
        // ────────────────────────────────────────

        refresh: function() {
            this._refreshContent();
        },

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        // ────────────────────────────────────────
        // Render Content
        // ────────────────────────────────────────

        _renderContent: function(container) {
            var dashboard = window.LawAIApp?.AutonomousDashboard;
            var data = dashboard ? dashboard.getDashboardData() : null;

            if (!dashboard || !data) {
                container.innerHTML = this._getErrorHTML('Autonomous Dashboard not available');
                return;
            }

            var status = data.status || {};
            var stats = data.stats || {};
            var tasks = data.tasks || [];
            var decisions = data.decisions || [];
            var approvals = data.approvals || { pending: [], approved: [], rejected: [] };
            var plans = data.plans || [];

            var html = `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🤖 Autonomous Runtime</span>
                        <span style="font-size:9px;color:${status.state === 'IDLE' ? '#4ade80' : '#facc15'};">
                            ${status.state || 'IDLE'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Tasks', status.activeTasks || 0, '#60a5fa')}
                        ${this._statCard('Decisions', decisions.length || 0, '#a78bfa')}
                        ${this._statCard('Pending', approvals.pending?.length || 0, '#f472b6')}
                        ${this._statCard('Plans', plans.length || 0, '#34d399')}
                    </div>

                    <!-- Stats Row -->
                    <div style="display:flex;gap:12px;font-size:9px;color:#475569;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">
                        <span>✅ Approval: ${stats.approvalRate || 0}%</span>
                        <span>📊 Success: ${stats.executionSuccessRate || 0}%</span>
                        <span>📋 Total Tasks: ${stats.totalTasks || 0}</span>
                    </div>

                    <!-- Active Tasks -->
                    ${tasks.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">📋 Active Tasks</div>
                            ${tasks.slice(0,3).map(function(t) {
                                return `<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                                    <span style="color:#e2e8f0;">${t.trigger || 'unknown'}</span>
                                    <span style="color:${t.state === 'COMPLETED' ? '#4ade80' : t.state === 'FAILED' ? '#f87171' : '#facc15'};">${t.state || 'PENDING'}</span>
                                </div>`;
                            }).join('')}
                            ${tasks.length > 3 ? `<div style="font-size:8px;color:#475569;text-align:right;">+${tasks.length - 3} more</div>` : ''}
                        </div>
                    ` : ''}

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date(data.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        // ────────────────────────────────────────
        // Helpers
        // ────────────────────────────────────────

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
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;">⚠️ Autonomous</div>
                    <div style="font-size:9px;color:#ef4444;margin-top:4px;">${message}</div>
                </div>
            `;
        },

        // ────────────────────────────────────────
        // Destroy
        // ────────────────────────────────────────

        destroy: function() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
            }
            this._container = null;
            console.log('[AutonomousPanel] 🧹 Destroyed');
        }
    };

    // ============================================================
    // Register with DevPanel
    // ============================================================

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.AutonomousPanel = AutonomousPanel;

    // Auto-register with DevPanel if available
    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'autonomous',
                AutonomousPanel,
                'autonomous-panel-placeholder',
                325
            );
            console.log('[AutonomousPanel] ✅ Registered with DevPanel');
        }
    }, 100);

    console.log('[AutonomousPanel] Part 50.7 loaded ✅');

})();
