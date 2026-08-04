// ============================================================
// autonomousDashboard.js
// Part 50.7 — Autonomous Runtime Dashboard (FIXED)
// Version: v5.0.7
// FIX: All class method syntax errors resolved
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AutonomousDashboard) {
        console.warn('[AutonomousDashboard] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Dashboard Provider
    // ============================================================
    class AutonomousDashboard {
        constructor() {
            this._initialized = false;
            this._refreshInterval = null;
            this._data = {
                status: null,
                tasks: [],
                decisions: [],
                recommendations: [],
                approvals: [],
                plans: [],
                stats: {}
            };
            this._listeners = {};
            this._config = {
                autoRefresh: true,
                refreshInterval: 5000,
                maxHistoryItems: 50
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[AutonomousDashboard] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[AutonomousDashboard] Initializing...');

            this._connectToAutonomousCore();
            this._connectToLifecycleManager();
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();
            this._connectToApprovalBridge();
            this._connectToActionPlanner();

            this._registerWithExplorer();

            if (this._config.autoRefresh) {
                this._startAutoRefresh();
            }

            this._refreshData();

            this._initialized = true;
            console.log('[AutonomousDashboard] Initialized ✅');
            return this;
        }

        // ============================================================
        // Data Access
        // ============================================================

        getDashboardData() {
            return {
                status: this._getStatusData(),
                tasks: this._getTaskData(),
                decisions: this._getDecisionData(),
                recommendations: this._getRecommendationData(),
                approvals: this._getApprovalData(),
                plans: this._getPlanData(),
                stats: this._getStatsData(),
                timestamp: Date.now()
            };
        }

        // ============================================================
        // Status View
        // ============================================================

        _getStatusData() {
            var data = {
                state: 'IDLE',
                session: null,
                activeTasks: 0,
                lastActivity: null,
                uptime: null
            };

            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                try {
                    var status = window.LawAIApp.Autonomous.getStatus();
                    if (status) {
                        data.state = status.state || 'IDLE';
                        data.session = status.currentTask ? status.currentTask.taskId : null;
                        data.activeTasks = status.currentTask ? 1 : 0;
                        data.uptime = status.uptime || null;
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    var lmStatus = window.LawAIApp.LifecycleManager.getStatus();
                    if (lmStatus) {
                        data.activeTasks = lmStatus.activeTasks || 0;
                        data.session = lmStatus.activeSession || data.session;
                    }
                } catch (e) {
                    // ignore
                }
            }

            return data;
        }

        // ============================================================
        // Task View
        // ============================================================

        _getTaskData() {
            var tasks = [];

            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    var activeTasks = window.LawAIApp.LifecycleManager.getActiveTasks();
                    if (activeTasks) {
                        tasks = tasks.concat(activeTasks);
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (tasks.length > this._config.maxHistoryItems) {
                tasks = tasks.slice(0, this._config.maxHistoryItems);
            }

            return tasks;
        }

        // ============================================================
        // Decision View
        // ============================================================

        _getDecisionData() {
            var decisions = [];

            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                try {
                    var active = window.LawAIApp.DecisionEngine.getActiveDecision();
                    if (active) {
                        decisions.push(active);
                    }

                    var history = window.LawAIApp.DecisionEngine.getDecisionHistory(10);
                    if (history) {
                        decisions = decisions.concat(history);
                    }
                } catch (e) {
                    // ignore
                }
            }

            return decisions;
        }

        // ============================================================
        // Recommendation View (FIXED — class method syntax)
        // ============================================================

        _getRecommendationData() {
            var recommendations = [];

            try {
                var engine = window.LawAIApp && window.LawAIApp.RecommendationEngine;
                if (!engine) {
                    return recommendations;
                }

                // Try getActiveRecommendations
                if (typeof engine.getActiveRecommendations === 'function') {
                    try {
                        var active = engine.getActiveRecommendations();
                        if (active) {
                            recommendations = recommendations.concat(active);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Try getPendingRecommendations
                if (typeof engine.getPendingRecommendations === 'function') {
                    try {
                        var pending = engine.getPendingRecommendations();
                        if (pending) {
                            recommendations = recommendations.concat(pending);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Try getRecommendations with filter
                if (typeof engine.getRecommendations === 'function') {
                    try {
                        var filtered = engine.getRecommendations({ status: 'PENDING' });
                        if (filtered) {
                            for (var i = 0; i < filtered.length; i++) {
                                var exists = false;
                                for (var j = 0; j < recommendations.length; j++) {
                                    if (recommendations[j].recommendationId === filtered[i].recommendationId) {
                                        exists = true;
                                        break;
                                    }
                                }
                                if (!exists) {
                                    recommendations.push(filtered[i]);
                                }
                            }
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Last resort: get all recommendations
                if (recommendations.length === 0 && typeof engine.getRecommendations === 'function') {
                    try {
                        var all = engine.getRecommendations({ limit: 10 });
                        if (all) {
                            recommendations = recommendations.concat(all);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

            } catch (e) {
                console.warn('[Dashboard] Could not get recommendations:', e);
            }

            return recommendations;
        }

        // ============================================================
        // Approval View (FIXED — class method syntax)
        // ============================================================

        _getApprovalData() {
            var approvals = {
                pending: [],
                approved: [],
                rejected: [],
                expired: []
            };

            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                try {
                    var pending = window.LawAIApp.ApprovalBridge.getPendingRequests();
                    if (pending) {
                        approvals.pending = pending;
                    }

                    var completed = window.LawAIApp.ApprovalBridge.getCompletedRequests(10);
                    if (completed) {
                        for (var i = 0; i < completed.length; i++) {
                            var req = completed[i];
                            if (req.result === 'APPROVED') {
                                approvals.approved.push(req);
                            } else if (req.result === 'REJECTED') {
                                approvals.rejected.push(req);
                            } else if (req.result === 'EXPIRED') {
                                approvals.expired.push(req);
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }

            return approvals;
        }

        // ============================================================
        // Execution Plan View
        // ============================================================

        _getPlanData() {
            var plans = [];

            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    var active = window.LawAIApp.ActionPlanner.getActivePlan();
                    if (active) {
                        plans.push(active);
                    }

                    var recent = window.LawAIApp.ActionPlanner.getPlans({ limit: 5 });
                    if (recent) {
                        plans = plans.concat(recent);
                    }
                } catch (e) {
                    // ignore
                }
            }

            return plans;
        }

        // ============================================================
        // Statistics (FIXED — class method syntax)
        // ============================================================

        _getStatsData() {
            var stats = {
                totalTasks: 0,
                totalDecisions: 0,
                totalRecommendations: 0,
                approvalRate: 0,
                executionSuccessRate: 0
            };

            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    var status = window.LawAIApp.LifecycleManager.getStatus();
                    if (status && status.sessionStats) {
                        stats.totalTasks = status.sessionStats.total || 0;
                    }
                } catch (e) { /* ignore */ }
            }

            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                try {
                    var decStats = window.LawAIApp.DecisionEngine.getDecisionStats();
                    if (decStats) {
                        stats.totalDecisions = decStats.total || 0;
                    }
                } catch (e) { /* ignore */ }
            }

            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                try {
                    var appStats = window.LawAIApp.ApprovalBridge.getApprovalStats();
                    if (appStats) {
                        stats.approvalRate = appStats.approvalRate || 0;
                    }
                } catch (e) { /* ignore */ }
            }

            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    var planStats = window.LawAIApp.ActionPlanner.getPlannerStats();
                    if (planStats) {
                        stats.executionSuccessRate = planStats.successRate || 0;
                        stats.totalRecommendations = planStats.total || 0;
                    }
                } catch (e) { /* ignore */ }
            }

            return stats;
        }

        // ============================================================
        // Refresh
        // ============================================================

        refresh() {
            this._refreshData();
            this._emit('dashboardRefreshed', this.getDashboardData());
            return this;
        }

        _refreshData() {
            this._data = {
                status: this._getStatusData(),
                tasks: this._getTaskData(),
                decisions: this._getDecisionData(),
                recommendations: this._getRecommendationData(),
                approvals: this._getApprovalData(),
                plans: this._getPlanData(),
                stats: this._getStatsData(),
                timestamp: Date.now()
            };
        }

        _startAutoRefresh() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }

            var self = this;
            this._refreshInterval = setInterval(function() {
                self._refreshData();
                self._emit('dashboardUpdated', self._data);
            }, this._config.refreshInterval);

            console.log('[AutonomousDashboard] Auto-refresh started');
        }

        _stopAutoRefresh() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
                console.log('[AutonomousDashboard] Auto-refresh stopped');
            }
        }

        // ============================================================
        // Listeners
        // ============================================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        }

        _emit(event, data) {
            if (this._listeners[event]) {
                var listeners = this._listeners[event];
                for (var i = 0; i < listeners.length; i++) {
                    try {
                        listeners[i](data);
                    } catch (e) {
                        console.error('[AutonomousDashboard] Listener error:', e);
                    }
                }
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit('autonomous.' + event, data);
            }
        }

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            var dashboardData = this.getDashboardData();

            return {
                type: 'autonomous_dashboard',
                status: this._initialized ? 'active' : 'inactive',
                data: {
                    status: dashboardData.status,
                    taskCount: dashboardData.tasks.length,
                    decisionCount: dashboardData.decisions.length,
                    recommendationCount: dashboardData.recommendations.length,
                    pendingApprovals: dashboardData.approvals ? dashboardData.approvals.pending ? dashboardData.approvals.pending.length : 0 : 0,
                    planCount: dashboardData.plans.length,
                    stats: dashboardData.stats,
                    timestamp: dashboardData.timestamp
                },
                config: this._config
            };
        }

        // ============================================================
        // Integrations
        // ============================================================

        _connectToAutonomousCore() {
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                window.LawAIApp.Autonomous.on('taskStarted', this.refresh.bind(this));
                window.LawAIApp.Autonomous.on('taskCompleted', this.refresh.bind(this));
                window.LawAIApp.Autonomous.on('stateChanged', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Autonomous Core');
            }
        }

        _connectToLifecycleManager() {
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                window.LawAIApp.LifecycleManager.on('taskCreated', this.refresh.bind(this));
                window.LawAIApp.LifecycleManager.on('taskCompleted', this.refresh.bind(this));
                window.LawAIApp.LifecycleManager.on('taskStateChanged', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Lifecycle Manager');
            }
        }

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                window.LawAIApp.DecisionEngine.on('decisionMade', this.refresh.bind(this));
                window.LawAIApp.DecisionEngine.on('decisionApproved', this.refresh.bind(this));
                window.LawAIApp.DecisionEngine.on('decisionCompleted', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                window.LawAIApp.RecommendationEngine.on('recommendationCreated', this.refresh.bind(this));
                window.LawAIApp.RecommendationEngine.on('recommendationApproved', this.refresh.bind(this));
                window.LawAIApp.RecommendationEngine.on('recommendationRejected', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Recommendation Engine');
            }
        }

        _connectToApprovalBridge() {
            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                window.LawAIApp.ApprovalBridge.on('requestSubmitted', this.refresh.bind(this));
                window.LawAIApp.ApprovalBridge.on('requestApproved', this.refresh.bind(this));
                window.LawAIApp.ApprovalBridge.on('requestRejected', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Approval Bridge');
            }
        }

        _connectToActionPlanner() {
            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                window.LawAIApp.ActionPlanner.on('planCreated', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('planStarted', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('planCompleted', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('stepCompleted', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Action Planner');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'autonomous-dashboard',
                        name: 'Autonomous Dashboard',
                        category: 'autonomous',
                        type: 'ui',
                        getData: this.getExplorerData.bind(this)
                    });
                    console.log('[AutonomousDashboard] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[AutonomousDashboard] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoRefresh();
            this._initialized = false;
            console.log('[AutonomousDashboard] Destroyed');
        }
    }

    // ============================================================
    // DevPanel Integration
    // ============================================================

    function createDashboardPanel() {
        var dashboard = window.LawAIApp.AutonomousDashboard;

        if (!dashboard) {
            console.warn('[Dashboard] Cannot create panel: Dashboard not initialized');
            return null;
        }

        var attempts = 0;
        var maxAttempts = 20;

        function tryRegister() {
            attempts++;

            if (window.LawAIApp && window.LawAIApp.DevPanel) {
                var panel = {
                    id: 'autonomous-dashboard',
                    title: '🤖 Autonomous Runtime',
                    icon: '⚡',
                    priority: 50,
                    render: function(container) {
                        renderDashboardContent(container);
                    },
                    refresh: function() {
                        if (window.LawAIApp && window.LawAIApp.AutonomousDashboard) {
                            window.LawAIApp.AutonomousDashboard.refresh();
                        }
                    }
                };

                try {
                    window.LawAIApp.DevPanel.registerPanel(panel);
                    console.log('[AutonomousDashboard] DevPanel integration successful');
                } catch (e) {
                    console.warn('[AutonomousDashboard] Could not register with DevPanel:', e);
                }
            } else if (attempts < maxAttempts) {
                setTimeout(tryRegister, 500);
            } else {
                console.warn('[AutonomousDashboard] DevPanel not available after max attempts');
            }
        }

        tryRegister();
    }

    // ============================================================
    // Dashboard Renderer
    // ============================================================

    function renderDashboardContent(container) {
        var data = window.LawAIApp.AutonomousDashboard.getDashboardData();

        var html = '';
        html += '<div class="autonomous-dashboard" style="padding: 16px; font-family: monospace; color: #e0e0e0;">';

        // Status
        html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">';
        html += '<div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 11px; color: #888;">State</div>';
        html += '<div style="font-size: 18px; font-weight: bold; color: ' + (data.status.state === 'IDLE' ? '#4ade80' : '#facc15') + '">' + (data.status.state || 'IDLE') + '</div>';
        html += '</div>';
        html += '<div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 11px; color: #888;">Active Tasks</div>';
        html += '<div style="font-size: 18px; font-weight: bold; color: #60a5fa;">' + (data.status.activeTasks || 0) + '</div>';
        html += '</div>';
        html += '<div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 11px; color: #888;">Decisions</div>';
        html += '<div style="font-size: 18px; font-weight: bold; color: #a78bfa;">' + (data.decisions ? data.decisions.length : 0) + '</div>';
        html += '</div>';
        html += '<div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 11px; color: #888;">Pending Approvals</div>';
        html += '<div style="font-size: 18px; font-weight: bold; color: #f472b6;">' + (data.approvals && data.approvals.pending ? data.approvals.pending.length : 0) + '</div>';
        html += '</div>';
        html += '</div>';

        // Sections
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">';

        // Tasks
        html += '<div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 12px; font-weight: bold; color: #60a5fa; margin-bottom: 8px;">📋 Active Tasks</div>';
        if (data.tasks && data.tasks.length > 0) {
            var sliced = data.tasks.slice(0, 3);
            for (var i = 0; i < sliced.length; i++) {
                var t = sliced[i];
                html += '<div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">';
                html += '<span style="color: #4ade80;">●</span> ';
                html += (t.trigger || 'unknown') + ' ';
                html += '<span style="color: #888; font-size: 10px;">' + (t.state || 'pending') + '</span>';
                html += '</div>';
            }
        } else {
            html += '<div style="font-size: 12px; color: #666;">No active tasks</div>';
        }
        html += '</div>';

        // Recommendations
        html += '<div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 12px; font-weight: bold; color: #a78bfa; margin-bottom: 8px;">💡 Recommendations</div>';
        if (data.recommendations && data.recommendations.length > 0) {
            var sliced = data.recommendations.slice(0, 3);
            for (var i = 0; i < sliced.length; i++) {
                var r = sliced[i];
                var color = r.status === 'APPROVED' ? '#4ade80' : r.status === 'REJECTED' ? '#f87171' : '#facc15';
                html += '<div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">';
                html += '<span style="color: ' + color + ';">●</span> ';
                html += (r.title || 'Recommendation') + ' ';
                html += '<span style="color: #888; font-size: 10px;">' + (r.status || 'PENDING') + '</span>';
                html += '</div>';
            }
        } else {
            html += '<div style="font-size: 12px; color: #666;">No recommendations</div>';
        }
        html += '</div>';

        // Execution Plans
        html += '<div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 12px; font-weight: bold; color: #f472b6; margin-bottom: 8px;">📊 Execution Plans</div>';
        if (data.plans && data.plans.length > 0) {
            var sliced = data.plans.slice(0, 3);
            for (var i = 0; i < sliced.length; i++) {
                var p = sliced[i];
                var color = p.status === 'COMPLETED' ? '#4ade80' : p.status === 'FAILED' ? '#f87171' : '#60a5fa';
                html += '<div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">';
                html += '<span style="color: ' + color + ';">●</span> ';
                html += (p.planId || 'Plan') + ' ';
                html += '<span style="color: #888; font-size: 10px;">' + (p.progress || 0) + '%</span>';
                html += '</div>';
            }
        } else {
            html += '<div style="font-size: 12px; color: #666;">No active plans</div>';
        }
        html += '</div>';

        // Stats
        html += '<div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">';
        html += '<div style="font-size: 12px; font-weight: bold; color: #34d399; margin-bottom: 8px;">📈 Statistics</div>';
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">';
        html += '<div style="font-size: 11px; color: #888;">Approval Rate</div>';
        html += '<div style="font-size: 14px; font-weight: bold; color: #4ade80; text-align: right;">' + (data.stats ? data.stats.approvalRate || 0 : 0) + '%</div>';
        html += '<div style="font-size: 11px; color: #888;">Success Rate</div>';
        html += '<div style="font-size: 14px; font-weight: bold; color: #60a5fa; text-align: right;">' + (data.stats ? data.stats.executionSuccessRate || 0 : 0) + '%</div>';
        html += '<div style="font-size: 11px; color: #888;">Total Tasks</div>';
        html += '<div style="font-size: 14px; font-weight: bold; color: #a78bfa; text-align: right;">' + (data.stats ? data.stats.totalTasks || 0 : 0) + '</div>';
        html += '<div style="font-size: 11px; color: #888;">Total Decisions</div>';
        html += '<div style="font-size: 14px; font-weight: bold; color: #f472b6; text-align: right;">' + (data.stats ? data.stats.totalDecisions || 0 : 0) + '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';

        // Footer
        html += '<div style="margin-top: 12px; font-size: 10px; color: #444; text-align: right; border-top: 1px solid #1a1a2e; padding-top: 8px;">';
        html += '⚡ Read-Only | Updated: ' + new Date(data.timestamp).toLocaleTimeString();
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    var instance = new AutonomousDashboard();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AutonomousDashboard = {
        Core: instance,

        initialize: function(config) { return instance.initialize(config); },
        refresh: function() { return instance.refresh(); },
        getDashboardData: function() { return instance.getDashboardData(); },
        getExplorerData: function() { return instance.getExplorerData(); },
        on: function(event, callback) { return instance.on(event, callback); },
        destroy: function() { return instance.destroy(); },

        registerPanel: function() {
            console.log('[AutonomousDashboard] Registering panel...');
            if (window.LawAIApp && window.LawAIApp.DevPanel) {
                try {
                    window.LawAIApp.DevPanel.registerPanel('autonomous', this, 'autonomous-panel-placeholder', 350);
                    console.log('[AutonomousDashboard] Panel registered');
                } catch (e) {
                    console.warn('[AutonomousDashboard] Could not register panel:', e);
                }
            }
        }
    };

    if (window.LawAIApp && window.LawAIApp.DevPanel) {
        window.LawAIApp.AutonomousDashboard.registerPanel();
    }

    console.log('[AutonomousDashboard] Part 50.7 loaded ✅');
    console.log('[AutonomousDashboard] FIXED: All syntax errors resolved');

})();
