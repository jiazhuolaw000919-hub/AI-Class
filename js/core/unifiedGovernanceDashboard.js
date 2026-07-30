// ============================================================
// unifiedGovernanceDashboard.js — Full Version
// Part 49.7 — Unified Governance Dashboard (Complete)
// ============================================================

window.LawAIApp = window.LawAIApp || {};

/**
 * Unified Governance Dashboard
 * 
 * 包含 9 个 Tabs:
 * 1. Overview — 总览
 * 2. Engine — 引擎治理 (Season 1-3)
 * 3. Policies — 策略引擎
 * 4. Permissions — 权限系统
 * 5. Validations — 验证系统
 * 6. Safety — 安全合规
 * 7. AI Governance — AI 治理
 * 8. Audit — 审计追踪
 * 9. Health — 健康状态
 */
window.LawAIApp.UnifiedGovernanceDashboard = {
    _container: null,
    _isOpen: false,
    _refreshInterval: null,
    _currentTab: 'overview',

    // ============================================================
    // OPEN — 打开 Dashboard
    // ============================================================

    open: function() {
        console.log('🏛️ [Governance] Opening full dashboard...');

        // 移除旧弹窗
        var old = document.getElementById('governance-dashboard-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'governance-dashboard-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.7)',
            'z-index:10050',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(6px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:900px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.9)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var container = document.createElement('div');
        container.id = 'governance-dashboard-container';
        popup.appendChild(container);
        overlay.appendChild(popup);

        // 点击遮罩关闭
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                window.LawAIApp.UnifiedGovernanceDashboard.close();
            }
        });

        // ESC 关闭
        var escHandler = function(e) {
            if (e.key === 'Escape') {
                window.LawAIApp.UnifiedGovernanceDashboard.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(overlay);

        this._container = container;
        this._isOpen = true;

        this.render(container);
    },

    // ============================================================
    // RENDER — 渲染完整 Dashboard
    // ============================================================

    render: function(container) {
        if (!container) container = this._container;
        if (!container) return;

        // 注入样式
        if (!document.getElementById('gov-dashboard-styles')) {
            var styles = document.createElement('style');
            styles.id = 'gov-dashboard-styles';
            styles.textContent = this._getStyles();
            document.head.appendChild(styles);
        }

        container.innerHTML = this._buildHTML();
        this._bindEvents();
        this._renderContent();

        // 启动自动刷新
        if (this._refreshInterval) clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(function() {
            if (this._container && this._isOpen) {
                this._renderContent();
            }
        }.bind(this), 5000);
    },

    // ============================================================
    // BUILD HTML — 构建界面
    // ============================================================

    _buildHTML: function() {
        var tabs = [
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'engine', icon: '⚙️', label: 'Engine Gov' },
            { id: 'policies', icon: '📋', label: 'Policies' },
            { id: 'permissions', icon: '🔑', label: 'Permissions' },
            { id: 'validations', icon: '✅', label: 'Validations' },
            { id: 'safety', icon: '🛡️', label: 'Safety' },
            { id: 'ai', icon: '🤖', label: 'AI Gov' },
            { id: 'audit', icon: '📝', label: 'Audit' },
            { id: 'health', icon: '💚', label: 'Health' }
        ];

        var html = '';
        html += '<div class="gov-dashboard">';

        // Header
        html += '<div class="gov-dashboard-header">';
        html += '<span class="gov-dashboard-title">🏛️ Unified Governance</span>';
        html += '<div class="gov-dashboard-meta">';
        html += '<span class="gov-badge-sm">V5.0.0</span>';
        html += '<span class="gov-badge-sm" style="background:#2a2a5a;color:#81d4fa;">Engine V3.x</span>';
        html += '<span class="gov-badge-sm" style="background:#1a3a2a;color:#81c784;">Runtime V4.9.7</span>';
        html += '<button class="gov-close-btn" onclick="window.LawAIApp.UnifiedGovernanceDashboard.close()">✕</button>';
        html += '</div>';
        html += '</div>';

        // Tabs
        html += '<div class="gov-tabs" id="gov-tabs">';
        for (var i = 0; i < tabs.length; i++) {
            var t = tabs[i];
            var active = i === 0 ? ' active' : '';
            html += '<button class="gov-tab' + active + '" data-tab="' + t.id + '">' + t.icon + ' ' + t.label + '</button>';
        }
        html += '</div>';

        // Content
        html += '<div class="gov-content" id="gov-content"></div>';

        // Footer
        html += '<div class="gov-footer">';
        html += '<span>Auto-refresh every 5s</span>';
        html += '<span id="gov-timestamp">' + new Date().toLocaleTimeString() + '</span>';
        html += '</div>';

        html += '</div>';
        return html;
    },

    // ============================================================
    // BIND EVENTS
    // ============================================================

    _bindEvents: function() {
        var container = this._container;
        if (!container) return;

        var tabs = container.querySelectorAll('.gov-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function(e) {
                var tab = e.target;
                var parent = tab.closest('.gov-tabs');
                if (parent) {
                    parent.querySelectorAll('.gov-tab').forEach(function(t) {
                        t.classList.remove('active');
                    });
                }
                tab.classList.add('active');
                this._currentTab = tab.dataset.tab;
                this._renderContent();
            }.bind(this));
        }
    },

    // ============================================================
    // RENDER CONTENT — 根据 Tab 渲染内容
    // ============================================================

    _renderContent: function() {
        var container = this._container;
        if (!container) return;

        var content = container.querySelector('#gov-content');
        if (!content) return;

        var html = '';

        switch(this._currentTab) {
            case 'overview':
                html = this._renderOverview();
                break;
            case 'engine':
                html = this._renderEngine();
                break;
            case 'policies':
                html = this._renderPolicies();
                break;
            case 'permissions':
                html = this._renderPermissions();
                break;
            case 'validations':
                html = this._renderValidations();
                break;
            case 'safety':
                html = this._renderSafety();
                break;
            case 'ai':
                html = this._renderAI();
                break;
            case 'audit':
                html = this._renderAudit();
                break;
            case 'health':
                html = this._renderHealth();
                break;
            default:
                html = this._renderOverview();
        }

        content.innerHTML = html;

        // 更新时间戳
        var ts = container.querySelector('#gov-timestamp');
        if (ts) ts.textContent = new Date().toLocaleTimeString();
    },

    // ============================================================
    // TAB: OVERVIEW
    // ============================================================

    _renderOverview: function() {
        var runtimeData = this._getRuntimeGovernanceData();
        var engineData = this._getEngineGovernanceData();

        var html = '';

        // Runtime Governance Summary
        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">🛡️ Runtime Governance <span class="gov-section-ver">Part 49</span></h3>';
        html += this._renderRuntimeCards(runtimeData);
        html += '</div>';

        // Engine Governance Summary
        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">⚙️ Engine Governance <span class="gov-section-ver">Season 1-3</span></h3>';
        html += this._renderEngineCards(engineData);
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: ENGINE
    // ============================================================

    _renderEngine: function() {
        var data = this._getEngineGovernanceData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">⚙️ Engine Governance <span class="gov-section-ver">Season 1-3</span></h3>';
        html += this._renderEngineDetail(data);
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: POLICIES
    // ============================================================

    _renderPolicies: function() {
        var data = this._getPolicyData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">📋 Policy Engine</h3>';
        html += this._renderStatusBadge(data.status);
        html += this._renderDetailGrid([
            { label: 'Active Policies', value: data.active },
            { label: 'Total Policies', value: data.total },
            { label: 'Health Score', value: data.health + '%' }
        ]);
        if (data.violations > 0) {
            html += '<div class="gov-warning">⚠️ ' + data.violations + ' violations detected</div>';
        }
        if (data.recent && data.recent.length > 0) {
            html += '<div class="gov-recent-list"><h4>Recent Decisions</h4>';
            for (var i = 0; i < Math.min(data.recent.length, 5); i++) {
                var r = data.recent[i];
                html += '<div class="gov-list-item"><span class="gov-badge-sm ' + (r.decision === 'allow' ? 'status-healthy' : 'status-critical') + '">' + r.decision + '</span><span>' + r.action + '</span></div>';
            }
            html += '</div>';
        }
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: PERMISSIONS
    // ============================================================

    _renderPermissions: function() {
        var data = this._getPermissionData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">🔑 Permission System</h3>';
        html += this._renderStatusBadge(data.status);
        html += this._renderDetailGrid([
            { label: 'Active Permissions', value: data.active },
            { label: 'Total Subjects', value: data.subjects },
            { label: 'Grant Rate', value: data.grantRate + '%' }
        ]);
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: VALIDATIONS
    // ============================================================

    _renderValidations: function() {
        var data = this._getValidationData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">✅ Validation System</h3>';
        html += this._renderStatusBadge(data.status);
        html += this._renderDetailGrid([
            { label: 'Total Validators', value: data.validators },
            { label: 'Validations Run', value: data.total },
            { label: 'Health Score', value: data.health + '%' }
        ]);
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: SAFETY
    // ============================================================

    _renderSafety: function() {
        var data = this._getSafetyData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">🛡️ Safety & Compliance</h3>';
        html += this._renderStatusBadge(data.status);
        html += this._renderDetailGrid([
            { label: 'Active Locks', value: data.locks },
            { label: 'Approved Actions', value: data.approved },
            { label: 'Blocked Actions', value: data.blocked },
            { label: 'Incidents', value: data.incidents }
        ]);
        if (data.locks > 0) {
            html += '<div class="gov-warning">🔒 ' + data.locks + ' active safety locks</div>';
        }
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: AI GOVERNANCE
    // ============================================================

    _renderAI: function() {
        var data = this._getAIData();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">🤖 AI Governance</h3>';
        html += this._renderStatusBadge(data.status);
        html += this._renderDetailGrid([
            { label: 'AI Level', value: data.level },
            { label: 'Total Decisions', value: data.total },
            { label: 'Approved', value: data.approved },
            { label: 'Rejected', value: data.rejected },
            { label: 'Pending Review', value: data.pending }
        ]);
        if (data.recent && data.recent.length > 0) {
            html += '<div class="gov-recent-list"><h4>Recent Decisions</h4>';
            for (var i = 0; i < Math.min(data.recent.length, 5); i++) {
                var r = data.recent[i];
                html += '<div class="gov-list-item"><span class="gov-badge-sm ' + (r.decision === 'approved' ? 'status-healthy' : 'status-critical') + '">' + r.decision + '</span><span>' + r.action + '</span></div>';
            }
            html += '</div>';
        }
        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: AUDIT
    // ============================================================

    _renderAudit: function() {
        var entries = this._getAuditEntries();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">📝 Audit Trail</h3>';
        html += '<div class="gov-detail-grid"><span>Total Entries: <strong>' + entries.length + '</strong></span></div>';

        if (entries.length > 0) {
            html += '<div class="gov-audit-list">';
            for (var i = 0; i < Math.min(entries.length, 20); i++) {
                var e = entries[i];
                html += '<div class="gov-audit-item">';
                html += '<span class="gov-audit-time">' + this._formatTime(e.timestamp) + '</span>';
                html += '<span class="gov-audit-source">[' + e.source + ']</span>';
                html += '<span class="gov-audit-action">' + e.action + '</span>';
                html += '<span class="gov-audit-detail">' + (e.detail || '') + '</span>';
                html += '</div>';
            }
            html += '</div>';
        } else {
            html += '<div class="gov-empty">No audit entries found</div>';
        }

        html += '</div>';

        return html;
    },

    // ============================================================
    // TAB: HEALTH
    // ============================================================

    _renderHealth: function() {
        var layers = this._getHealthLayers();
        var html = '';

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">💚 Governance Health</h3>';

        // 整体状态
        var overall = 'HEALTHY';
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].status === 'ERROR') overall = 'DEGRADED';
            if (layers[i].status === 'CRITICAL') overall = 'CRITICAL';
        }
        html += '<div class="gov-overall-health">';
        html += '<span>Overall Status:</span>';
        html += '<span class="gov-badge-lg ' + (overall === 'HEALTHY' ? 'status-healthy' : overall === 'DEGRADED' ? 'status-warning' : 'status-critical') + '">' + overall + '</span>';
        html += '</div>';

        // 各层状态
        html += '<div class="gov-health-grid">';
        for (var j = 0; j < layers.length; j++) {
            var l = layers[j];
            var statusClass = l.status === 'HEALTHY' ? 'health-healthy' : l.status === 'WARNING' ? 'health-warning' : 'health-error';
            html += '<div class="gov-health-card ' + statusClass + '">';
            html += '<span class="gov-health-icon">' + l.icon + '</span>';
            html += '<div class="gov-health-info">';
            html += '<strong>' + l.name + '</strong>';
            html += '<span class="gov-badge-sm ' + this._statusClass(l.status) + '">' + l.status + '</span>';
            html += '<span class="gov-health-detail">' + (l.detail || '') + '</span>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';

        html += '</div>';

        return html;
    },

    // ============================================================
    // DATA PROVIDERS
    // ============================================================

    _getRuntimeGovernanceData: function() {
        try {
            var policy = window.LawAIApp.Policy;
            var perm = window.LawAIApp.Permissions;
            var valid = window.LawAIApp.Validation;
            var safety = window.LawAIApp.Safety;
            var aiGov = window.LawAIApp.AIGovernance;

            var data = {
                policies: 0,
                permissions: 0,
                validators: 0,
                safetyLocks: 0,
                aiDecisions: 0,
                health: 0
            };

            if (policy && policy.getHealth) {
                var ph = policy.getHealth();
                data.policies = ph.activePolicies || 0;
                data.health = Math.max(data.health, ph.healthScore || 0);
            }
            if (perm && perm.getHealth) {
                var pmh = perm.getHealth();
                data.permissions = pmh.activePermissions || 0;
                data.health = Math.max(data.health, pmh.healthScore || 0);
            }
            if (valid && valid.getHealth) {
                var vh = valid.getHealth();
                data.validators = vh.validators || 0;
                data.health = Math.max(data.health, vh.healthScore || 0);
            }
            if (safety && safety.getHealth) {
                var sh = safety.getHealth();
                data.safetyLocks = sh.activeLocks || 0;
                data.health = Math.max(data.health, sh.healthScore || 0);
            }
            if (aiGov && aiGov.getAILevel) {
                var ai = aiGov.getAILevel();
                data.aiDecisions = ai.decisions || 0;
            }

            return data;
        } catch(e) {
            return { policies: 0, permissions: 0, validators: 0, safetyLocks: 0, aiDecisions: 0, health: 0 };
        }
    },

    _getEngineGovernanceData: function() {
        try {
            var health = window.LawAIApp.GovernanceHealth || window.governanceHealth;
            var manifest = window.LawAIApp.GovernanceManifest || window.governanceManifest;
            
            if (!health || !manifest) {
                return { available: false, total: 0, healthy: 0, broken: 0, score: 0 };
            }

            var h = health.getHealth ? health.getHealth() : health;
            var m = manifest.getSummary ? manifest.getSummary() : manifest;

            return {
                available: true,
                total: h.totalEngines || 0,
                healthy: h.healthyCount || 0,
                broken: h.brokenCount || 0,
                incomplete: h.incompleteCount || 0,
                score: h.overallScore || 0,
                status: h.overallStatus || 'unknown',
                coverage: h.coveragePercentage || 0,
                maturity: {
                    core: m.core || 0,
                    business: m.business || 0,
                    support: m.support || 0,
                    experimental: m.experimental || 0,
                    deprecated: m.deprecated || 0
                }
            };
        } catch(e) {
            return { available: false, total: 0, healthy: 0, broken: 0, score: 0 };
        }
    },

    _getPolicyData: function() {
        try {
            var p = window.LawAIApp.Policy;
            if (!p || !p.getHealth) return { active: 0, total: 0, health: 0, violations: 0, status: 'unknown', recent: [] };
            var h = p.getHealth();
            return {
                active: h.activePolicies || 0,
                total: h.totalPolicies || 0,
                health: h.healthScore || 0,
                violations: h.violations || 0,
                status: h.status || 'unknown',
                recent: p.getDecisions ? p.getDecisions(5) || [] : []
            };
        } catch(e) {
            return { active: 0, total: 0, health: 0, violations: 0, status: 'unknown', recent: [] };
        }
    },

    _getPermissionData: function() {
        try {
            var p = window.LawAIApp.Permissions;
            if (!p || !p.getHealth) return { active: 0, subjects: 0, grantRate: 0, status: 'unknown' };
            var h = p.getHealth();
            return {
                active: h.activePermissions || 0,
                subjects: h.totalSubjects || 0,
                grantRate: h.grantRate || 0,
                status: h.status || 'unknown'
            };
        } catch(e) {
            return { active: 0, subjects: 0, grantRate: 0, status: 'unknown' };
        }
    },

    _getValidationData: function() {
        try {
            var v = window.LawAIApp.Validation;
            if (!v || !v.getHealth) return { validators: 0, total: 0, health: 0, status: 'unknown' };
            var h = v.getHealth();
            return {
                validators: h.validators || 0,
                total: h.totalValidations || 0,
                health: h.healthScore || 0,
                status: h.status || 'unknown'
            };
        } catch(e) {
            return { validators: 0, total: 0, health: 0, status: 'unknown' };
        }
    },

    _getSafetyData: function() {
        try {
            var s = window.LawAIApp.Safety;
            if (!s || !s.getHealth) return { locks: 0, approved: 0, blocked: 0, incidents: 0, status: 'unknown' };
            var h = s.getHealth();
            return {
                locks: h.activeLocks || 0,
                approved: h.approvedActions || 0,
                blocked: h.blockedActions || 0,
                incidents: h.incidents || 0,
                status: h.status || 'unknown'
            };
        } catch(e) {
            return { locks: 0, approved: 0, blocked: 0, incidents: 0, status: 'unknown' };
        }
    },

    _getAIData: function() {
        try {
            var a = window.LawAIApp.AIGovernance;
            if (!a || !a.getAILevel) return { level: 'N/A', total: 0, approved: 0, rejected: 0, pending: 0, status: 'unknown', recent: [] };
            var l = a.getAILevel();
            return {
                level: l.name || 'N/A',
                total: l.decisions || 0,
                approved: l.approved || 0,
                rejected: l.rejected || 0,
                pending: l.pending || 0,
                status: l.status || 'unknown',
                recent: a.getDecisions ? a.getDecisions(5) || [] : []
            };
        } catch(e) {
            return { level: 'N/A', total: 0, approved: 0, rejected: 0, pending: 0, status: 'unknown', recent: [] };
        }
    },

    _getAuditEntries: function() {
        var entries = [];
        try {
            var p = window.LawAIApp.Policy;
            if (p && p.getDecisions) {
                var d = p.getDecisions(10) || [];
                for (var i = 0; i < d.length; i++) {
                    entries.push({ source: 'Policy', action: d[i].decision || 'decision', detail: d[i].action || '', timestamp: d[i].timestamp || Date.now() });
                }
            }
        } catch(e) {}
        try {
            var s = window.LawAIApp.Safety;
            if (s && s.getAuditTrail) {
                var a = s.getAuditTrail(10) || [];
                for (var j = 0; j < a.length; j++) {
                    entries.push({ source: 'Safety', action: a[j].action || 'event', detail: a[j].detail || '', timestamp: a[j].timestamp || Date.now() });
                }
            }
        } catch(e) {}
        entries.sort(function(a, b) { return b.timestamp - a.timestamp; });
        return entries;
    },

    _getHealthLayers: function() {
        var layers = [];
        try {
            var p = window.LawAIApp.Policy;
            if (p && p.getHealth) {
                var h = p.getHealth();
                layers.push({ name: 'Policy Engine', icon: '📋', status: h.status || 'UNKNOWN', detail: h.activePolicies + ' policies' });
            }
            var pm = window.LawAIApp.Permissions;
            if (pm && pm.getHealth) {
                var h2 = pm.getHealth();
                layers.push({ name: 'Permission System', icon: '🔑', status: h2.status || 'UNKNOWN', detail: h2.activePermissions + ' permissions' });
            }
            var v = window.LawAIApp.Validation;
            if (v && v.getHealth) {
                var h3 = v.getHealth();
                layers.push({ name: 'Validation System', icon: '✅', status: h3.status || 'UNKNOWN', detail: h3.validators + ' validators' });
            }
            var s = window.LawAIApp.Safety;
            if (s && s.getHealth) {
                var h4 = s.getHealth();
                layers.push({ name: 'Safety & Compliance', icon: '🛡️', status: h4.status || 'UNKNOWN', detail: h4.activeLocks + ' locks' });
            }
            var a = window.LawAIApp.AIGovernance;
            if (a && a.getAILevel) {
                var l = a.getAILevel();
                layers.push({ name: 'AI Governance', icon: '🤖', status: l.status || 'UNKNOWN', detail: l.name || 'Level ' + l.current });
            }
            // Engine Governance
            var eg = this._getEngineGovernanceData();
            if (eg.available) {
                layers.push({ name: 'Engine Governance', icon: '⚙️', status: eg.status || 'UNKNOWN', detail: 'Score: ' + eg.score + '%' });
            }
            layers.push({ name: 'Unified Dashboard', icon: '📊', status: 'HEALTHY', detail: 'V5.0.0' });
        } catch(e) {}
        return layers;
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    _renderRuntimeCards: function(data) {
        var cards = [
            { icon: '📋', label: 'Policies', value: data.policies },
            { icon: '🔑', label: 'Permissions', value: data.permissions },
            { icon: '✅', label: 'Validators', value: data.validators },
            { icon: '🛡️', label: 'Safety Locks', value: data.safetyLocks },
            { icon: '🤖', label: 'AI Decisions', value: data.aiDecisions },
            { icon: '💚', label: 'Health Score', value: data.health + '%' }
        ];

        var html = '<div class="gov-summary-grid">';
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            html += '<div class="gov-summary-card">';
            html += '<span class="gov-card-icon">' + c.icon + '</span>';
            html += '<div class="gov-card-content">';
            html += '<div class="gov-card-label">' + c.label + '</div>';
            html += '<div class="gov-card-value">' + c.value + '</div>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    _renderEngineCards: function(data) {
        if (!data.available) {
            return '<div class="gov-empty">⚠️ Engine Governance data unavailable</div>';
        }

        var cards = [
            { icon: '⚙️', label: 'Total Engines', value: data.total },
            { icon: '✅', label: 'Healthy', value: data.healthy },
            { icon: '⚠️', label: 'Incomplete', value: data.incomplete || 0 },
            { icon: '❌', label: 'Broken', value: data.broken }
        ];

        var html = '<div class="gov-summary-grid">';
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            html += '<div class="gov-summary-card">';
            html += '<span class="gov-card-icon">' + c.icon + '</span>';
            html += '<div class="gov-card-content">';
            html += '<div class="gov-card-label">' + c.label + '</div>';
            html += '<div class="gov-card-value">' + c.value + '</div>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';

        html += '<div class="gov-detail-grid">';
        html += '<div class="gov-detail-item"><span class="gov-detail-label">Score</span><span class="gov-detail-value">' + data.score + '%</span></div>';
        html += '<div class="gov-detail-item"><span class="gov-detail-label">Coverage</span><span class="gov-detail-value">' + data.coverage + '%</span></div>';
        html += '<div class="gov-detail-item"><span class="gov-detail-label">Status</span><span class="gov-detail-value">' + data.status + '</span></div>';
        html += '</div>';

        // Maturity
        if (data.maturity) {
            html += '<div class="gov-maturity-bar">';
            var total = data.maturity.core + data.maturity.business + data.maturity.support + data.maturity.experimental + data.maturity.deprecated || 1;
            var colors = { core: '#4caf50', business: '#2196f3', support: '#ff9800', experimental: '#9c27b0', deprecated: '#f44336' };
            var labels = { core: 'Core', business: 'Business', support: 'Support', experimental: 'Experimental', deprecated: 'Deprecated' };
            for (var key in data.maturity) {
                if (data.maturity.hasOwnProperty(key)) {
                    var pct = ((data.maturity[key] / total) * 100).toFixed(1);
                    html += '<div class="gov-maturity-segment" style="flex:' + data.maturity[key] + ';background:' + (colors[key] || '#666') + ';" title="' + (labels[key] || key) + ': ' + data.maturity[key] + ' (' + pct + '%)"></div>';
                }
            }
            html += '</div>';
            html += '<div class="gov-maturity-legend">';
            for (var key2 in data.maturity) {
                if (data.maturity.hasOwnProperty(key2)) {
                    html += '<span class="gov-legend-item"><span class="gov-legend-dot" style="background:' + (colors[key2] || '#666') + ';"></span>' + (labels[key2] || key2) + ' (' + data.maturity[key2] + ')</span>';
                }
            }
            html += '</div>';
        }

        return html;
    },

    _renderEngineDetail: function(data) {
        return this._renderEngineCards(data);
    },

    _renderStatusBadge: function(status) {
        var cls = this._statusClass(status);
        return '<div class="gov-status-row"><span class="gov-badge-lg ' + cls + '">' + (status || 'UNKNOWN') + '</span></div>';
    },

    _renderDetailGrid: function(items) {
        var html = '<div class="gov-detail-grid">';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            html += '<div class="gov-detail-item"><span class="gov-detail-label">' + item.label + '</span><span class="gov-detail-value">' + item.value + '</span></div>';
        }
        html += '</div>';
        return html;
    },

    // ============================================================
    // CLOSE
    // ============================================================

    close: function() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
        this._isOpen = false;
        var overlay = document.getElementById('governance-dashboard-overlay');
        if (overlay) overlay.remove();
        console.log('🏛️ [Governance] Dashboard closed');
    },

    // ============================================================
    // UTILITY
    // ============================================================

    _formatTime: function(timestamp) {
        if (!timestamp) return 'N/A';
        try {
            var date = new Date(timestamp);
            var now = new Date();
            var diff = now - date;
            if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
            if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
            return date.toLocaleDateString();
        } catch(e) {
            return String(timestamp);
        }
    },

    _statusClass: function(status) {
        if (!status) return '';
        var s = String(status).toLowerCase();
        if (s === 'healthy' || s === 'active' || s === 'safe' || s === 'running' || s === 'approved') return 'status-healthy';
        if (s === 'warning' || s === 'degraded' || s === 'pending' || s === 'review') return 'status-warning';
        if (s === 'critical' || s === 'error' || s === 'blocked' || s === 'rejected' || s === 'violations') return 'status-critical';
        return 'status-unknown';
    },

    // ============================================================
    // STYLES
    // ============================================================

    _getStyles: function() {
        return `
            .gov-dashboard{font-family:Inter,-apple-system,sans-serif;color:#e0e0e0;background:#1a1a2e;border-radius:8px;padding:16px}
            .gov-dashboard-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #2a2a4a;margin-bottom:12px;flex-wrap:wrap;gap:8px}
            .gov-dashboard-title{font-size:1.3em;font-weight:700;color:#fff}
            .gov-dashboard-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
            .gov-badge-sm{padding:2px 8px;border-radius:10px;font-size:0.7em;font-weight:600;background:#2a2a4a;color:#888}
            .gov-badge-lg{padding:4px 14px;border-radius:12px;font-size:0.8em;font-weight:700;text-transform:uppercase}
            .gov-close-btn{background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;padding:0 4px}
            .gov-close-btn:hover{color:#fff}
            .gov-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #2a2a4a}
            .gov-tab{background:transparent;border:1px solid #333;color:#aaa;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;transition:all 0.2s}
            .gov-tab:hover{background:#2a2a4a;color:#fff}
            .gov-tab.active{background:#3a3a6a;color:#fff;border-color:#5a5a9a}
            .gov-content{min-height:280px}
            .gov-section{background:#16213e;border-radius:6px;padding:14px;margin-bottom:12px;border:1px solid #2a2a4a}
            .gov-section-title{margin:0 0 12px 0;font-size:1em;color:#fff;border-bottom:1px solid #2a2a4a;padding-bottom:8px}
            .gov-section-ver{font-size:0.65em;color:#888;font-weight:400;margin-left:8px}
            .gov-summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
            .gov-summary-card{background:#1a1a35;border-radius:6px;padding:10px 12px;display:flex;align-items:center;gap:10px;border:1px solid #2a2a4a}
            .gov-card-icon{font-size:1.4em}
            .gov-card-content{flex:1}
            .gov-card-label{font-size:0.7em;color:#888}
            .gov-card-value{font-size:1.1em;font-weight:700;color:#fff}
            .gov-detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin:8px 0}
            .gov-detail-item{background:#1a1a35;padding:6px 10px;border-radius:4px;text-align:center}
            .gov-detail-label{display:block;font-size:0.65em;color:#888;margin-bottom:2px}
            .gov-detail-value{font-size:0.95em;font-weight:600;color:#fff}
            .gov-status-row{margin-bottom:10px}
            .gov-warning{padding:6px 12px;background:rgba(239,68,68,0.1);border-radius:4px;color:#ef4444;font-size:0.85em;margin:6px 0}
            .gov-empty{color:#666;font-style:italic;padding:10px;text-align:center}
            .gov-recent-list{margin-top:10px}
            .gov-recent-list h4{font-size:0.8em;color:#aaa;margin:0 0 6px 0}
            .gov-list-item{display:flex;align-items:center;gap:8px;padding:4px 8px;background:#1a1a35;border-radius:4px;margin-bottom:3px;font-size:0.8em}
            .gov-audit-list{margin-top:8px;max-height:300px;overflow-y:auto}
            .gov-audit-item{display:flex;gap:8px;padding:4px 8px;font-size:0.75em;border-bottom:1px solid #1a1a35;flex-wrap:wrap}
            .gov-audit-time{color:#666;min-width:60px}
            .gov-audit-source{color:#81d4fa;min-width:70px}
            .gov-audit-action{color:#4fc3f7;min-width:80px}
            .gov-audit-detail{color:#888;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            .gov-health-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin:8px 0}
            .gov-health-card{display:flex;align-items:center;gap:10px;padding:10px;background:#1a1a35;border-radius:6px;border:1px solid #2a2a4a}
            .gov-health-card.health-healthy{border-left:3px solid #4caf50}
            .gov-health-card.health-warning{border-left:3px solid #ff9800}
            .gov-health-card.health-error{border-left:3px solid #f44336}
            .gov-health-icon{font-size:1.6em}
            .gov-health-info{display:flex;flex-direction:column;gap:2px;flex:1}
            .gov-health-detail{font-size:0.7em;color:#888}
            .gov-overall-health{display:flex;align-items:center;gap:12px;padding:8px 14px;background:#1a1a35;border-radius:6px;font-size:0.9em;margin-bottom:10px}
            .gov-maturity-bar{display:flex;height:20px;border-radius:4px;overflow:hidden;margin:6px 0}
            .gov-maturity-segment{transition:all 0.3s;min-width:10px}
            .gov-maturity-segment:hover{filter:brightness(1.3)}
            .gov-maturity-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:0.7em;color:#aaa;margin-top:4px}
            .gov-legend-item{display:flex;align-items:center;gap:4px}
            .gov-legend-dot{display:inline-block;width:10px;height:10px;border-radius:50%}
            .gov-footer{display:flex;justify-content:space-between;padding-top:10px;margin-top:12px;border-top:1px solid #2a2a4a;font-size:0.7em;color:#666}
            .status-healthy{background:#4caf50;color:#000}
            .status-warning{background:#ff9800;color:#000}
            .status-critical{background:#f44336;color:#fff}
            .status-unknown{background:#666;color:#fff}
            .gov-dashboard::-webkit-scrollbar{width:4px}
            .gov-dashboard::-webkit-scrollbar-track{background:#1a1a2e}
            .gov-dashboard::-webkit-scrollbar-thumb{background:#3a3a5a;border-radius:2px}
        `;
    }
};

// ============================================================
// 全局打开方法
// ============================================================

window.LawAIApp._openGovernanceDashboard = function() {
    if (!window.LawAIApp.UnifiedGovernanceDashboard) {
        alert('⚠️ Governance Dashboard not loaded yet. Please wait.');
        return;
    }
    window.LawAIApp.UnifiedGovernanceDashboard.open();
};

console.log('🏛️ [UnifiedGovernance] Full dashboard loaded (9 tabs)');
console.log('   📋 Open with: LawAIApp._openGovernanceDashboard()');
