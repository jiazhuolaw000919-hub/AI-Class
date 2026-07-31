// ==================================================
// Part 50.7 — Autonomous Runtime Dashboard
// Version: v5.0.7
// Module: Runtime Autonomous Layer
// File: autonomousDashboard.js
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AutonomousDashboard) {
        console.warn('[AutonomousDashboard] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Dashboard Provider (Chapter 3)
    // ==================================================
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
                refreshInterval: 5000, // 5 seconds
                maxHistoryItems: 50
            };
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[AutonomousDashboard] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[AutonomousDashboard] Initializing...');

            // Connect to all autonomous modules (Chapter 10)
            this._connectToAutonomousCore();
            this._connectToLifecycleManager();
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();
            this._connectToApprovalBridge();
            this._connectToActionPlanner();

            // Register with Explorer (Chapter 11)
            this._registerWithExplorer();

            // Auto-refresh
            if (this._config.autoRefresh) {
                this._startAutoRefresh();
            }

            // Initial data load
            this._refreshData();

            this._initialized = true;
            console.log('[AutonomousDashboard] Initialized ✅');
            return this;
        }

        // ==============================================
        // Data Access (Chapter 4-9)
        // ==============================================

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

        // ==============================================
        // Status View (Chapter 4)
        // ==============================================

        _getStatusData() {
            const data = {
                state: 'IDLE',
                session: null,
                activeTasks: 0,
                lastActivity: null,
                uptime: null
            };

            // Get from Autonomous Core
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                try {
                    const status = window.LawAIApp.Autonomous.getStatus();
                    if (status) {
                        data.state = status.state || 'IDLE';
                        data.session = status.currentTask?.taskId || null;
                        data.activeTasks = status.currentTask ? 1 : 0;
                        data.uptime = status.uptime || null;
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get status:', e);
                }
            }

            // Get from Lifecycle Manager
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    const lmStatus = window.LawAIApp.LifecycleManager.getStatus();
                    if (lmStatus) {
                        data.activeTasks = lmStatus.activeTasks || 0;
                        data.session = lmStatus.activeSession || data.session;
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get lifecycle status:', e);
                }
            }

            return data;
        }

        // ==============================================
        // Task View (Chapter 5)
        // ==============================================

        _getTaskData() {
            const tasks = [];

            // Get from Lifecycle Manager
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    const activeTasks = window.LawAIApp.LifecycleManager.getActiveTasks();
                    if (activeTasks) {
                        tasks.push(...activeTasks);
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get tasks:', e);
                }
            }

            // Truncate if needed
            if (tasks.length > this._config.maxHistoryItems) {
                return tasks.slice(0, this._config.maxHistoryItems);
            }

            return tasks;
        }

        // ==============================================
        // Decision View (Chapter 6)
        // ==============================================

        _getDecisionData() {
            const decisions = [];

            // Get from Decision Engine
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                try {
                    const active = window.LawAIApp.DecisionEngine.getActiveDecision();
                    if (active) {
                        decisions.push(active);
                    }

                    const history = window.LawAIApp.DecisionEngine.getDecisionHistory(10);
                    if (history) {
                        decisions.push(...history);
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get decisions:', e);
                }
            }

            return decisions;
        }

        // ==============================================
        // Recommendation View (Chapter 7)
        // ==============================================

        _getRecommendationData() {
            const recommendations = [];

            // Get from Recommendation Engine
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                try {
                    const active = window.LawAIApp.RecommendationEngine.getActiveRecommendations();
                    if (active) {
                        recommendations.push(...active);
                    }

                    const pending = window.LawAIApp.RecommendationEngine.getPendingRecommendations();
                    if (pending) {
                        recommendations.push(...pending);
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get recommendations:', e);
                }
            }

            return recommendations;
        }

        // ==============================================
        // Approval View (Chapter 8)
        // ==============================================

        _getApprovalData() {
            const approvals = {
                pending: [],
                approved: [],
                rejected: [],
                expired: []
            };

            // Get from Approval Bridge
            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                try {
                    const pending = window.LawAIApp.ApprovalBridge.getPendingRequests();
                    if (pending) {
                        approvals.pending = pending;
                    }

                    const completed = window.LawAIApp.ApprovalBridge.getCompletedRequests(10);
                    if (completed) {
                        completed.forEach(req => {
                            if (req.result === 'APPROVED') approvals.approved.push(req);
                            else if (req.result === 'REJECTED') approvals.rejected.push(req);
                            else if (req.result === 'EXPIRED') approvals.expired.push(req);
                        });
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get approvals:', e);
                }
            }

            return approvals;
        }

        // ==============================================
        // Execution Plan View (Chapter 9)
        // ==============================================

        _getPlanData() {
            const plans = [];

            // Get from Action Planner
            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    const active = window.LawAIApp.ActionPlanner.getActivePlan();
                    if (active) {
                        plans.push(active);
                    }

                    const recent = window.LawAIApp.ActionPlanner.getPlans({ limit: 5 });
                    if (recent) {
                        plans.push(...recent);
                    }
                } catch (e) {
                    console.warn('[Dashboard] Could not get plans:', e);
                }
            }

            return plans;
        }

        // ==============================================
        // Statistics
        // ==============================================

        _getStatsData() {
            const stats = {
                totalTasks: 0,
                totalDecisions: 0,
                totalRecommendations: 0,
                approvalRate: 0,
                executionSuccessRate: 0
            };

            // Get from various sources
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                try {
                    const status = window.LawAIApp.LifecycleManager.getStatus();
                    if (status && status.sessionStats) {
                        stats.totalTasks = status.sessionStats.total || 0;
                    }
                } catch (e) {}
            }

            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                try {
                    const decStats = window.LawAIApp.DecisionEngine.getDecisionStats();
                    if (decStats) {
                        stats.totalDecisions = decStats.total || 0;
                    }
                } catch (e) {}
            }

            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                try {
                    const appStats = window.LawAIApp.ApprovalBridge.getApprovalStats();
                    if (appStats) {
                        stats.approvalRate = appStats.approvalRate || 0;
                    }
                } catch (e) {}
            }

            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    const planStats = window.LawAIApp.ActionPlanner.getPlannerStats();
                    if (planStats) {
                        stats.executionSuccessRate = planStats.successRate || 0;
                        stats.totalRecommendations = planStats.total || 0;
                    }
                } catch (e) {}
            }

            return stats;
        }

        // ==============================================
        // Refresh
        // ==============================================

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

            this._refreshInterval = setInterval(() => {
                this._refreshData();
                this._emit('dashboardUpdated', this._data);
            }, this._config.refreshInterval);

            console.log(`[AutonomousDashboard] Auto-refresh started (${this._config.refreshInterval}ms)`);
        }

        _stopAutoRefresh() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
                console.log('[AutonomousDashboard] Auto-refresh stopped');
            }
        }

        // ==============================================
        // Listeners
        // ==============================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        }

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error(`[AutonomousDashboard] Listener error (${event}):`, e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`dashboard.${event}`, data);
            }
        }

        // ==============================================
        // Explorer Support (Chapter 11)
        // ==============================================

        getExplorerData() {
            const dashboardData = this.getDashboardData();

            return {
                type: 'autonomous_dashboard',
                status: this._initialized ? 'active' : 'inactive',
                data: {
                    status: dashboardData.status,
                    taskCount: dashboardData.tasks.length,
                    decisionCount: dashboardData.decisions.length,
                    recommendationCount: dashboardData.recommendations.length,
                    pendingApprovals: dashboardData.approvals?.pending?.length || 0,
                    planCount: dashboardData.plans.length,
                    stats: dashboardData.stats,
                    timestamp: dashboardData.timestamp
                },
                config: this._config
            };
        }

        // ==============================================
        // Integrations (Chapter 10)
        // ==============================================

        _connectToAutonomousCore() {
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                window.LawAIApp.Autonomous.on('taskStarted', () => this.refresh());
                window.LawAIApp.Autonomous.on('taskCompleted', () => this.refresh());
                window.LawAIApp.Autonomous.on('stateChanged', () => this.refresh());
                console.log('[AutonomousDashboard] Connected to Autonomous Core');
            }
        }

        _connectToLifecycleManager() {
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                window.LawAIApp.LifecycleManager.on('taskCreated', () => this.refresh());
                window.LawAIApp.LifecycleManager.on('taskCompleted', () => this.refresh());
                window.LawAIApp.LifecycleManager.on('taskStateChanged', () => this.refresh());
                console.log('[AutonomousDashboard] Connected to Lifecycle Manager');
            }
        }

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                window.LawAIApp.DecisionEngine.on('decisionMade', () => this.refresh());
                window.LawAIApp.DecisionEngine.on('decisionApproved', () => this.refresh());
                window.LawAIApp.DecisionEngine.on('decisionCompleted', () => this.refresh());
                console.log('[AutonomousDashboard] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                window.LawAIApp.RecommendationEngine.on('recommendationCreated', () => this.refresh());
                window.LawAIApp.RecommendationEngine.on('recommendationApproved', () => this.refresh());
                window.LawAIApp.RecommendationEngine.on('recommendationRejected', () => this.refresh());
                console.log('[AutonomousDashboard] Connected to Recommendation Engine');
            }
        }

        _connectToApprovalBridge() {
            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                window.LawAIApp.ApprovalBridge.on('requestSubmitted', () => this.refresh());
                window.LawAIApp.ApprovalBridge.on('requestApproved', () => this.refresh());
                window.LawAIApp.ApprovalBridge.on('requestRejected', () => this.refresh());
                console.log('[AutonomousDashboard] Connected to Approval Bridge');
            }
        }

        _connectToActionPlanner() {
            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                window.LawAIApp.ActionPlanner.on('planCreated', () => this.refresh());
                window.LawAIApp.ActionPlanner.on('planStarted', () => this.refresh());
                window.LawAIApp.ActionPlanner.on('planCompleted', () => this.refresh());
                window.LawAIApp.ActionPlanner.on('stepCompleted', () => this.refresh());
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
                        getData: () => this.getExplorerData()
                    });
                    console.log('[AutonomousDashboard] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[AutonomousDashboard] Could not register with Explorer:', e);
                }
            }
        }

        // ==============================================
        // Cleanup
        // ==============================================

        destroy() {
            this._stopAutoRefresh();
            this._initialized = false;
            console.log('[AutonomousDashboard] Destroyed');
        }
    }

    // ==================================================
    // DevPanel Integration (Chapter 2)
    // ==================================================

    function createDashboardPanel() {
        const dashboard = window.LawAIApp.AutonomousDashboard;

        if (!dashboard) {
            console.warn('[Dashboard] Cannot create panel: Dashboard not initialized');
            return null;
        }

        // Wait for DevPanel
        let attempts = 0;
        const maxAttempts = 20;

        const tryRegister = () => {
            attempts++;

            if (window.LawAIApp && window.LawAIApp.DevPanel) {
                // Register panel with DevPanel
                const panel = {
                    id: 'autonomous-dashboard',
                    title: '🤖 Autonomous Runtime',
                    icon: '⚡',
                    priority: 50,
                    render: function(container) {
                        return renderDashboardContent(container);
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
        };

        tryRegister();
    }

    // ==============================================
    // Dashboard Renderer (Chapter 12 - Read Only)
    // ==============================================

    function renderDashboardContent(container) {
        const data = window.LawAIApp.AutonomousDashboard.getDashboardData();

        // Safety: Read-only (Chapter 12)
        const html = `
            <div class="autonomous-dashboard" style="padding: 16px; font-family: monospace; color: #e0e0e0;">
                <!-- Status -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 11px; color: #888;">State</div>
                        <div style="font-size: 18px; font-weight: bold; color: ${data.status.state === 'IDLE' ? '#4ade80' : '#facc15'}">
                            ${data.status.state || 'IDLE'}
                        </div>
                    </div>
                    <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 11px; color: #888;">Active Tasks</div>
                        <div style="font-size: 18px; font-weight: bold; color: #60a5fa;">
                            ${data.status.activeTasks || 0}
                        </div>
                    </div>
                    <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 11px; color: #888;">Decisions</div>
                        <div style="font-size: 18px; font-weight: bold; color: #a78bfa;">
                            ${data.decisions?.length || 0}
                        </div>
                    </div>
                    <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 11px; color: #888;">Pending Approvals</div>
                        <div style="font-size: 18px; font-weight: bold; color: #f472b6;">
                            ${data.approvals?.pending?.length || 0}
                        </div>
                    </div>
                </div>

                <!-- Sections -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <!-- Tasks -->
                    <div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 12px; font-weight: bold; color: #60a5fa; margin-bottom: 8px;">📋 Active Tasks</div>
                        ${data.tasks && data.tasks.length > 0 ? 
                            data.tasks.slice(0, 3).map(t => `
                                <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">
                                    <span style="color: #4ade80;">●</span> 
                                    ${t.trigger || 'unknown'} 
                                    <span style="color: #888; font-size: 10px;">${t.state || 'pending'}</span>
                                </div>
                            `).join('') :
                            '<div style="font-size: 12px; color: #666;">No active tasks</div>'
                        }
                    </div>

                    <!-- Recommendations -->
                    <div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 12px; font-weight: bold; color: #a78bfa; margin-bottom: 8px;">💡 Recommendations</div>
                        ${data.recommendations && data.recommendations.length > 0 ?
                            data.recommendations.slice(0, 3).map(r => `
                                <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">
                                    <span style="color: ${r.status === 'APPROVED' ? '#4ade80' : r.status === 'REJECTED' ? '#f87171' : '#facc15'};">●</span>
                                    ${r.title || 'Recommendation'}
                                    <span style="color: #888; font-size: 10px;">${r.status || 'PENDING'}</span>
                                </div>
                            `).join('') :
                            '<div style="font-size: 12px; color: #666;">No recommendations</div>'
                        }
                    </div>

                    <!-- Execution Plans -->
                    <div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 12px; font-weight: bold; color: #f472b6; margin-bottom: 8px;">📊 Execution Plans</div>
                        ${data.plans && data.plans.length > 0 ?
                            data.plans.slice(0, 3).map(p => `
                                <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2a2a4e;">
                                    <span style="color: ${p.status === 'COMPLETED' ? '#4ade80' : p.status === 'FAILED' ? '#f87171' : '#60a5fa'};">●</span>
                                    ${p.planId || 'Plan'}
                                    <span style="color: #888; font-size: 10px;">${p.progress || 0}%</span>
                                </div>
                            `).join('') :
                            '<div style="font-size: 12px; color: #666;">No active plans</div>'
                        }
                    </div>

                    <!-- Stats -->
                    <div style="background: #1a1a2e; border-radius: 8px; padding: 12px; border: 1px solid #2a2a4e;">
                        <div style="font-size: 12px; font-weight: bold; color: #34d399; margin-bottom: 8px;">📈 Statistics</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <div style="font-size: 11px; color: #888;">Approval Rate</div>
                            <div style="font-size: 14px; font-weight: bold; color: #4ade80; text-align: right;">
                                ${data.stats?.approvalRate || 0}%
                            </div>
                            <div style="font-size: 11px; color: #888;">Success Rate</div>
                            <div style="font-size: 14px; font-weight: bold; color: #60a5fa; text-align: right;">
                                ${data.stats?.executionSuccessRate || 0}%
                            </div>
                            <div style="font-size: 11px; color: #888;">Total Tasks</div>
                            <div style="font-size: 14px; font-weight: bold; color: #a78bfa; text-align: right;">
                                ${data.stats?.totalTasks || 0}
                            </div>
                            <div style="font-size: 11px; color: #888;">Total Decisions</div>
                            <div style="font-size: 14px; font-weight: bold; color: #f472b6; text-align: right;">
                                ${data.stats?.totalDecisions || 0}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 12px; font-size: 10px; color: #444; text-align: right; border-top: 1px solid #1a1a2e; padding-top: 8px;">
                    ⚡ Read-Only | Updated: ${new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new AutonomousDashboard();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AutonomousDashboard = {
        Core: instance,

        // Public API
        initialize: (config) => instance.initialize(config),
        refresh: () => instance.refresh(),
        getDashboardData: () => instance.getDashboardData(),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy(),

        // DevPanel Integration
        registerPanel: createDashboardPanel
    };

    console.log('[AutonomousDashboard] Part 50.7 loaded ✅');

    // Auto-register with DevPanel if available
    if (window.LawAIApp && window.LawAIApp.DevPanel) {
        window.LawAIApp.AutonomousDashboard.registerPanel();
    }

})();
