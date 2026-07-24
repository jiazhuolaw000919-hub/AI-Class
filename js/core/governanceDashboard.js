/**
 * Unified Governance Dashboard — 完整融合版
 * 
 * 融合:
 * - Engine Governance Dashboard (Season 1-3) — 引擎健康、成熟度、合规
 * - Runtime Governance Dashboard (Part 49.7)  — Policy、Permission、Validation、Safety、AI
 * 
 * 提供完整 DevPanel 可视化面板，包含所有 section 渲染
 */

(function() {
    'use strict';
    
    window.LawAIApp = window.LawAIApp || {};
    
    // ============================================================
    // 0. 保留旧版（如果存在）
    // ============================================================
    if (window.LawAIApp.GovernanceDashboard && typeof window.LawAIApp.GovernanceDashboard._display === 'function') {
        console.log('[UnifiedGovernance] Preserving old Engine Governance Dashboard');
        window.LawAIApp.EngineGovernanceDashboard = window.LawAIApp.GovernanceDashboard;
    }

    // ============================================================
    // 1. Engine Governance Provider (旧版逻辑 → HTML 输出)
    // ============================================================
    const EngineGovernanceProvider = {
        type: 'ENGINE_GOVERNANCE',
        version: 'V3.x (Season 1-3)',
        
        _getData: function() {
            const health = window.LawAIApp.GovernanceHealth || window.governanceHealth;
            const manifest = window.LawAIApp.GovernanceManifest || window.governanceManifest;
            const validator = window.LawAIApp.GovernanceValidator || window.governanceValidator;
            
            if (!health || !manifest) return { available: false };
            
            const healthData = health.getHealth?.() || health;
            const manifestSummary = manifest.getSummary?.() || manifest;
            const validatorSummary = validator?.getSummary?.() || null;
            
            return {
                available: true,
                timestamp: Date.now(),
                engineCount: {
                    total: healthData.totalEngines || 0,
                    healthy: healthData.healthyCount || 0,
                    incomplete: healthData.incompleteCount || 0,
                    broken: healthData.brokenCount || 0
                },
                governanceScore: {
                    overall: healthData.overallScore || 0,
                    status: healthData.overallStatus || 'unknown',
                    coverage: healthData.coveragePercentage || 0
                },
                maturityDistribution: {
                    core: manifestSummary.core || 0,
                    business: manifestSummary.business || 0,
                    support: manifestSummary.support || 0,
                    experimental: manifestSummary.experimental || 0,
                    deprecated: manifestSummary.deprecated || 0
                },
                domainDistribution: manifestSummary.domains || {},
                topHealthy: healthData.topHealthy || [],
                needsAttention: healthData.needsAttention || [],
                violations: {
                    count: healthData.violations || 0,
                    details: validatorSummary?.violationsByType || {}
                },
                recommendations: (function() {
                    const recs = [];
                    if (healthData.brokenCount > 0) recs.push('Fix ' + healthData.brokenCount + ' broken engines');
                    if (healthData.incompleteCount > 0) recs.push('Complete ' + healthData.incompleteCount + ' incomplete engines');
                    if ((healthData.coveragePercentage || 0) < 80) recs.push('Improve governance coverage from ' + (healthData.coveragePercentage || 0) + '% to 80%+');
                    if ((healthData.overallScore || 0) < 70) recs.push('Address governance violations to improve score');
                    if (recs.length === 0) recs.push('All engines have excellent governance.');
                    return recs;
                })()
            };
        },
        
        renderHTML: function() {
            const d = this._getData();
            if (!d.available) return '<div class="gov-empty">⚠️ Engine Governance data unavailable (GovernanceHealth/Manifest not loaded)</div>';
            
            // Engine count cards
            const cards = [
                { icon: '⚙️', label: 'Total Engines', value: d.engineCount.total, cls: '' },
                { icon: '✅', label: 'Healthy', value: d.engineCount.healthy, cls: 'approved' },
                { icon: '⚠️', label: 'Incomplete', value: d.engineCount.incomplete, cls: 'warning' },
                { icon: '❌', label: 'Broken', value: d.engineCount.broken, cls: 'rejected' }
            ];
            
            // Maturity bar
            const maturityTotal = d.maturityDistribution.core + d.maturityDistribution.business + 
                                   d.maturityDistribution.support + d.maturityDistribution.experimental + 
                                   d.maturityDistribution.deprecated || 1;
            const maturityBars = [
                { label: 'Core', value: d.maturityDistribution.core, color: '#4caf50' },
                { label: 'Business', value: d.maturityDistribution.business, color: '#2196f3' },
                { label: 'Support', value: d.maturityDistribution.support, color: '#ff9800' },
                { label: 'Experimental', value: d.maturityDistribution.experimental, color: '#9c27b0' },
                { label: 'Deprecated', value: d.maturityDistribution.deprecated, color: '#f44336' }
            ];
            
            return [
                // Summary cards
                '<div class="gov-summary-grid">',
                cards.map(function(c) {
                    return '<div class="gov-summary-card">' +
                        '<div class="gov-card-icon">' + c.icon + '</div>' +
                        '<div class="gov-card-content">' +
                            '<div class="gov-card-label">' + c.label + '</div>' +
                            '<div class="gov-card-value ' + c.cls + '">' + c.value + '</div>' +
                        '</div></div>';
                }).join(''),
                '</div>',
                
                // Score & coverage
                '<div class="gov-detail-grid" style="margin-top:10px;">',
                '<div class="gov-detail-item"><span class="gov-detail-label">Governance Score</span><span class="gov-detail-value">' + d.governanceScore.overall + '%</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Coverage</span><span class="gov-detail-value">' + d.governanceScore.coverage + '%</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Status</span><span class="gov-detail-value">' + d.governanceScore.status + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Violations</span><span class="gov-detail-value ' + (d.violations.count > 0 ? 'rejected' : '') + '">' + d.violations.count + '</span></div>',
                '</div>',
                
                // Maturity distribution bar
                '<h4 style="margin:12px 0 6px;font-size:0.85em;color:#aaa;">Maturity Distribution</h4>',
                '<div class="gov-maturity-bar">',
                maturityBars.map(function(b) {
                    var pct = ((b.value / maturityTotal) * 100).toFixed(1);
                    return '<div class="gov-maturity-segment" style="flex:' + b.value + ';background:' + b.color + ';" title="' + b.label + ': ' + b.value + ' (' + pct + '%)"></div>';
                }).join(''),
                '</div>',
                '<div class="gov-maturity-legend">',
                maturityBars.map(function(b) {
                    return '<span class="gov-legend-item"><span class="gov-legend-dot" style="background:' + b.color + ';"></span>' + b.label + ' (' + b.value + ')</span>';
                }).join(''),
                '</div>',
                
                // Needs attention
                d.needsAttention.length > 0 ? [
                    '<div class="gov-recent-list" style="margin-top:12px;">',
                    '<h4>⚠️ Needs Attention</h4>',
                    d.needsAttention.slice(0, 5).map(function(e) {
                        return '<div class="gov-list-item">' +
                            '<span class="gov-list-text">' + (e.name || 'Unknown') + '</span>' +
                            '<span class="gov-list-value ' + (e.score < 50 ? 'rejected' : 'warning') + '">' + (e.score || '?') + '%</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : '',
                
                // Top healthy
                d.topHealthy.length > 0 ? [
                    '<div class="gov-recent-list" style="margin-top:12px;">',
                    '<h4>✅ Top Healthy Engines</h4>',
                    d.topHealthy.slice(0, 5).map(function(e) {
                        return '<div class="gov-list-item">' +
                            '<span class="gov-list-text">' + (e.name || 'Unknown') + '</span>' +
                            '<span class="gov-list-value approved">' + (e.score || '?') + '%</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : '',
                
                // Recommendations
                '<div class="gov-recent-list" style="margin-top:12px;">',
                '<h4>💡 Recommendations</h4>',
                d.recommendations.map(function(r) {
                    return '<div class="gov-list-item"><span class="gov-list-text">• ' + r + '</span></div>';
                }).join(''),
                '</div>',
                
                // Domain distribution
                Object.keys(d.domainDistribution).length > 0 ? [
                    '<div class="gov-detail-grid" style="margin-top:12px;">',
                    '<h4 style="grid-column:1/-1;margin:0;font-size:0.85em;color:#aaa;">Domain Distribution</h4>',
                    Object.entries(d.domainDistribution).map(function(entry) {
                        return '<div class="gov-detail-item"><span class="gov-detail-label">' + entry[0] + '</span><span class="gov-detail-value">' + entry[1] + '</span></div>';
                    }).join(''),
                    '</div>'
                ].join('') : ''
            ].join('');
        }
    };

    // ============================================================
    // 2. Runtime Governance Provider (Part 49 完整逻辑)
    // ============================================================
    const RuntimeGovernanceProvider = {
        type: 'RUNTIME_GOVERNANCE',
        version: 'V4.9.7 (Part 49)',
        
        _cache: { data: null, timestamp: 0, ttl: 2000 },
        
        _refreshCache: function() {
            if (this._cache.data && Date.now() - this._cache.timestamp < this._cache.ttl) return;
            
            this._cache.data = {
                policies: this._safeGet(function() { return window.LawAIApp.Policy?.getReport(); }) || { status: 'unavailable' },
                permissions: this._safeGet(function() { return window.LawAIApp.Permissions?.getReport(); }) || { status: 'unavailable' },
                validations: this._safeGet(function() { return window.LawAIApp.Validation?.getReport(); }) || { status: 'unavailable' },
                safety: this._safeGet(function() { return window.LawAIApp.Safety?.getReport(); }) || { status: 'unavailable' },
                aiGovernance: this._safeGet(function() { return window.LawAIApp.AIGovernance?.getReport(); }) || { status: 'unavailable' }
            };
            this._cache.timestamp = Date.now();
        },
        
        _safeGet: function(fn) {
            try { return fn(); } catch(e) { return null; }
        },
        
        renderOverviewHTML: function() {
            this._refreshCache();
            const p = this._cache.data.policies || {};
            const pm = this._cache.data.permissions || {};
            const v = this._cache.data.validations || {};
            const s = this._cache.data.safety || {};
            const ai = this._cache.data.aiGovernance || {};
            
            const cards = [
                { icon: '📋', label: 'Policies', value: (p.policies?.active || 0) + '/' + (p.policies?.total || 0), sub: 'active/total' },
                { icon: '🔑', label: 'Permissions', value: pm.permissions?.active || 0, sub: (pm.subjects?.total || 0) + ' subjects' },
                { icon: '✅', label: 'Validations', value: v.validations?.total || 0, sub: (v.validators?.total || 0) + ' validators' },
                { icon: '🛡️', label: 'Safety Locks', value: s.locks?.active || 0, sub: (s.actions?.incidents || 0) + ' incidents' },
                { icon: '🤖', label: 'AI Decisions', value: ai.decisions?.total || 0, sub: 'Level ' + (ai.aiLevel?.current ?? '?') },
                { icon: '📝', label: 'Audit Entries', value: this._countAuditEntries(), sub: 'across all layers' }
            ];
            
            return [
                '<div class="gov-summary-grid">',
                cards.map(function(c) {
                    return '<div class="gov-summary-card">' +
                        '<div class="gov-card-icon">' + c.icon + '</div>' +
                        '<div class="gov-card-content">' +
                            '<div class="gov-card-label">' + c.label + '</div>' +
                            '<div class="gov-card-value">' + c.value + '</div>' +
                            '<div class="gov-card-sub">' + c.sub + '</div>' +
                        '</div></div>';
                }).join(''),
                '</div>'
            ].join('');
        },
        
        _countAuditEntries: function() {
            let count = 0;
            try { count += window.LawAIApp.Policy?.getDecisions?.(1)?.length || 0; } catch(e) {}
            try { count += window.LawAIApp.Permissions?.getAccessHistory?.(1)?.length || 0; } catch(e) {}
            try { count += window.LawAIApp.Validation?.getValidationHistory?.(1)?.length || 0; } catch(e) {}
            try { count += window.LawAIApp.Safety?.getAuditTrail?.(1)?.length || 0; } catch(e) {}
            try { count += window.LawAIApp.AIGovernance?.getDecisionHistory?.(1)?.length || 0; } catch(e) {}
            return count;
        },
        
        renderPoliciesHTML: function() {
            this._refreshCache();
            const data = this._cache.data.policies || {};
            const recentDecisions = data.recentDecisions || [];
            
            return [
                '<div class="gov-status-row">',
                '<span class="gov-badge ' + this._statusClass(data.status) + '">' + (data.status || 'UNKNOWN') + '</span>',
                '<span>Active: <strong>' + (data.policies?.active || 0) + '</strong> / Total: <strong>' + (data.policies?.total || 0) + '</strong></span>',
                '</div>',
                data.policies?.byCategory ? [
                    '<div class="gov-detail-grid">',
                    Object.entries(data.policies.byCategory).map(function(entry) {
                        return '<div class="gov-detail-item"><span class="gov-detail-label">' + entry[0] + '</span><span class="gov-detail-value">' + entry[1] + '</span></div>';
                    }).join(''),
                    '</div>'
                ].join('') : '<p class="gov-empty">No policy category data</p>',
                recentDecisions.length > 0 ? [
                    '<div class="gov-recent-list"><h4>Recent Decisions</h4>',
                    recentDecisions.slice(-8).reverse().map(function(d) {
                        return '<div class="gov-list-item">' +
                            '<span class="gov-decision-badge ' + (d.decision || '').toLowerCase() + '">' + (d.decision || '?') + '</span>' +
                            '<span class="gov-list-text">' + (d.request || 'unknown') + '</span>' +
                            '<span class="gov-list-time">' + _formatTime(d.timestamp) + '</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : '',
                data.rules ? '<div class="gov-rules-list">' + data.rules.map(function(r) { return '<div class="gov-rule-item">' + r + '</div>'; }).join('') + '</div>' : ''
            ].join('');
        },
        
        renderPermissionsHTML: function() {
            this._refreshCache();
            const data = this._cache.data.permissions || {};
            
            return [
                '<div class="gov-status-row">',
                '<span class="gov-badge ' + this._statusClass(data.status) + '">' + (data.status || 'UNKNOWN') + '</span>',
                '<span>Grant Rate: <strong>' + (data.access?.grantRate || 'N/A') + '</strong></span>',
                '</div>',
                '<div class="gov-detail-grid">',
                '<div class="gov-detail-item"><span class="gov-detail-label">Subjects</span><span class="gov-detail-value">' + (data.subjects?.total || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Resources</span><span class="gov-detail-value">' + (data.resources?.total || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Active Permissions</span><span class="gov-detail-value">' + (data.permissions?.active || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Access Attempts</span><span class="gov-detail-value">' + (data.access?.total || 0) + '</span></div>',
                '</div>',
                data.permissions?.bySubject ? [
                    '<div class="gov-subject-list"><h4>Permissions by Subject</h4>',
                    Object.entries(data.permissions.bySubject).map(function(entry) {
                        return '<div class="gov-list-item"><span class="gov-list-text">' + entry[0] + '</span><span class="gov-list-value">' + entry[1] + ' permissions</span></div>';
                    }).join(''),
                    '</div>'
                ].join('') : ''
            ].join('');
        },
        
        renderValidationsHTML: function() {
            this._refreshCache();
            const data = this._cache.data.validations || {};
            const recentValidations = data.recentValidations || [];
            
            return [
                '<div class="gov-status-row">',
                '<span class="gov-badge ' + this._statusClass(data.status) + '">' + (data.status || 'UNKNOWN') + '</span>',
                '<span>Validators: <strong>' + (data.validators?.total || 0) + '</strong></span>',
                '</div>',
                data.validations?.byRisk ? [
                    '<div class="gov-detail-grid">',
                    Object.entries(data.validations.byRisk).map(function(entry) {
                        return '<div class="gov-detail-item"><span class="gov-detail-label risk-' + entry[0].toLowerCase() + '">⚠ ' + entry[0] + '</span><span class="gov-detail-value">' + entry[1] + '</span></div>';
                    }).join(''),
                    '</div>'
                ].join('') : '',
                data.validations?.byDecision ? [
                    '<div class="gov-detail-grid">',
                    Object.entries(data.validations.byDecision).map(function(entry) {
                        return '<div class="gov-detail-item"><span class="gov-detail-label">' + entry[0] + '</span><span class="gov-detail-value">' + entry[1] + '</span></div>';
                    }).join(''),
                    '</div>'
                ].join('') : '',
                recentValidations.length > 0 ? [
                    '<div class="gov-recent-list"><h4>Recent Validations</h4>',
                    recentValidations.slice(-5).reverse().map(function(v) {
                        return '<div class="gov-list-item">' +
                            '<span class="gov-decision-badge ' + (v.decision || '').toLowerCase() + '">' + (v.decision || '?') + '</span>' +
                            '<span class="gov-list-text">' + (v.request?.action || 'unknown') + '</span>' +
                            '<span class="gov-list-risk risk-' + (v.risk?.label || 'low').toLowerCase() + '">' + (v.risk?.label || '?') + '</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : ''
            ].join('');
        },
        
        renderSafetyHTML: function() {
            this._refreshCache();
            const data = this._cache.data.safety || {};
            const activeLocks = data.locks?.list || [];
            
            return [
                '<div class="gov-status-row">',
                '<span class="gov-badge ' + this._statusClass(data.status) + '">' + (data.status || 'SAFE') + '</span>',
                '<span>Active Locks: <strong>' + (data.locks?.active || 0) + '</strong></span>',
                '</div>',
                activeLocks.length > 0 ? [
                    '<div class="gov-locks-list"><h4>🔒 Active Safety Locks</h4>',
                    activeLocks.map(function(lock) {
                        return '<div class="gov-list-item gov-lock-item">' +
                            '<span class="gov-lock-icon">🔒</span>' +
                            '<div class="gov-lock-info"><strong>' + lock.id + '</strong>' +
                                '<span class="gov-lock-scope">Scope: ' + lock.scope + '</span>' +
                                '<span class="gov-lock-reason">' + lock.reason + '</span></div>' +
                            '<span class="gov-list-time">' + _formatTime(lock.activatedAt) + '</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : '<p class="gov-empty">No active safety locks</p>',
                '<div class="gov-detail-grid" style="margin-top:10px;">',
                '<div class="gov-detail-item"><span class="gov-detail-label">Approved</span><span class="gov-detail-value approved">' + (data.actions?.approved || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Blocked</span><span class="gov-detail-value rejected">' + (data.actions?.blocked || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Snapshots</span><span class="gov-detail-value">' + (data.snapshots?.total || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Incidents</span><span class="gov-detail-value ' + ((data.actions?.incidents || 0) > 0 ? 'rejected' : '') + '">' + (data.actions?.incidents || 0) + '</span></div>',
                '</div>',
                data.rules ? '<div class="gov-rules-list" style="margin-top:10px;">' + data.rules.map(function(r) { return '<div class="gov-rule-item">' + r + '</div>'; }).join('') + '</div>' : ''
            ].join('');
        },
        
        renderAIGovernanceHTML: function() {
            this._refreshCache();
            const data = this._cache.data.aiGovernance || {};
            const recentDecisions = data.recentDecisions || [];
            
            return [
                '<div class="gov-status-row">',
                '<span class="gov-badge ' + this._statusClass(data.status) + '">' + (data.status || 'UNKNOWN') + '</span>',
                '<span>Level: <strong>' + (data.aiLevel?.name || '?') + '</strong> (' + (data.aiLevel?.current ?? '?') + ')</span>',
                '</div>',
                '<div class="gov-detail-grid">',
                '<div class="gov-detail-item"><span class="gov-detail-label">Total Decisions</span><span class="gov-detail-value">' + (data.decisions?.total || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Approved</span><span class="gov-detail-value approved">' + (data.decisions?.APPROVED || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Rejected</span><span class="gov-detail-value rejected">' + (data.decisions?.REJECTED || 0) + '</span></div>',
                '<div class="gov-detail-item"><span class="gov-detail-label">Pending</span><span class="gov-detail-value ' + ((data.decisions?.REQUIRES_APPROVAL || 0) > 0 ? 'warning' : '') + '">' + (data.decisions?.REQUIRES_APPROVAL || 0) + '</span></div>',
                '</div>',
                '<div class="gov-detail-row"><span class="gov-detail-label">Avg Confidence</span><span class="gov-detail-value">' + (data.decisions?.avgConfidence || 'N/A') + '</span></div>',
                data.aiLevel?.allowedActions ? [
                    '<div class="gov-capability-list"><h4>Allowed Actions</h4><div class="gov-tags">',
                    data.aiLevel.allowedActions.map(function(a) { return '<span class="gov-tag">' + a + '</span>'; }).join(''),
                    data.aiLevel.requiresApproval ? '<span class="gov-badge warning" style="margin-left:8px;">⚠ Requires Approval</span>' : '',
                    '</div></div>'
                ].join('') : '',
                recentDecisions.length > 0 ? [
                    '<div class="gov-recent-list"><h4>Recent AI Decisions</h4>',
                    recentDecisions.slice(-5).reverse().map(function(d) {
                        return '<div class="gov-list-item">' +
                            '<span class="gov-decision-badge ' + (d.finalDecision || '').toLowerCase() + '">' + (d.finalDecision || '?') + '</span>' +
                            '<span class="gov-list-text" title="' + (d.recommendation || '') + '">' + ((d.recommendation || '').substring(0, 60)) + '</span>' +
                            '<span class="gov-list-confidence">' + (d.confidence ? (d.confidence * 100).toFixed(0) + '%' : '?') + '</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : ''
            ].join('');
        },
        
        renderAuditHTML: function() {
            this._refreshCache();
            // 聚合所有 audit 数据
            const entries = [];
            const addEntries = function(fn, source) {
                try {
                    const result = fn();
                    if (Array.isArray(result)) {
                        result.slice(-15).forEach(function(e) {
                            entries.push({
                                source: source,
                                action: e.action || e.decision || 'unknown',
                                detail: (e.reason || e.detail || JSON.stringify(e).substring(0, 60)),
                                timestamp: e.timestamp
                            });
                        });
                    }
                } catch(e) {}
            };
            
            addEntries(function() { return window.LawAIApp?.Policy?.getDecisions?.(15); }, 'Policy');
            addEntries(function() { return window.LawAIApp?.Permissions?.getAccessHistory?.(15); }, 'Permission');
            addEntries(function() { return window.LawAIApp?.Validation?.getValidationHistory?.(15); }, 'Validation');
            addEntries(function() { return window.LawAIApp?.Safety?.getAuditTrail?.(15); }, 'Safety');
            addEntries(function() { return window.LawAIApp?.AIGovernance?.getDecisionHistory?.(15); }, 'AI Gov');
            
            entries.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
            
            return [
                '<div class="gov-status-row">',
                '<span>Total Entries: <strong>' + entries.length + '</strong></span>',
                '</div>',
                entries.length > 0 ? [
                    '<div class="gov-audit-list">',
                    entries.slice(0, 20).map(function(entry) {
                        return '<div class="gov-audit-item">' +
                            '<span class="gov-audit-time">' + _formatTime(entry.timestamp) + '</span>' +
                            '<span class="gov-audit-source">[' + entry.source + ']</span>' +
                            '<span class="gov-audit-action">' + (entry.action || '?') + '</span>' +
                            '<span class="gov-audit-detail">' + ((entry.detail || '').substring(0, 50)) + '</span>' +
                        '</div>';
                    }).join(''),
                    '</div>'
                ].join('') : '<p class="gov-empty">No audit entries</p>'
            ].join('');
        },
        
        renderHealthHTML: function() {
            this._refreshCache();
            const layers = [];
            
            const addLayer = function(name, icon, getHealthFn) {
                try {
                    const h = getHealthFn();
                    layers.push({ name: name, icon: icon, status: h?.status || 'UNKNOWN', detail: h?.version || '' });
                } catch(e) {
                    layers.push({ name: name, icon: icon, status: 'ERROR', detail: e.message });
                }
            };
            
            addLayer('Policy Engine', '📋', function() { return window.LawAIApp?.Policy?.getHealth?.(); });
            addLayer('Permission System', '🔑', function() { return window.LawAIApp?.Permissions?.getHealth?.(); });
            addLayer('Validation System', '✅', function() { return window.LawAIApp?.Validation?.getHealth?.(); });
            addLayer('Safety & Compliance', '🛡️', function() { return window.LawAIApp?.Safety?.getHealth?.(); });
            addLayer('AI Governance', '🤖', function() { return window.LawAIApp?.AIGovernance?.getHealth?.(); });
            
            // 添加 Engine Governance 状态
            const egData = EngineGovernanceProvider._getData();
            layers.push({
                name: 'Engine Governance',
                icon: '⚙️',
                status: egData.available ? (egData.governanceScore?.status || 'HEALTHY') : 'UNAVAILABLE',
                detail: egData.available ? 'Score: ' + egData.governanceScore.overall + '%' : 'Not loaded'
            });
            
            layers.push({
                name: 'Unified Dashboard',
                icon: '📊',
                status: 'HEALTHY',
                detail: 'V5.0.0'
            });
            
            // 计算 overall
            const statuses = layers.map(function(l) { return l.status; });
            let overall = 'HEALTHY';
            if (statuses.some(function(s) { return s === 'ERROR' || s === 'CRITICAL'; })) overall = 'DEGRADED';
            if (statuses.filter(function(s) { return s === 'ERROR'; }).length > 2) overall = 'CRITICAL';
            
            return [
                '<div class="gov-health-grid">',
                layers.map(function(layer) {
                    return '<div class="gov-health-card ' + (layer.status || 'unknown').toLowerCase() + '">' +
                        '<div class="gov-health-icon">' + layer.icon + '</div>' +
                        '<div class="gov-health-info"><strong>' + layer.name + '</strong>' +
                            '<span class="gov-badge ' + _statusClass(layer.status) + '">' + (layer.status || '?') + '</span>' +
                            '<span class="gov-health-detail">' + (layer.detail || '') + '</span></div>' +
                    '</div>';
                }).join(''),
                '</div>',
                '<div class="gov-overall-health">' +
                    '<span>Overall Status:</span>' +
                    '<span class="gov-badge ' + _statusClass(overall) + '">' + overall + '</span>' +
                    '<span class="gov-health-meta">Unified Dashboard V5.0.0 | Engine V3.x + Runtime V4.9.7</span>' +
                '</div>'
            ].join('');
        },
        
        _statusClass: function(status) {
            if (!status) return '';
            const s = String(status).toLowerCase();
            if (s === 'healthy' || s === 'active' || s === 'safe' || s === 'running') return 'status-healthy';
            if (s === 'warning' || s === 'restrictive' || s === 'degraded') return 'status-warning';
            if (s === 'critical' || s === 'error' || s === 'locked_down') return 'status-critical';
            return 'status-unknown';
        }
    };

    // ============================================================
    // 3. 辅助函数
    // ============================================================
    function _formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
            if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
            return date.toLocaleDateString();
        } catch(e) { return String(timestamp); }
    }
    
    function _statusClass(status) {
        if (!status) return '';
        const s = String(status).toLowerCase();
        if (s === 'healthy' || s === 'active' || s === 'safe' || s === 'running') return 'status-healthy';
        if (s === 'warning' || s === 'restrictive' || s === 'degraded') return 'status-warning';
        if (s === 'critical' || s === 'error' || s === 'locked_down') return 'status-critical';
        return 'status-unknown';
    }

    // ============================================================
    // 4. Unified Governance Dashboard — 主类
    // ============================================================
    class UnifiedGovernanceDashboard {
        constructor() {
            this.version = 'V5.0.0';
            this.initialized = false;
            this.containerEl = null;
            this.currentTab = 'overview';
            this.tabs = [
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'engine', label: '⚙️ Engine Gov', icon: '⚙️' },
                { id: 'policies', label: '📋 Policies', icon: '📋' },
                { id: 'permissions', label: '🔑 Permissions', icon: '🔑' },
                { id: 'validations', label: '✅ Validations', icon: '✅' },
                { id: 'safety', label: '🛡️ Safety', icon: '🛡️' },
                { id: 'ai', label: '🤖 AI Gov', icon: '🤖' },
                { id: 'audit', label: '📝 Audit', icon: '📝' },
                { id: 'health', label: '💚 Health', icon: '💚' }
            ];
        }
        
        init() {
            if (this.initialized) return;
            this.initialized = true;
            
            // 初始化旧版 Engine Governance Dashboard
            if (window.LawAIApp.EngineGovernanceDashboard?.init) {
                window.LawAIApp.EngineGovernanceDashboard.init();
            }
            
            console.log('[UnifiedGovernanceDashboard] V5.0.0 — Engine V3.x + Runtime V4.9.7');
            this._mountToDevPanel();
        }
        
        _mountToDevPanel() {
            const self = this;
            const tryMount = function() {
                if (window.LawAIApp?.Debug?.DevPanel?.addSection) {
                    window.LawAIApp.Debug.DevPanel.addSection('unifiedGovernance', {
                        label: '🏛️ Governance',
                        order: 50,
                        render: function(container) { self._render(container); },
                        refresh: function() { self.refresh(); }
                    });
                    console.log('[UnifiedGovernance] Mounted to DevPanel');
                } else {
                    setTimeout(tryMount, 500);
                }
            };
            setTimeout(tryMount, 1000);
        }
        
        refresh() {
            RuntimeGovernanceProvider._cache.timestamp = 0; // 清除缓存
            if (this.containerEl) this._renderContent();
        }
        
        _render(container) {
            this.containerEl = container;
            
            // 注入样式（只注入一次）
            if (!document.getElementById('unified-gov-styles')) {
                const styles = this._getStyles();
                document.head.insertAdjacentHTML('beforeend', '<style id="unified-gov-styles">' + styles + '</style>');
            }
            
            container.innerHTML = this._buildShell();
            this._bindEvents();
            this._renderContent();
        }
        
        _buildShell() {
            const self = this;
            return [
                '<div class="unified-gov-dashboard">',
                '  <div class="unified-gov-header">',
                '    <h2>🏛️ Unified Governance</h2>',
                '    <div class="unified-gov-header-meta">',
                '      <span class="unified-gov-version">V5.0.0</span>',
                '      <span class="unified-gov-badge">Engine V3.x</span>',
                '      <span class="unified-gov-badge">Runtime V4.9.7</span>',
                '      <span class="unified-gov-refresh" id="unified-gov-refresh">🔄 Refresh</span>',
                '    </div>',
                '  </div>',
                '  <div class="unified-gov-tabs" id="unified-gov-tabs">',
                this.tabs.map(function(t, i) {
                    return '<button class="unified-gov-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
                }).join(''),
                '  </div>',
                '  <div class="unified-gov-content" id="unified-gov-content"></div>',
                '  <div class="unified-gov-footer">',
                '    <span>Engine Governance (Season 1-3) + Runtime Governance (Part 49)</span>',
                '    <span id="unified-gov-timestamp">Last refresh: just now</span>',
                '  </div>',
                '</div>'
            ].join('');
        }
        
        _bindEvents() {
            const self = this;
            const container = this.containerEl;
            
            // Tab 切换
            const tabs = container.querySelectorAll('.unified-gov-tab');
            tabs.forEach(function(tab) {
                tab.addEventListener('click', function() {
                    tabs.forEach(function(t) { t.classList.remove('active'); });
                    tab.classList.add('active');
                    self.currentTab = tab.dataset.tab;
                    self._renderContent();
                });
            });
            
            // Refresh 按钮
            const refreshBtn = container.querySelector('#unified-gov-refresh');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    self.refresh();
                });
            }
        }
        
        _renderContent() {
            const contentEl = this.containerEl?.querySelector('#unified-gov-content');
            if (!contentEl) return;
            
            let html = '';
            
            switch (this.currentTab) {
                case 'overview':
                    html = this._renderOverviewTab();
                    break;
                case 'engine':
                    html = this._renderEngineTab();
                    break;
                case 'policies':
                    html = this._renderSectionHTML('📋 Policy Engine', RuntimeGovernanceProvider.renderPoliciesHTML());
                    break;
                case 'permissions':
                    html = this._renderSectionHTML('🔑 Permission System', RuntimeGovernanceProvider.renderPermissionsHTML());
                    break;
                case 'validations':
                    html = this._renderSectionHTML('✅ Validation System', RuntimeGovernanceProvider.renderValidationsHTML());
                    break;
                case 'safety':
                    html = this._renderSectionHTML('🛡️ Safety & Compliance', RuntimeGovernanceProvider.renderSafetyHTML());
                    break;
                case 'ai':
                    html = this._renderSectionHTML('🤖 AI Governance', RuntimeGovernanceProvider.renderAIGovernanceHTML());
                    break;
                case 'audit':
                    html = this._renderSectionHTML('📝 Audit Trail', RuntimeGovernanceProvider.renderAuditHTML());
                    break;
                case 'health':
                    html = this._renderSectionHTML('💚 Governance Health', RuntimeGovernanceProvider.renderHealthHTML());
                    break;
                default:
                    html = this._renderOverviewTab();
            }
            
            contentEl.innerHTML = html;
            
            // 更新时间戳
            const tsEl = this.containerEl?.querySelector('#unified-gov-timestamp');
            if (tsEl) tsEl.textContent = 'Last refresh: ' + _formatTime(new Date().toISOString());
        }
        
        _renderOverviewTab() {
            return [
                '<div class="unified-gov-overview">',
                '  <!-- Runtime Governance Summary -->',
                '  <div class="unified-gov-section">',
                '    <h3>🛡️ Runtime Governance <span class="unified-gov-section-ver">Part 49</span></h3>',
                RuntimeGovernanceProvider.renderOverviewHTML(),
                '  </div>',
                '  <!-- Engine Governance Summary -->',
                '  <div class="unified-gov-section">',
                '    <h3>⚙️ Engine Governance <span class="unified-gov-section-ver">Season 1-3</span></h3>',
                EngineGovernanceProvider.renderHTML(),
                '  </div>',
                '</div>'
            ].join('');
        }
        
        _renderEngineTab() {
            return this._renderSectionHTML(
                '⚙️ Engine Governance <span class="unified-gov-section-ver">Season 1-3</span>',
                EngineGovernanceProvider.renderHTML()
            );
        }
        
        _renderSectionHTML(title, content) {
            return [
                '<div class="unified-gov-section">',
                '  <h3>' + title + '</h3>',
                content,
                '</div>'
            ].join('');
        }
        
        _getStyles() {
            return `
.unified-gov-dashboard{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e0e0e0;background:#1a1a2e;border-radius:8px;padding:16px;max-height:80vh;overflow-y:auto}
.unified-gov-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #2a2a4a;margin-bottom:12px}
.unified-gov-header h2{margin:0;font-size:1.3em;color:#fff}
.unified-gov-header-meta{display:flex;gap:10px;align-items:center;font-size:0.8em;color:#888}
.unified-gov-badge{padding:2px 8px;background:#2a2a5a;border-radius:10px;font-size:0.75em;color:#81d4fa}
.unified-gov-refresh{cursor:pointer;color:#4fc3f7}
.unified-gov-refresh:hover{color:#81d4fa}
.unified-gov-tabs{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:14px;border-bottom:1px solid #2a2a4a;padding-bottom:8px}
.unified-gov-tab{background:transparent;border:1px solid #333;color:#aaa;padding:6px 12px;border-radius:4px 4px 0 0;cursor:pointer;font-size:0.82em;transition:all 0.2s}
.unified-gov-tab:hover{background:#2a2a4a;color:#fff}
.unified-gov-tab.active{background:#3a3a6a;color:#fff;border-color:#5a5a9a}
.unified-gov-content{min-height:300px}
.unified-gov-section{background:#16213e;border-radius:6px;padding:14px;margin-bottom:12px;border:1px solid #2a2a4a}
.unified-gov-section h3{margin:0 0 12px 0;font-size:1.05em;color:#fff;border-bottom:1px solid #2a2a4a;padding-bottom:8px}
.unified-gov-section-ver{font-size:0.65em;color:#888;font-weight:normal;margin-left:8px}
.unified-gov-overview{display:flex;flex-direction:column;gap:12px}
.gov-summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.gov-summary-card{background:#1a1a35;border-radius:6px;padding:12px;display:flex;align-items:center;gap:10px;border:1px solid #2a2a4a}
.gov-card-icon{font-size:1.5em}
.gov-card-content{flex:1}
.gov-card-label{font-size:0.75em;color:#888}
.gov-card-value{font-size:1.2em;font-weight:bold;color:#fff}
.gov-card-sub{font-size:0.7em;color:#666}
.gov-detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:8px 0}
.gov-detail-item{background:#1a1a35;padding:8px 12px;border-radius:4px;text-align:center}
.gov-detail-label{display:block;font-size:0.7em;color:#888;margin-bottom:4px}
.gov-detail-value{font-size:1.05em;font-weight:bold;color:#fff}
.gov-detail-row{display:flex;justify-content:space-between;padding:8px 12px;background:#1a1a35;border-radius:4px;margin:6px 0}
.gov-status-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;font-size:0.9em}
.gov-badge{padding:3px 10px;border-radius:12px;font-size:0.75em;font-weight:bold;text-transform:uppercase}
.gov-badge.warning{background:#ff9800;color:#000}
.gov-recent-list,.gov-locks-list,.gov-audit-list,.gov-subject-list{margin-top:10px}
.gov-recent-list h4,.gov-locks-list h4,.gov-subject-list h4,.gov-capability-list h4{font-size:0.85em;color:#aaa;margin:0 0 6px 0}
.gov-list-item{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1a1a35;border-radius:4px;margin-bottom:4px;font-size:0.8em}
.gov-decision-badge{padding:2px 8px;border-radius:3px;font-size:0.7em;font-weight:bold;text-transform:uppercase;min-width:55px;text-align:center}
.gov-decision-badge.approved,.gov-decision-badge.allow{background:#4caf50;color:#000}
.gov-decision-badge.rejected,.gov-decision-badge.deny,.gov-decision-badge.blocked{background:#f44336;color:#fff}
.gov-decision-badge.requires_approval,.gov-decision-badge.review{background:#ff9800;color:#000}
.gov-list-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gov-list-time{font-size:0.75em;color:#666}
.gov-list-risk{font-size:0.7em;padding:2px 6px;border-radius:3px}
.gov-list-confidence{font-size:0.8em;color:#4fc3f7}
.gov-list-value{font-size:0.8em;color:#4fc3f7}
.gov-list-action{font-size:0.75em;color:#aaa}
.gov-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.gov-tag{padding:3px 10px;background:#2a2a5a;border-radius:12px;font-size:0.75em;color:#81d4fa}
.gov-rules-list{margin-top:10px}
.gov-rule-item{font-size:0.75em;color:#888;padding:3px 0;border-bottom:1px solid #1a1a35}
.gov-lock-item{border-left:3px solid #f44336;padding-left:10px}
.gov-lock-icon{font-size:1.2em}
.gov-lock-info{display:flex;flex-direction:column;gap:2px;flex:1}
.gov-lock-scope{font-size:0.7em;color:#ff9800}
.gov-lock-reason{font-size:0.75em;color:#aaa}
.gov-audit-item{display:flex;gap:8px;padding:4px 8px;font-size:0.73em;border-bottom:1px solid #1a1a35;flex-wrap:wrap}
.gov-audit-time{color:#666;min-width:65px}
.gov-audit-source{color:#81d4fa;min-width:80px}
.gov-audit-action{color:#4fc3f7;min-width:100px}
.gov-audit-detail{color:#888;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gov-health-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-bottom:12px}
.gov-health-card{display:flex;align-items:center;gap:12px;padding:12px;background:#1a1a35;border-radius:6px;border:1px solid #2a2a4a}
.gov-health-card.healthy{border-left:3px solid #4caf50}
.gov-health-card.warning,.gov-health-card.degraded{border-left:3px solid #ff9800}
.gov-health-card.critical,.gov-health-card.error{border-left:3px solid #f44336}
.gov-health-icon{font-size:1.8em}
.gov-health-info{display:flex;flex-direction:column;gap:4px;flex:1}
.gov-health-detail{font-size:0.75em;color:#888}
.gov-overall-health{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#1a1a35;border-radius:6px;font-size:0.9em}
.gov-health-meta{font-size:0.75em;color:#666;margin-left:auto}
.gov-empty{color:#666;font-style:italic;padding:10px;text-align:center}
.gov-maturity-bar{display:flex;height:24px;border-radius:4px;overflow:hidden;margin:8px 0}
.gov-maturity-segment{transition:all 0.3s}
.gov-maturity-segment:hover{filter:brightness(1.3)}
.gov-maturity-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:0.75em;color:#aaa}
.gov-legend-item{display:flex;align-items:center;gap:4px}
.gov-legend-dot{display:inline-block;width:10px;height:10px;border-radius:50%}
.unified-gov-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;margin-top:14px;border-top:1px solid #2a2a4a;font-size:0.75em;color:#666}
.status-healthy{background:#4caf50!important;color:#000!important}
.status-warning{background:#ff9800!important;color:#000!important}
.status-critical{background:#f44336!important;color:#fff!important}
.status-unknown{background:#666!important;color:#fff!important}
.approved{color:#4caf50}
.rejected{color:#f44336}
.warning{color:#ff9800}
.risk-low{background:#4caf50;color:#000}
.risk-medium{background:#ff9800;color:#000}
.risk-high{background:#f44336;color:#fff}
.risk-critical{background:#b71c1c;color:#fff}
.unified-gov-dashboard::-webkit-scrollbar{width:6px}
.unified-gov-dashboard::-webkit-scrollbar-track{background:#1a1a2e}
.unified-gov-dashboard::-webkit-scrollbar-thumb{background:#3a3a5a;border-radius:3px}
`;
        }
    }

    // ============================================================
    // 5. 导出 & 向后兼容
    // ============================================================
    const instance = new UnifiedGovernanceDashboard();
    window.LawAIApp.UnifiedGovernanceDashboard = instance;
    
    // 向后兼容别名
    window.governanceDashboard = {
        getDashboard: function() { return EngineGovernanceProvider._getData(); },
        getSummary: function() {
            const d = EngineGovernanceProvider._getData();
            return d.available ? {
                score: d.governanceScore.overall,
                status: d.governanceScore.status,
                totalEngines: d.engineCount.total,
                healthy: d.engineCount.healthy,
                broken: d.engineCount.broken,
                coverage: d.governanceScore.coverage
            } : { status: 'unavailable' };
        },
        init: function() { instance.init(); },
        generate: function() { return EngineGovernanceProvider._getData(); }
    };
    
    // 自动初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() { instance.init(); }, 1500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() { instance.init(); }, 1500);
        });
    }
    
    console.log('📊 Unified Governance Dashboard V5.0.0 ready (Engine V3.x + Runtime V4.9.7) | ' + instance.tabs.length + ' tabs');
})();
