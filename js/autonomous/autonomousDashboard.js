// ============================================================
// autonomousDashboard.js
// Part 50.7 — Autonomous Runtime Dashboard (FIXED)
// Version: v5.0.7
// FIX: RecommendationEngine.getPendingRecommendations → getRecommendations
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
                        data.session = status.currentTask?.taskId || null;
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
                        tasks.push.apply(tasks, activeTasks);
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
                        decisions.push.apply(decisions, history);
                    }
                } catch (e) {
                    // ignore
                }
            }

            return decisions;
        }

        // ============================================================
        // Recommendation View (FIXED)
        // ============================================================

        _getRecommendationData: function() {
            var recommendations = [];

            try {
                var engine = window.LawAIApp && window.LawAIApp.RecommendationEngine;
                if (!engine) {
                    return recommendations;
                }

                // Try multiple method names
                var active = null;
                var pending = null;

                // Method 1: getActiveRecommendations
                if (typeof engine.getActiveRecommendations === 'function') {
                    try {
                        active = engine.getActiveRecommendations();
                        if (active) {
                            recommendations.push.apply(recommendations, active);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Method 2: getPendingRecommendations (old name)
                if (typeof engine.getPendingRecommendations === 'function') {
                    try {
                        pending = engine.getPendingRecommendations();
                        if (pending) {
                            recommendations.push.apply(recommendations, pending);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Method 3: getRecommendations with filter (fallback)
                if (typeof engine.getRecommendations === 'function') {
                    try {
                        // Try to get pending recommendations
                        var filtered = engine.getRecommendations({ status: 'PENDING' });
                        if (filtered) {
                            // Merge without duplicates
                            filtered.forEach(function(item) {
                                var exists = recommendations.some(function(r) {
                                    return r.recommendationId === item.recommendationId;
                                });
                                if (!exists) {
                                    recommendations.push(item);
                                }
                            });
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // Method 4: getRecommendations with no filter (last resort)
                if (recommendations.length === 0 && typeof engine.getRecommendations === 'function') {
                    try {
                        var all = engine.getRecommendations({ limit: 10 });
                        if (all) {
                            recommendations.push.apply(recommendations, all);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

            } catch (e) {
                console.warn('[Dashboard] Could not get recommendations:', e);
            }

            return recommendations;
        },

        // ============================================================
        // Approval View
        // ============================================================

        _getApprovalData: function() {
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
                        completed.forEach(function(req) {
                            if (req.result === 'APPROVED') approvals.approved.push(req);
                            else if (req.result === 'REJECTED') approvals.rejected.push(req);
                            else if (req.result === 'EXPIRED') approvals.expired.push(req);
                        });
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

        _getPlanData: function() {
            var plans = [];

            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    var active = window.LawAIApp.ActionPlanner.getActivePlan();
                    if (active) {
                        plans.push(active);
                    }

                    var recent = window.LawAIApp.ActionPlanner.getPlans({ limit: 5 });
                    if (recent) {
                        plans.push.apply(plans, recent);
                    }
                } catch (e) {
                    // ignore
                }
            }

            return plans;
        }

        // ============================================================
        // Statistics
        // ============================================================

        _getStatsData: function() {
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

        refresh: function() {
            this._refreshData();
            this._emit('dashboardRefreshed', this.getDashboardData());
            return this;
        },

        _refreshData: function() {
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
        },

        _startAutoRefresh: function() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }

            this._refreshInterval = setInterval(function() {
                this._refreshData();
                this._emit('dashboardUpdated', this._data);
            }.bind(this), this._config.refreshInterval);

            console.log('[AutonomousDashboard] Auto-refresh started');
        },

        _stopAutoRefresh: function() {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
            }
        },

        // ============================================================
        // Listeners
        // ============================================================

        on: function(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        },

        _emit: function(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(function(cb) {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error('[AutonomousDashboard] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit('autonomous.' + event, data);
            }
        },

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData: function() {
            var dashboardData = this.getDashboardData();

            return {
                type: 'autonomous_dashboard',
                status: this._initialized ? 'active' : 'inactive',
                data: {
                    status: dashboardData.status,
                    taskCount: dashboardData.tasks.length,
                    decisionCount: dashboardData.decisions.length,
                    recommendationCount: dashboardData.recommendations.length,
                    pendingApprovals: dashboardData.approvals && dashboardData.approvals.pending ? dashboardData.approvals.pending.length : 0,
                    planCount: dashboardData.plans.length,
                    stats: dashboardData.stats,
                    timestamp: dashboardData.timestamp
                },
                config: this._config
            };
        },

        // ============================================================
        // Integrations
        // ============================================================

        _connectToAutonomousCore: function() {
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                window.LawAIApp.Autonomous.on('taskStarted', this.refresh.bind(this));
                window.LawAIApp.Autonomous.on('taskCompleted', this.refresh.bind(this));
                window.LawAIApp.Autonomous.on('stateChanged', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Autonomous Core');
            }
        },

        _connectToLifecycleManager: function() {
            if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
                window.LawAIApp.LifecycleManager.on('taskCreated', this.refresh.bind(this));
                window.LawAIApp.LifecycleManager.on('taskCompleted', this.refresh.bind(this));
                window.LawAIApp.LifecycleManager.on('taskStateChanged', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Lifecycle Manager');
            }
        },

        _connectToDecisionEngine: function() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                window.LawAIApp.DecisionEngine.on('decisionMade', this.refresh.bind(this));
                window.LawAIApp.DecisionEngine.on('decisionApproved', this.refresh.bind(this));
                window.LawAIApp.DecisionEngine.on('decisionCompleted', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Decision Engine');
            }
        },

        _connectToRecommendationEngine: function() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                window.LawAIApp.RecommendationEngine.on('recommendationCreated', this.refresh.bind(this));
                window.LawAIApp.RecommendationEngine.on('recommendationApproved', this.refresh.bind(this));
                window.LawAIApp.RecommendationEngine.on('recommendationRejected', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Recommendation Engine');
            }
        },

        _connectToApprovalBridge: function() {
            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                window.LawAIApp.ApprovalBridge.on('requestSubmitted', this.refresh.bind(this));
                window.LawAIApp.ApprovalBridge.on('requestApproved', this.refresh.bind(this));
                window.LawAIApp.ApprovalBridge.on('requestRejected', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Approval Bridge');
            }
        },

        _connectToActionPlanner: function() {
            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                window.LawAIApp.ActionPlanner.on('planCreated', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('planStarted', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('planCompleted', this.refresh.bind(this));
                window.LawAIApp.ActionPlanner.on('stepCompleted', this.refresh.bind(this));
                console.log('[AutonomousDashboard] Connected to Action Planner');
            }
        },

        _registerWithExplorer: function() {
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
        },

        // ============================================================
        // Destroy
        // ============================================================

        destroy: function() {
            this._stopAutoRefresh();
            this._initialized = false;
            console.log('[AutonomousDashboard] Destroyed');
        }
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

    // 自动注册
    if (window.LawAIApp && window.LawAIApp.DevPanel) {
        window.LawAIApp.AutonomousDashboard.registerPanel();
    }

    console.log('[AutonomousDashboard] Part 50.7 loaded ✅');
    console.log('[AutonomousDashboard] FIXED: RecommendationEngine API compatibility');

})();
