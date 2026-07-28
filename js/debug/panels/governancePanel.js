// ============================================================
// governancePanel.js
// Part 49.8.5 — Extract Governance Panel
// Version: v4.9.8.5
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Governance Panel
 * 
 * 职责：
 * - render(container) — 渲染 Governance UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 必须通过 Governance API
 * - 只能展示结果，不能修改 Policy/Permission
 * - 必须通过 API 获取数据
 */
LawAIApp.Debug.Panels.GovernancePanel = {
    _container: null,
    _visible: false,
    _refreshInterval: null,
    _data: null,
    _eventUnsubscribers: [],

    // ============================================================
    // PANEL CONTRACT
    // ============================================================

    render: function(container) {
        if (!container) {
            console.warn('[GovernancePanel] No container provided');
            return this;
        }

        this._container = container;
        this._visible = true;
        this._data = this._getData();
        container.innerHTML = this._buildHTML(this._data);
        this._bindEvents();
        this._startAutoRefresh();
        return this;
    },

    refresh: function() {
        if (!this._visible || !this._container) return;
        try {
            this._data = this._getData();
            this._updateUI(this._data);
        } catch (err) {
            console.warn('[GovernancePanel] Refresh failed:', err);
        }
    },

    destroy: function() {
        this._visible = false;
        this._stopAutoRefresh();
        this._unbindEvents();
        if (this._container) {
            this._container.innerHTML = '';
            this._container = null;
        }
        this._data = null;
    },

    isVisible: function() {
        return this._visible;
    },

    // ============================================================
    // GOVERNANCE API — 必须通过 Governance API
    // ============================================================

    _getData: function() {
        var info = {
            policyCount: 0,
            permissionCount: 0,
            validatorCount: 0,
            safetyLocks: 0,
            aiLevel: 'N/A',
            status: 'unknown',
            statusText: 'Unknown',
            statusColor: '#64748b',
            isAvailable: false,
            hasData: false,
            healthScore: 0,
            violations: 0,
            recommendations: []
        };

        try {
            var hasAnyGov = false;

            // ── Policy Engine ──
            var policy = LawAIApp.Policy || window.LawAIApp?.Policy;
            if (policy) {
                hasAnyGov = true;
                info.isAvailable = true;
                if (typeof policy.getHealth === 'function') {
                    var ph = policy.getHealth();
                    info.policyCount = ph.activePolicies || 0;
                    info.healthScore = Math.max(info.healthScore, ph.healthScore || 0);
                }
                if (typeof policy.getViolations === 'function') {
                    var violations = policy.getViolations();
                    info.violations = violations ? violations.length : 0;
                }
            }

            // ── Permission System ──
            var perm = LawAIApp.Permissions || window.LawAIApp?.Permissions;
            if (perm) {
                hasAnyGov = true;
                info.isAvailable = true;
                if (typeof perm.getHealth === 'function') {
                    var pmh = perm.getHealth();
                    info.permissionCount = pmh.activePermissions || 0;
                    info.healthScore = Math.max(info.healthScore, pmh.healthScore || 0);
                }
            }

            // ── Validation System ──
            var valid = LawAIApp.Validation || window.LawAIApp?.Validation;
            if (valid) {
                hasAnyGov = true;
                info.isAvailable = true;
                if (typeof valid.getHealth === 'function') {
                    var vh = valid.getHealth();
                    info.validatorCount = vh.validators || 0;
                    info.healthScore = Math.max(info.healthScore, vh.healthScore || 0);
                }
            }

            // ── Safety & Compliance ──
            var safety = LawAIApp.Safety || window.LawAIApp?.Safety;
            if (safety) {
                hasAnyGov = true;
                info.isAvailable = true;
                if (typeof safety.getHealth === 'function') {
                    var sh = safety.getHealth();
                    info.safetyLocks = sh.activeLocks || 0;
                    info.healthScore = Math.max(info.healthScore, sh.healthScore || 0);
                }
            }

            // ── AI Governance ──
            var aiGov = LawAIApp.AIGovernance || window.LawAIApp?.AIGovernance;
            if (aiGov) {
                hasAnyGov = true;
                info.isAvailable = true;
                if (typeof aiGov.getAILevel === 'function') {
                    var ai = aiGov.getAILevel();
                    info.aiLevel = ai.name || 'N/A';
                }
                if (typeof aiGov.getRecommendations === 'function') {
                    var recs = aiGov.getRecommendations();
                    info.recommendations = recs ? recs.slice(0, 3) : [];
                }
            }

            info.hasData = hasAnyGov;

            // ── Status ──
            if (info.healthScore >= 80) {
                info.statusColor = '#22c55e';
                info.statusText = 'Healthy';
                info.status = 'healthy';
            } else if (info.healthScore >= 50) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Warning';
                info.status = 'warning';
            } else if (info.hasData) {
                info.statusColor = '#64748b';
                info.statusText = 'Idle';
                info.status = 'idle';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
                info.status = 'unavailable';
            }

            if (info.violations > 0) {
                info.statusColor = '#ef4444';
                info.statusText = 'Violations';
                info.status = 'violations';
            }

        } catch (err) {
            console.warn('[GovernancePanel] Could not get governance data:', err);
        }

        return info;
    },

    // ============================================================
    // UI RENDERING — 只能展示结果，不能修改 Policy/Permission
    // ============================================================

    _buildHTML: function(data) {
        var statusColor = data.statusColor || '#64748b';
        var statusText = data.statusText || 'Unknown';

        return `
            <div id="governance-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏛️ Governance Layer</span>
                    <span style="font-size:10px;color:${statusColor};">${data.hasData ? data.healthScore + '%' : 'N/A'}</span>
                </div>
                
                ${data.isAvailable && data.hasData ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Policies: ${data.policyCount}</span>
                    <span>Permissions: ${data.permissionCount}</span>
                    <span>Validators: ${data.validatorCount}</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Safety Locks: ${data.safetyLocks}</span>
                    <span>AI Level: ${data.aiLevel}</span>
                    ${data.violations > 0 ? `<span style="color:#ef4444;">❌ Violations: ${data.violations}</span>` : '<span>✅ No violations</span>'}
                </div>
                
                <!-- Recommendations -->
                ${data.recommendations.length > 0 ? `
                    <div style="margin-top:2px;font-size:8px;color:#4a9eff;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        💡 ${data.recommendations.slice(0, 2).join(' | ')}${data.recommendations.length > 2 ? '...' : ''}
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ${data.isAvailable ? '⏳ No governance data available...' : '⚠️ Governance system not available'}
                </div>
                `}
                
                <!-- Click to Open Full Dashboard -->
                <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                    <div style="font-size:8px;color:#22c55e;cursor:pointer;text-align:center;" 
                         onclick="if(window.LawAIApp._openGovernanceDashboard){window.LawAIApp._openGovernanceDashboard();}else if(window.LawAIApp.UnifiedGovernanceDashboard){window.LawAIApp.UnifiedGovernanceDashboard.open();}">
                        🔗 Open Full Governance Dashboard →
                    </div>
                </div>
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="gov-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#22c55e;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.GovernancePanel._handleRefresh()">
                        🔄 refresh
                    </span>
                </div>
            </div>
        `;
    },

    _updateUI: function(data) {
        if (!this._container) return;
        this._container.innerHTML = this._buildHTML(data);
    },

    // ============================================================
    // EVENT BINDING
    // ============================================================

    _bindEvents: function() {
        if (!this._container) return;

        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('governance.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
                
                var unsubPolicy = eventBus.on('policy.changed', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubPolicy);
                
                var unsubSafety = eventBus.on('safety.event', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubSafety);
            }
        } catch (err) { /* ignore */ }

        try {
            var safety = LawAIApp.Safety || window.LawAIApp?.Safety;
            if (safety && typeof safety.on === 'function') {
                var unsub = safety.on('lock.changed', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) { /* ignore */ }
    },

    _unbindEvents: function() {
        this._eventUnsubscribers.forEach(function(unsub) {
            if (typeof unsub === 'function') {
                try { unsub(); } catch (e) { /* ignore */ }
            }
        });
        this._eventUnsubscribers = [];
    },

    _handleRefresh: function() {
        this.refresh();
    },

    // ============================================================
    // AUTO REFRESH
    // ============================================================

    _startAutoRefresh: function() {
        if (this._refreshInterval) return;
        this._refreshInterval = setInterval(function() {
            this.refresh();
        }.bind(this), 5000);
    },

    _stopAutoRefresh: function() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
    },

    // ============================================================
    // UTILITY
    // ============================================================

    _formatTimestamp: function(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
};

console.log('✅ [Part 49.8.5] GovernancePanel loaded');
