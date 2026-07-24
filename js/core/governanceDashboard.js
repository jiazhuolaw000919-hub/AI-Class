/**
 * Unified Governance Dashboard
 * 
 * 融合：
 * - Engine Governance Dashboard (Season 1-3) — 引擎健康、成熟度、合规
 * - Runtime Governance Dashboard (Part 49.7)  — Policy、Permission、Validation、Safety、AI
 * 
 * 提供统一的 DevPanel 入口
 */

(function() {
    'use strict';
    
    window.LawAIApp = window.LawAIApp || {};
    
    // ============================================================
    // 1. 保存旧版 Engine Governance Dashboard（如果已加载）
    // ============================================================
    if (window.LawAIApp.GovernanceDashboard && !window.LawAIApp.GovernanceDashboard._isRuntime) {
        console.log('[UnifiedGovernance] Detected old Engine Governance Dashboard — preserving as EngineGovernanceDashboard');
        window.LawAIApp.EngineGovernanceDashboard = window.LawAIApp.GovernanceDashboard;
    }
    
    // ============================================================
    // 2. Engine Governance Dashboard (旧版增强 — 保留所有功能)
    // ============================================================
    if (!window.LawAIApp.EngineGovernanceDashboard) {
        window.LawAIApp.EngineGovernanceDashboard = {
            initialized: false,
            dashboardData: null,
            type: 'ENGINE_GOVERNANCE',
            version: 'V3.x (Season 1-3)',
            
            init: function() {
                if (this.initialized) return;
                this.initialized = true;
                console.log('[EngineGovernanceDashboard] Initialized.');
                this.generate();
            },
            
            generate: function() {
                console.log('[EngineGovernanceDashboard] Generating engine governance report...');
                
                var health = window.LawAIApp.GovernanceHealth || window.governanceHealth;
                var manifest = window.LawAIApp.GovernanceManifest || window.governanceManifest;
                var validator = window.LawAIApp.GovernanceValidator || window.governanceValidator;
                
                if (!health || !manifest) {
                    console.warn('[EngineGovernanceDashboard] Dependencies not available.');
                    this.dashboardData = { status: 'unavailable', error: 'Dependencies missing' };
                    return this.dashboardData;
                }
                
                var healthData = health.getHealth();
                var manifestSummary = manifest.getSummary();
                var validatorSummary = validator ? validator.getSummary() : null;
                
                this.dashboardData = {
                    timestamp: Date.now(),
                    type: 'ENGINE_GOVERNANCE',
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
                        details: validatorSummary ? validatorSummary.violationsByType : {}
                    },
                    recommendations: (function() {
                        var recs = [];
                        if (healthData.brokenCount > 0) recs.push('Fix ' + healthData.brokenCount + ' broken engines');
                        if (healthData.incompleteCount > 0) recs.push('Complete ' + healthData.incompleteCount + ' incomplete engines');
                        if (healthData.coveragePercentage < 80) recs.push('Improve governance coverage from ' + healthData.coveragePercentage + '% to 80%+');
                        if (healthData.overallScore < 70) recs.push('Address governance violations to improve score');
                        if (recs.length === 0) recs.push('All engines have excellent governance.');
                        return recs;
                    })()
                };
                
                return this.dashboardData;
            },
            
            getDashboard: function() {
                if (!this.dashboardData) this.generate();
                return this.dashboardData;
            },
            
            getSummary: function() {
                if (!this.dashboardData) this.generate();
                return {
                    type: 'ENGINE_GOVERNANCE',
                    score: this.dashboardData.governanceScore.overall,
                    status: this.dashboardData.governanceScore.status,
                    totalEngines: this.dashboardData.engineCount.total,
                    healthy: this.dashboardData.engineCount.healthy,
                    broken: this.dashboardData.engineCount.broken,
                    coverage: this.dashboardData.governanceScore.coverage
                };
            },
            
            // 生成 HTML 摘要（给统一面板用）
            renderSummaryHTML: function() {
                if (!this.dashboardData) this.generate();
                var d = this.dashboardData;
                if (d.status === 'unavailable') return '<p class="gov-empty">Engine Governance data unavailable</p>';
                
                return [
                    '<div class="gov-detail-grid">',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">Total Engines</span><span class="gov-detail-value">' + d.engineCount.total + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">Healthy</span><span class="gov-detail-value approved">' + d.engineCount.healthy + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">Incomplete</span><span class="gov-detail-value warning">' + d.engineCount.incomplete + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">Broken</span><span class="gov-detail-value rejected">' + d.engineCount.broken + '</span></div>',
                    '</div>',
                    '<div class="gov-detail-row"><span class="gov-detail-label">Governance Score</span><span class="gov-detail-value">' + d.governanceScore.overall + '% (' + d.governanceScore.status + ')</span></div>',
                    '<div class="gov-detail-row"><span class="gov-detail-label">Coverage</span><span class="gov-detail-value">' + d.governanceScore.coverage + '%</span></div>',
                    d.needsAttention.length > 0 ? '<div class="gov-recent-list"><h4>⚠️ Needs Attention</h4>' + d.needsAttention.slice(0,5).map(function(e){ return '<div class="gov-list-item"><span class="gov-list-text">' + e.name + '</span><span class="gov-list-value">' + e.score + '%</span></div>'; }).join('') + '</div>' : ''
                ].join('');
            }
        };
    }
    
    // ============================================================
    // 3. Runtime Governance Dashboard (新版 Part 49.7 — 精简版)
    // ============================================================
    // 注意：如果完整的 GovernanceDashboard class 已经由 governanceDashboard.js 加载，
    // 这里提供一个兼容的静态版本作为 fallback
    
    if (!window.LawAIApp.RuntimeGovernanceDashboard) {
        window.LawAIApp.RuntimeGovernanceDashboard = {
            initialized: false,
            type: 'RUNTIME_GOVERNANCE',
            version: 'V4.9.7 (Part 49)',
            
            init: function() {
                if (this.initialized) return;
                this.initialized = true;
                console.log('[RuntimeGovernanceDashboard] Initialized.');
            },
            
            // 收集运行时治理摘要（只读）
            getSummary: function() {
                var summary = {
                    type: 'RUNTIME_GOVERNANCE',
                    policies: { active: 0, total: 0 },
                    permissions: { active: 0, subjects: 0 },
                    validations: { total: 0 },
                    safety: { locks: 0, incidents: 0 },
                    aiGovernance: { decisions: 0, level: '?' },
                    timestamp: Date.now()
                };
                
                // 安全读取各模块数据
                try {
                    if (window.LawAIApp.Policy?.getReport) {
                        var pr = window.LawAIApp.Policy.getReport();
                        summary.policies.active = pr.policies?.active || 0;
                        summary.policies.total = pr.policies?.total || 0;
                    }
                } catch(e) {}
                
                try {
                    if (window.LawAIApp.Permissions?.getReport) {
                        var pmr = window.LawAIApp.Permissions.getReport();
                        summary.permissions.active = pmr.permissions?.active || 0;
                        summary.permissions.subjects = pmr.subjects?.total || 0;
                    }
                } catch(e) {}
                
                try {
                    if (window.LawAIApp.Validation?.getReport) {
                        var vr = window.LawAIApp.Validation.getReport();
                        summary.validations.total = vr.validations?.total || 0;
                    }
                } catch(e) {}
                
                try {
                    if (window.LawAIApp.Safety?.getReport) {
                        var sr = window.LawAIApp.Safety.getReport();
                        summary.safety.locks = sr.locks?.active || 0;
                        summary.safety.incidents = sr.actions?.incidents || 0;
                    }
                } catch(e) {}
                
                try {
                    if (window.LawAIApp.AIGovernance?.getReport) {
                        var ar = window.LawAIApp.AIGovernance.getReport();
                        summary.aiGovernance.decisions = ar.decisions?.total || 0;
                        summary.aiGovernance.level = ar.aiLevel?.name || '?';
                    }
                } catch(e) {}
                
                return summary;
            },
            
            // 生成 HTML 摘要
            renderSummaryHTML: function() {
                var s = this.getSummary();
                return [
                    '<div class="gov-detail-grid">',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">📋 Policies</span><span class="gov-detail-value">' + s.policies.active + '/' + s.policies.total + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">🔑 Permissions</span><span class="gov-detail-value">' + s.permissions.active + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">✅ Validations</span><span class="gov-detail-value">' + s.validations.total + '</span></div>',
                    '  <div class="gov-detail-item"><span class="gov-detail-label">🛡️ Safety Locks</span><span class="gov-detail-value">' + s.safety.locks + '</span></div>',
                    '</div>',
                    '<div class="gov-detail-row"><span class="gov-detail-label">🤖 AI Level</span><span class="gov-detail-value">' + s.aiGovernance.level + ' (' + s.aiGovernance.decisions + ' decisions)</span></div>',
                    '<div class="gov-detail-row"><span class="gov-detail-label">🚨 Incidents</span><span class="gov-detail-value ' + (s.safety.incidents > 0 ? 'rejected' : '') + '">' + s.safety.incidents + '</span></div>'
                ].join('');
            }
        };
    }
    
    // ============================================================
    // 4. Unified Governance Dashboard — 统一入口
    // ============================================================
    window.LawAIApp.UnifiedGovernanceDashboard = {
        initialized: false,
        version: 'V5.0.0 (Unified)',
        
        init: function() {
            if (this.initialized) return;
            this.initialized = true;
            
            // 初始化两个子面板
            if (window.LawAIApp.EngineGovernanceDashboard?.init) {
                window.LawAIApp.EngineGovernanceDashboard.init();
            }
            if (window.LawAIApp.RuntimeGovernanceDashboard?.init) {
                window.LawAIApp.RuntimeGovernanceDashboard.init();
            }
            
            console.log('[UnifiedGovernanceDashboard] Initialized — Engine + Runtime Governance unified.');
            this._mountToDevPanel();
        },
        
        /**
         * 挂载到 DevPanel
         */
        _mountToDevPanel: function() {
            var self = this;
            var tryMount = function() {
                if (window.LawAIApp?.Debug?.DevPanel?.addSection) {
                    window.LawAIApp.Debug.DevPanel.addSection('unifiedGovernance', {
                        label: '🏛️ Governance',
                        order: 50,
                        render: function(container) {
                            self._render(container);
                        },
                        refresh: function() {
                            if (window.LawAIApp.EngineGovernanceDashboard?.generate) {
                                window.LawAIApp.EngineGovernanceDashboard.generate();
                            }
                        }
                    });
                    console.log('[UnifiedGovernance] Mounted to DevPanel');
                } else {
                    setTimeout(tryMount, 500);
                }
            };
            setTimeout(tryMount, 1000);
        },
        
        /**
         * 渲染统一面板
         */
        _render: function(container) {
            if (!container) return;
            
            var engineSummary = window.LawAIApp.EngineGovernanceDashboard?.renderSummaryHTML 
                ? window.LawAIApp.EngineGovernanceDashboard.renderSummaryHTML() 
                : '<p class="gov-empty">Engine Governance not available</p>';
            
            var runtimeSummary = window.LawAIApp.RuntimeGovernanceDashboard?.renderSummaryHTML 
                ? window.LawAIApp.RuntimeGovernanceDashboard.renderSummaryHTML() 
                : '<p class="gov-empty">Runtime Governance not available</p>';
            
            container.innerHTML = [
                '<div class="governance-dashboard" style="font-family:sans-serif;color:#e0e0e0;background:#1a1a2e;border-radius:8px;padding:16px;max-height:80vh;overflow-y:auto;">',
                '  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #2a2a4a;margin-bottom:16px;">',
                '    <h2 style="margin:0;font-size:1.3em;color:#fff;">🏛️ Unified Governance Dashboard</h2>',
                '    <span style="font-size:0.75em;color:#888;">v' + this.version + '</span>',
                '  </div>',
                '',
                '  <!-- Engine Governance (Season 1-3) -->',
                '  <div style="background:#16213e;border-radius:6px;padding:14px;margin-bottom:12px;border:1px solid #2a2a4a;">',
                '    <h3 style="margin:0 0 12px 0;font-size:1.05em;color:#fff;border-bottom:1px solid #2a2a4a;padding-bottom:8px;">⚙️ Engine Governance <span style="font-size:0.7em;color:#888;">(Season 1-3)</span></h3>',
                engineSummary,
                '  </div>',
                '',
                '  <!-- Runtime Governance (Part 49) -->',
                '  <div style="background:#16213e;border-radius:6px;padding:14px;margin-bottom:12px;border:1px solid #2a2a4a;">',
                '    <h3 style="margin:0 0 12px 0;font-size:1.05em;color:#fff;border-bottom:1px solid #2a2a4a;padding-bottom:8px;">🛡️ Runtime Governance <span style="font-size:0.7em;color:#888;">(Part 49)</span></h3>',
                runtimeSummary,
                '  </div>',
                '',
                '  <div style="display:flex;justify-content:space-between;padding-top:12px;margin-top:16px;border-top:1px solid #2a2a4a;font-size:0.75em;color:#666;">',
                '    <span>Engine Governance V3.x + Runtime Governance V4.9.7</span>',
                '    <span>Unified Dashboard V5.0.0</span>',
                '  </div>',
                '</div>'
            ].join('');
        },
        
        /**
         * 获取完整报告（融合两个面板的数据）
         */
        getFullReport: function() {
            return {
                version: this.version,
                timestamp: Date.now(),
                engineGovernance: window.LawAIApp.EngineGovernanceDashboard?.getSummary() || { status: 'unavailable' },
                runtimeGovernance: window.LawAIApp.RuntimeGovernanceDashboard?.getSummary() || { status: 'unavailable' }
            };
        }
    };
    
    // ============================================================
    // 5. 保持向后兼容
    // ============================================================
    // 如果旧代码引用了 GovernanceDashboard，指向统一面板
    if (!window.LawAIApp.GovernanceDashboard || window.LawAIApp.GovernanceDashboard._isRuntime) {
        // 已经被 Part 49.7 的版本覆盖了，这里做一个 wrapper
    }
    
    // 暴露旧版别名
    window.governanceDashboard = window.LawAIApp.UnifiedGovernanceDashboard;
    
    // 自动初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() {
            window.LawAIApp.UnifiedGovernanceDashboard.init();
        }, 1500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                window.LawAIApp.UnifiedGovernanceDashboard.init();
            }, 1500);
        });
    }
    
    console.log('📊 Unified Governance Dashboard ready (Engine V3.x + Runtime V4.9.7)');
})();
