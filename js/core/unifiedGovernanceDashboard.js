// ============================================================
// unifiedGovernanceDashboard.js — Full Version with Popups
// Part 49.7 — Unified Governance Dashboard (Complete)
// ============================================================

window.LawAIApp = window.LawAIApp || {};

/**
 * Unified Governance Dashboard
 * 
 * 包含 9 个 Tabs:
 * 1. Overview — 总览
 * 2. Engine — 引擎治理 (Season 1-3)
 * 3. Policies — 策略引擎 (带弹出窗口)
 * 4. Permissions — 权限系统 (带弹出窗口)
 * 5. Validations — 验证系统 (带弹出窗口)
 * 6. Safety — 安全合规 (带弹出窗口)
 * 7. AI Governance — AI 治理 (带弹出窗口)
 * 8. Audit — 审计追踪
 * 9. Health — 健康状态
 */
window.LawAIApp.UnifiedGovernanceDashboard = {
    _container: null,
    _isOpen: false,
    _refreshInterval: null,
    _currentTab: 'overview',

    // ============================================================
    // OPEN
    // ============================================================

    open: function() {
        console.log('🏛️ [Governance] Opening full dashboard...');

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

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                window.LawAIApp.UnifiedGovernanceDashboard.close();
            }
        });

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
    // RENDER
    // ============================================================

    render: function(container) {
        if (!container) container = this._container;
        if (!container) return;

        if (!document.getElementById('gov-dashboard-styles')) {
            var styles = document.createElement('style');
            styles.id = 'gov-dashboard-styles';
            styles.textContent = this._getStyles();
            document.head.appendChild(styles);
        }

        container.innerHTML = this._buildHTML();
        this._bindEvents();
        this._renderContent();

        if (this._refreshInterval) clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(function() {
            if (this._container && this._isOpen) {
                this._renderContent();
            }
        }.bind(this), 5000);
    },

    // ============================================================
    // BUILD HTML
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

        html += '<div class="gov-dashboard-header">';
        html += '<span class="gov-dashboard-title">🏛️ Unified Governance</span>';
        html += '<div class="gov-dashboard-meta">';
        html += '<span class="gov-badge-sm">V5.0.0</span>';
        html += '<span class="gov-badge-sm" style="background:#2a2a5a;color:#81d4fa;">Engine V3.x</span>';
        html += '<span class="gov-badge-sm" style="background:#1a3a2a;color:#81c784;">Runtime V4.9.7</span>';
        html += '<button class="gov-close-btn" onclick="window.LawAIApp.UnifiedGovernanceDashboard.close()">✕</button>';
        html += '</div>';
        html += '</div>';

        html += '<div class="gov-tabs" id="gov-tabs">';
        for (var i = 0; i < tabs.length; i++) {
            var t = tabs[i];
            var active = i === 0 ? ' active' : '';
            html += '<button class="gov-tab' + active + '" data-tab="' + t.id + '">' + t.icon + ' ' + t.label + '</button>';
        }
        html += '</div>';

        html += '<div class="gov-content" id="gov-content"></div>';

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
    // RENDER CONTENT
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

        html += '<div class="gov-section">';
        html += '<h3 class="gov-section-title">🛡️ Runtime Governance <span class="gov-section-ver">Part 49</span></h3>';
        html += this._renderRuntimeCards(runtimeData);
        html += '</div>';

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
    // TAB: POLICIES — 带弹出窗口
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

        if (data.policies && data.policies.length > 0) {
            html += '<div style="margin-top:10px;text-align:center;">';
            html += '<button onclick="window.LawAIApp.UnifiedGovernanceDashboard._showPolicyPopup()" ';
            html += 'style="padding:8px 20px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.2);border-radius:8px;color:#4a9eff;font-size:12px;cursor:pointer;">';
            html += '📋 View All Policies (' + data.policies.length + ')</button>';
            html += '</div>';
        } else {
            html += '<div class="gov-empty">No policy rules found</div>';
        }

        if (data.recent && data.recent.length > 0) {
            html += '<div class="gov-recent-list" style="margin-top:12px;">';
            html += '<h4 style="font-size:0.85em;color:#aaa;">Recent Decisions</h4>';
            for (var j = 0; j < Math.min(data.recent.length, 5); j++) {
                var r = data.recent[j];
                var cls = (r.decision === 'allow' || r.decision === 'approved') ? 'status-healthy' : 'status-critical';
                html += '<div class="gov-list-item">';
                html += '<span class="gov-badge-sm ' + cls + '">' + (r.decision || r.result || '?') + '</span>';
                html += '<span>' + (r.action || r.request || '') + '</span>';
                html += '<span style="color:#666;font-size:0.75em;">' + this._formatTime(r.timestamp) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    // ============================================================
    // POLICY POPUP
    // ============================================================

    _showPolicyPopup: function() {
        var data = this._getPolicyData();
        if (!data.policies || data.policies.length === 0) {
            alert('No policies found.');
            return;
        }

        var old = document.getElementById('policy-popup-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'policy-popup-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.6)',
            'z-index:10060',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:700px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var html = '';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#4a9eff;">📋 All Policies (' + data.policies.length + ')</span>';
        html += '<button onclick="document.getElementById(\'policy-popup-overlay\').remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        var enabledCount = 0;
        for (var i = 0; i < data.policies.length; i++) {
            if (data.policies[i].enabled) enabledCount++;
        }
        html += '<div style="display:flex;gap:12px;margin-bottom:12px;font-size:12px;color:#94a3b8;">';
        html += '<span>✅ Active: <strong style="color:#22c55e;">' + enabledCount + '</strong></span>';
        html += '<span>⛔ Disabled: <strong style="color:#ef4444;">' + (data.policies.length - enabledCount) + '</strong></span>';
        html += '</div>';

        for (var i = 0; i < data.policies.length; i++) {
            var rule = data.policies[i];
            var statusColor = rule.enabled ? '#22c55e' : '#ef4444';
            var statusText = rule.enabled ? '✅ Active' : '⛔ Disabled';
            var actionColor = rule.action === 'allow' ? '#22c55e' : (rule.action === 'deny' ? '#ef4444' : '#f59e0b');
            
            html += '<div style="background:#16213e;border:1px solid #2a2a4a;border-radius:6px;padding:10px 12px;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="font-weight:600;color:#e2e8f0;">' + (rule.name || rule.id) + '</span>';
            html += '<span style="font-size:10px;color:#475569;background:#0d0d1a;padding:1px 8px;border-radius:4px;">' + rule.id + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + statusColor + '20;color:' + statusColor + ';">' + statusText + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + actionColor + '20;color:' + actionColor + ';">' + (rule.action || 'allow').toUpperCase() + '</span>';
            html += '</div>';
            if (rule.description) {
                html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + rule.description + '</div>';
            }
            if (rule.category) {
                html += '<div style="font-size:9px;color:#475569;margin-top:2px;">Category: ' + rule.category + ' | Priority: ' + (rule.priority || 'N/A') + '</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="document.getElementById(\'policy-popup-overlay\').remove()" style="padding:6px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        popup.innerHTML = html;

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    },

    // ============================================================
    // TAB: PERMISSIONS — 带弹出窗口
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

        if (data.permissions && data.permissions.length > 0) {
            html += '<div style="margin-top:10px;text-align:center;">';
            html += '<button onclick="window.LawAIApp.UnifiedGovernanceDashboard._showPermissionsPopup()" ';
            html += 'style="padding:8px 20px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:8px;color:#3b82f6;font-size:12px;cursor:pointer;">';
            html += '🔑 View All Permissions (' + data.permissions.length + ')</button>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    // ============================================================
    // PERMISSIONS POPUP
    // ============================================================

    _showPermissionsPopup: function() {
        var data = this._getPermissionData();
        var perms = data.permissions || [];
        if (perms.length === 0) {
            alert('No permissions found.');
            return;
        }

        var old = document.getElementById('permissions-popup-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'permissions-popup-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.6)',
            'z-index:10061',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:700px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var html = '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#3b82f6;">🔑 All Permissions (' + perms.length + ')</span>';
        html += '<button onclick="document.getElementById(\'permissions-popup-overlay\').remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        for (var i = 0; i < perms.length; i++) {
            var p = perms[i];
            html += '<div style="background:#16213e;border:1px solid #2a2a4a;border-radius:6px;padding:10px 12px;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="font-weight:600;color:#e2e8f0;">' + (p.name || p.id) + '</span>';
            html += '<span style="font-size:10px;color:#475569;background:#0d0d1a;padding:1px 8px;border-radius:4px;">' + p.id + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + (p.enabled ? '#22c55e20' : '#ef444420') + ';color:' + (p.enabled ? '#22c55e' : '#ef4444') + ';">' + (p.enabled ? '✅ Active' : '⛔ Disabled') + '</span>';
            html += '</div>';
            if (p.resource) {
                html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Resource: ' + p.resource + ' | Action: ' + (p.action || '*') + '</div>';
            }
            if (p.subject) {
                html += '<div style="font-size:9px;color:#475569;margin-top:2px;">Subject: ' + p.subject + '</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="document.getElementById(\'permissions-popup-overlay\').remove()" style="padding:6px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        popup.innerHTML = html;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    },

    // ============================================================
    // TAB: VALIDATIONS — 带弹出窗口
    // ============================================================

    _toggleAllValidators: function() {
        try {
            var validation = window.LawAIApp.Validation;
            if (!validation) {
                alert('⚠️ Validation system not available');
                return;
            }

            var validators = validation.getAll ? validation.getAll() : [];
            if (validators.length === 0) {
                alert('⚠️ No validators found');
                return;
            }

            // ── 计算当前状态 ──
            var enabledCount = 0;
            for (var i = 0; i < validators.length; i++) {
                if (validators[i].enabled !== false) enabledCount++;
            }
            var allEnabled = enabledCount === validators.length;

            // ── Toggle ──
            var newState = !allEnabled;
            var changed = 0;
            for (var j = 0; j < validators.length; j++) {
                if (validators[j].enabled !== undefined) {
                    validators[j].enabled = newState;
                    changed++;
                }
            }

            console.log('✅ ' + changed + ' validators ' + (newState ? 'enabled' : 'disabled'));

            // ── 🔥 强制刷新 UI ──
            var dashboard = window.LawAIApp.UnifiedGovernanceDashboard;
            if (dashboard && dashboard._container) {
                // 方案1: 直接重新渲染整个 Dashboard 内容
                if (typeof dashboard._renderContent === 'function') {
                    dashboard._renderContent();
                } else {
                    // 方案2: 重新渲染当前 Tab 的内容
                    var content = dashboard._container.querySelector('#gov-content');
                    if (content) {
                        var newHtml = dashboard._renderValidations();
                        content.innerHTML = newHtml;
                    }
                }
            }
        } catch(e) {
            console.error('[UnifiedGovernance] _toggleAllValidators error:', e);
            alert('❌ Error toggling validators: ' + e.message);
        }
    },

    // ============================================================
    // VALIDATIONS POPUP
    // ============================================================

    _showValidationsPopup: function() {
        var data = this._getValidationData();
        var validators = data.validators || [];
        if (validators.length === 0) {
            alert('No validators found.');
            return;
        }

        var old = document.getElementById('validations-popup-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'validations-popup-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.6)',
            'z-index:10062',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:700px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var html = '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#8b5cf6;">✅ All Validators (' + validators.length + ')</span>';
        html += '<button onclick="document.getElementById(\'validations-popup-overlay\').remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        for (var i = 0; i < validators.length; i++) {
            var v = validators[i];
            html += '<div style="background:#16213e;border:1px solid #2a2a4a;border-radius:6px;padding:10px 12px;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="font-weight:600;color:#e2e8f0;">' + (v.name || v.id) + '</span>';
            html += '<span style="font-size:10px;color:#475569;background:#0d0d1a;padding:1px 8px;border-radius:4px;">' + v.id + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + (v.enabled ? '#22c55e20' : '#ef444420') + ';color:' + (v.enabled ? '#22c55e' : '#ef4444') + ';">' + (v.enabled ? '✅ Active' : '⛔ Disabled') + '</span>';
            html += '</div>';
            if (v.type) {
                html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Type: ' + v.type + ' | Rule: ' + (v.rule || 'N/A') + '</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="document.getElementById(\'validations-popup-overlay\').remove()" style="padding:6px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        popup.innerHTML = html;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    },

    // ============================================================
    // TOGGLE ALL VALIDATORS — 开启/关闭
    // ============================================================

    _toggleAllValidators: function() {
        try {
            var validation = window.LawAIApp.Validation;
            if (!validation) {
                alert('⚠️ Validation system not available');
                return;
            }

            var validators = validation.getAll ? validation.getAll() : [];
            if (validators.length === 0) {
                alert('⚠️ No validators found');
                return;
            }

            // ── 检查当前状态 ──
            var enabledCount = 0;
            for (var i = 0; i < validators.length; i++) {
                if (validators[i].enabled !== false) enabledCount++;
            }
            var allEnabled = enabledCount === validators.length;

            // ── Toggle ──
            var newState = !allEnabled;
            var changed = 0;
            for (var j = 0; j < validators.length; j++) {
                if (validators[j].enabled !== undefined) {
                    validators[j].enabled = newState;
                    changed++;
                }
            }

            console.log('✅ ' + changed + ' validators ' + (newState ? 'enabled' : 'disabled'));

            // ── 🔥 强制刷新 UI：切到另一个 Tab 再切回来 ──
            var dashboard = window.LawAIApp.UnifiedGovernanceDashboard;
            if (dashboard && dashboard._container) {
                var content = dashboard._container.querySelector('#gov-content');
                if (content) {
                    // 记住当前 Tab
                    var currentTab = dashboard._currentTab || 'validations';
                
                    // 如果当前是 validations，先切到 overview 再切回来
                    if (currentTab === 'validations') {
                        dashboard._currentTab = 'overview';
                        dashboard._renderContent();
                    
                        // 延迟切回 validations
                        var self = dashboard;
                        setTimeout(function() {
                            self._currentTab = 'validations';
                            self._renderContent();
                        }, 50);
                    } else {
                        // 直接重新渲染
                        dashboard._renderContent();
                    }
                }
            }
        } catch(e) {
            console.error('[UnifiedGovernance] _toggleAllValidators error:', e);
            alert('❌ Error toggling validators: ' + e.message);
        }
    },
    
    // ============================================================
    // TAB: SAFETY — 带弹出窗口
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

        if (data.safetyRules && data.safetyRules.length > 0) {
            html += '<div style="margin-top:10px;text-align:center;">';
            html += '<button onclick="window.LawAIApp.UnifiedGovernanceDashboard._showSafetyPopup()" ';
            html += 'style="padding:8px 20px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;color:#f59e0b;font-size:12px;cursor:pointer;">';
            html += '🛡️ View Safety Rules (' + data.safetyRules.length + ')</button>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    // ============================================================
    // SAFETY POPUP
    // ============================================================

    _showSafetyPopup: function() {
        var data = this._getSafetyData();
        var rules = data.safetyRules || [];
        if (rules.length === 0) {
            alert('No safety rules found.');
            return;
        }

        var old = document.getElementById('safety-popup-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'safety-popup-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.6)',
            'z-index:10063',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:700px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var html = '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#f59e0b;">🛡️ Safety Rules (' + rules.length + ')</span>';
        html += '<button onclick="document.getElementById(\'safety-popup-overlay\').remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var levelColor = r.level === 'critical' ? '#ef4444' : (r.level === 'high' ? '#f59e0b' : '#22c55e');
            html += '<div style="background:#16213e;border:1px solid #2a2a4a;border-radius:6px;padding:10px 12px;margin-bottom:8px;border-left:3px solid ' + levelColor + ';">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="font-weight:600;color:#e2e8f0;">' + (r.name || r.id) + '</span>';
            html += '<span style="font-size:10px;color:#475569;background:#0d0d1a;padding:1px 8px;border-radius:4px;">' + r.id + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + levelColor + '20;color:' + levelColor + ';">' + (r.level || 'medium').toUpperCase() + '</span>';
            html += '</div>';
            if (r.description) {
                html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + r.description + '</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="document.getElementById(\'safety-popup-overlay\').remove()" style="padding:6px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        popup.innerHTML = html;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    },

    // ============================================================
    // TAB: AI GOVERNANCE — 带弹出窗口
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

        if (data.decisions && data.decisions.length > 0) {
            html += '<div style="margin-top:10px;text-align:center;">';
            html += '<button onclick="window.LawAIApp.UnifiedGovernanceDashboard._showAIDecisionsPopup()" ';
            html += 'style="padding:8px 20px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:8px;color:#a855f7;font-size:12px;cursor:pointer;">';
            html += '🤖 View AI Decisions (' + data.decisions.length + ')</button>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    // ============================================================
    // AI DECISIONS POPUP
    // ============================================================

    _showAIDecisionsPopup: function() {
        var data = this._getAIData();
        var decisions = data.decisions || [];
        if (decisions.length === 0) {
            alert('No AI decisions found.');
            return;
        }

        var old = document.getElementById('ai-popup-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'ai-popup-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.6)',
            'z-index:10064',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        var popup = document.createElement('div');
        popup.style.cssText = [
            'background:#1a1a2e',
            'border:1px solid rgba(255,255,255,0.1)',
            'border-radius:14px',
            'padding:20px',
            'max-width:700px',
            'width:95%',
            'max-height:85vh',
            'overflow-y:auto',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8)',
            'color:#e2e8f0',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13px'
        ].join(';');

        var html = '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#a855f7;">🤖 AI Decisions (' + decisions.length + ')</span>';
        html += '<button onclick="document.getElementById(\'ai-popup-overlay\').remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        for (var i = 0; i < decisions.length; i++) {
            var d = decisions[i];
            var decisionColor = d.decision === 'approved' ? '#22c55e' : (d.decision === 'rejected' ? '#ef4444' : '#f59e0b');
            html += '<div style="background:#16213e;border:1px solid #2a2a4a;border-radius:6px;padding:10px 12px;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="font-weight:600;color:#e2e8f0;">' + (d.action || d.id) + '</span>';
            html += '<span style="font-size:10px;padding:1px 8px;border-radius:4px;background:' + decisionColor + '20;color:' + decisionColor + ';">' + (d.decision || 'pending').toUpperCase() + '</span>';
            html += '</div>';
            if (d.reason) {
                html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + d.reason + '</div>';
            }
            if (d.confidence) {
                html += '<div style="font-size:9px;color:#475569;margin-top:2px;">Confidence: ' + (d.confidence * 100).toFixed(0) + '%</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="document.getElementById(\'ai-popup-overlay\').remove()" style="padding:6px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        popup.innerHTML = html;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
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

        var overall = 'HEALTHY';
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].status === 'ERROR') overall = 'DEGRADED';
            if (layers[i].status === 'CRITICAL') overall = 'CRITICAL';
        }
        html += '<div class="gov-overall-health">';
        html += '<span>Overall Status:</span>';
        html += '<span class="gov-badge-lg ' + (overall === 'HEALTHY' ? 'status-healthy' : overall === 'DEGRADED' ? 'status-warning' : 'status-critical') + '">' + overall + '</span>';
        html += '</div>';

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
            if (!p) {
                return { active: 0, total: 0, health: 0, violations: 0, status: 'unknown', recent: [], policies: [] };
            }
            
            var h = p.getHealth ? p.getHealth() : {};
            
            var policyList = [];
            if (p.getAll) {
                policyList = p.getAll() || [];
            } else if (p.getAllPolicies) {
                policyList = p.getAllPolicies() || [];
            }
            
            var recent = [];
            if (p.getDecisions) {
                recent = p.getDecisions(10) || [];
            }

            return {
                active: h.activePolicies || 0,
                total: h.totalPolicies || 0,
                health: h.healthScore || 0,
                violations: h.violations || 0,
                status: h.status || 'unknown',
                recent: recent,
                policies: policyList
            };
        } catch(e) {
            return { active: 0, total: 0, health: 0, violations: 0, status: 'unknown', recent: [], policies: [] };
        }
    },

    _getPermissionData: function() {
        try {
            var p = window.LawAIApp.Permissions;
            if (!p || !p.getHealth) {
                return { active: 0, subjects: 0, grantRate: 0, status: 'unknown', permissions: [] };
            }
            var h = p.getHealth ? p.getHealth() : {};
            
            var permList = [];
            if (p.getAll) {
                permList = p.getAll() || [];
            } else if (p.getAllPermissions) {
                permList = p.getAllPermissions() || [];
            }
            
            return {
                active: h.activePermissions || 0,
                subjects: h.totalSubjects || 0,
                grantRate: h.grantRate || 0,
                status: h.status || 'unknown',
                permissions: permList
            };
        } catch(e) {
            return { active: 0, subjects: 0, grantRate: 0, status: 'unknown', permissions: [] };
        }
    },

    _getValidationData: function() {
        try {
            var v = window.LawAIApp.Validation;
            if (!v || !v.getHealth) {
                return { validators: 0, total: 0, health: 0, status: 'unknown', validatorsList: [] };
            }
            var h = v.getHealth ? v.getHealth() : {};
            
            var validatorList = [];
            if (v.getAll) {
                validatorList = v.getAll() || [];
            } else if (v.getAllValidators) {
                validatorList = v.getAllValidators() || [];
            }
            
            return {
                validators: h.validators || 0,
                total: h.totalValidations || 0,
                health: h.healthScore || 0,
                status: h.status || 'unknown',
                validators: validatorList
            };
        } catch(e) {
            return { validators: 0, total: 0, health: 0, status: 'unknown', validators: [] };
        }
    },

    _getSafetyData: function() {
        try {
            var s = window.LawAIApp.Safety;
            if (!s || !s.getHealth) {
                return { locks: 0, approved: 0, blocked: 0, incidents: 0, status: 'unknown', safetyRules: [] };
            }
            var h = s.getHealth ? s.getHealth() : {};
            
            var ruleList = [];
            if (s.getAll) {
                ruleList = s.getAll() || [];
            } else if (s.getAllRules) {
                ruleList = s.getAllRules() || [];
            }
            
            return {
                locks: h.activeLocks || 0,
                approved: h.approvedActions || 0,
                blocked: h.blockedActions || 0,
                incidents: h.incidents || 0,
                status: h.status || 'unknown',
                safetyRules: ruleList
            };
        } catch(e) {
            return { locks: 0, approved: 0, blocked: 0, incidents: 0, status: 'unknown', safetyRules: [] };
        }
    },

    _getAIData: function() {
        try {
            var a = window.LawAIApp.AIGovernance;
            if (!a || !a.getAILevel) {
                return { level: 'N/A', total: 0, approved: 0, rejected: 0, pending: 0, status: 'unknown', recent: [], decisions: [] };
            }
            var l = a.getAILevel ? a.getAILevel() : {};
            
            var decisionList = [];
            if (a.getAll) {
                decisionList = a.getAll() || [];
            } else if (a.getAllDecisions) {
                decisionList = a.getAllDecisions() || [];
            }
            
            return {
                level: l.name || 'N/A',
                total: l.decisions || 0,
                approved: l.approved || 0,
                rejected: l.rejected || 0,
                pending: l.pending || 0,
                status: l.status || 'unknown',
                recent: a.getDecisions ? a.getDecisions(5) || [] : [],
                decisions: decisionList
            };
        } catch(e) {
            return { level: 'N/A', total: 0, approved: 0, rejected: 0, pending: 0, status: 'unknown', recent: [], decisions: [] };
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

        if (data.maturity) {
            var maturityTotal = data.maturity.core + data.maturity.business + data.maturity.support + data.maturity.experimental + data.maturity.deprecated || 1;
            var maturityColors = { core: '#4caf50', business: '#2196f3', support: '#ff9800', experimental: '#9c27b0', deprecated: '#f44336' };
            var maturityLabels = { core: 'Core', business: 'Business', support: 'Support', experimental: 'Experimental', deprecated: 'Deprecated' };
            
            html += '<div class="gov-maturity-bar">';
            for (var key in data.maturity) {
                if (data.maturity.hasOwnProperty(key)) {
                    var pct = ((data.maturity[key] / maturityTotal) * 100).toFixed(1);
                    html += '<div class="gov-maturity-segment" style="flex:' + data.maturity[key] + ';background:' + (maturityColors[key] || '#666') + ';" title="' + (maturityLabels[key] || key) + ': ' + data.maturity[key] + ' (' + pct + '%)"></div>';
                }
            }
            html += '</div>';
            html += '<div class="gov-maturity-legend">';
            for (var key2 in data.maturity) {
                if (data.maturity.hasOwnProperty(key2)) {
                    html += '<span class="gov-legend-item"><span class="gov-legend-dot" style="background:' + (maturityColors[key2] || '#666') + ';"></span>' + (maturityLabels[key2] || key2) + ' (' + data.maturity[key2] + ')</span>';
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

console.log('🏛️ [UnifiedGovernance] Full dashboard loaded (with popups)');
console.log('   📋 Open with: LawAIApp._openGovernanceDashboard()');
