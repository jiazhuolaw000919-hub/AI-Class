// ============================================================
// governancePanel.js
// Part 49.8 — Governance Panel (UPGRADED for Part 49.9)
// Version: v4.9.9.2
// Status: Architecture Enhancement
// Module: Developer Experience Layer — Panels
// ============================================================

/**
 * Governance Panel
 * 
 * 职责：
 * - Policy Status
 * - Permission Status
 * - Validation Results
 * - Safety Events
 * - AI Governance Results
 * - Audit Information
 * 
 * 数据来源：
 * - RuntimeExplorer (优先)
 * - Direct Governance APIs (fallback)
 * 
 * 安全规则：
 * - 只能展示结果
 * - 不能修改 Policy/Permission
 * - 必须通过 API 获取数据
 */

(function() {
    'use strict';

    // ── 等待 PanelRegistry ──
    if (!window.LawAIApp || !window.LawAIApp.PanelRegistry) {
        console.warn('[GovernancePanel] PanelRegistry not ready, deferring...');
        
        // 重试机制
        var retryCount = 0;
        var maxRetries = 20;
        
        function waitForRegistry() {
            retryCount++;
            if (window.LawAIApp && window.LawAIApp.PanelRegistry) {
                registerGovernancePanel();
                return;
            }
            if (retryCount < maxRetries) {
                setTimeout(waitForRegistry, 100);
            } else {
                console.warn('[GovernancePanel] PanelRegistry not available after ' + maxRetries + ' attempts');
            }
        }
        waitForRegistry();
        return;
    }

    registerGovernancePanel();

    function registerGovernancePanel() {
        window.LawAIApp.PanelRegistry.register({
            id: 'governance',
            name: 'Governance',
            icon: '🏛️',
            order: 49,
            
            // ────────────────────────────────────────────────
            // RENDER — 渲染 Governance UI
            // ────────────────────────────────────────────────
            
            render: function(container) {
                if (!container) return;
                
                // ── 获取数据 (优先从 Explorer) ──
                var data = this._getData ? this._getData() : this._getDataFallback();
                
                // ── 构建 HTML ──
                container.innerHTML = this._buildHTML(data);
            },
            
            // ────────────────────────────────────────────────
            // REFRESH — 刷新数据
            // ────────────────────────────────────────────────
            
            refresh: function(container) {
                if (container) {
                    this.render(container);
                }
            },
            
            // ────────────────────────────────────────────────
            // DESTROY — 清理资源
            // ────────────────────────────────────────────────
            
            destroy: function() {
                // 清理任何定时器或事件监听
                if (this._refreshInterval) {
                    clearInterval(this._refreshInterval);
                    this._refreshInterval = null;
                }
            },
            
            // ────────────────────────────────────────────────
            // GET DATA — 从 Explorer 获取数据
            // ────────────────────────────────────────────────
            
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
                    recommendations: [],
                    policyStatus: 'unknown',
                    permissionStatus: 'unknown',
                    validationStatus: 'unknown',
                    safetyStatus: 'unknown',
                    aiStatus: 'unknown'
                };

                try {
                    var hasAnyGov = false;
                    
                    // ── 🔥 PRIORITY 1: RuntimeExplorer ──
                    var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
                    
                    if (explorer && explorer.getTreeNode) {
                        var govNode = explorer.getTreeNode('runtime.governance');
                        if (govNode && govNode.children) {
                            for (var i = 0; i < govNode.children.length; i++) {
                                var child = govNode.children[i];
                                if (child.id === 'policy') {
                                    info.policyCount = child.metadata?.count || 0;
                                    info.policyStatus = child.status || 'unknown';
                                    hasAnyGov = true;
                                } else if (child.id === 'permission') {
                                    info.permissionCount = child.metadata?.count || 0;
                                    info.permissionStatus = child.status || 'unknown';
                                    hasAnyGov = true;
                                } else if (child.id === 'validator') {
                                    info.validatorCount = child.metadata?.count || 0;
                                    info.validationStatus = child.status || 'unknown';
                                    hasAnyGov = true;
                                } else if (child.id === 'safety') {
                                    info.safetyLocks = child.metadata?.locks || 0;
                                    info.safetyStatus = child.status || 'unknown';
                                    hasAnyGov = true;
                                } else if (child.id === 'ai') {
                                    info.aiLevel = child.metadata?.level || 'N/A';
                                    info.aiStatus = child.status || 'unknown';
                                    hasAnyGov = true;
                                } else if (child.id === 'metadata') {
                                    if (child.metadata) {
                                        info.healthScore = child.metadata.healthScore || 0;
                                        info.violations = child.metadata.violations || 0;
                                        info.recommendations = child.metadata.recommendations || [];
                                    }
                                }
                            }
                            info.hasData = hasAnyGov;
                            info.isAvailable = true;
                        }
                    }

                    // ── FALLBACK: Direct Governance APIs ──
                    var policy = window.LawAIApp.Policy;
                    var perm = window.LawAIApp.Permissions;
                    var valid = window.LawAIApp.Validation;
                    var safety = window.LawAIApp.Safety;
                    var aiGov = window.LawAIApp.AIGovernance;

                    if (policy) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof policy.getHealth === 'function') {
                            try {
                                var ph = policy.getHealth();
                                info.policyCount = ph.activePolicies || info.policyCount;
                                info.healthScore = Math.max(info.healthScore, ph.healthScore || 0);
                                info.policyStatus = ph.status || 'unknown';
                            } catch(e) { /* ignore */ }
                        }
                        if (typeof policy.getViolations === 'function') {
                            try {
                                var violations = policy.getViolations();
                                info.violations = violations ? violations.length : info.violations;
                            } catch(e) { /* ignore */ }
                        }
                    }

                    if (perm) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof perm.getHealth === 'function') {
                            try {
                                var pmh = perm.getHealth();
                                info.permissionCount = pmh.activePermissions || info.permissionCount;
                                info.healthScore = Math.max(info.healthScore, pmh.healthScore || 0);
                                info.permissionStatus = pmh.status || 'unknown';
                            } catch(e) { /* ignore */ }
                        }
                    }

                    if (valid) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof valid.getHealth === 'function') {
                            try {
                                var vh = valid.getHealth();
                                info.validatorCount = vh.validators || info.validatorCount;
                                info.healthScore = Math.max(info.healthScore, vh.healthScore || 0);
                                info.validationStatus = vh.status || 'unknown';
                            } catch(e) { /* ignore */ }
                        }
                    }

                    if (safety) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof safety.getHealth === 'function') {
                            try {
                                var sh = safety.getHealth();
                                info.safetyLocks = sh.activeLocks || info.safetyLocks;
                                info.healthScore = Math.max(info.healthScore, sh.healthScore || 0);
                                info.safetyStatus = sh.status || 'unknown';
                            } catch(e) { /* ignore */ }
                        }
                    }

                    if (aiGov) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof aiGov.getAILevel === 'function') {
                            try {
                                var ai = aiGov.getAILevel();
                                info.aiLevel = ai.name || info.aiLevel;
                                info.aiStatus = ai.status || 'unknown';
                            } catch(e) { /* ignore */ }
                        }
                        if (typeof aiGov.getRecommendations === 'function') {
                            try {
                                var recs = aiGov.getRecommendations();
                                info.recommendations = recs ? recs.slice(0, 3) : info.recommendations;
                            } catch(e) { /* ignore */ }
                        }
                    }

                    info.hasData = hasAnyGov || info.hasData;

                    // ── 计算整体状态 ──
                    if (info.violations > 0) {
                        info.status = 'violations';
                        info.statusText = 'Violations Detected';
                        info.statusColor = '#ef4444';
                    } else if (info.healthScore >= 80) {
                        info.status = 'healthy';
                        info.statusText = 'Healthy';
                        info.statusColor = '#22c55e';
                    } else if (info.healthScore >= 50) {
                        info.status = 'warning';
                        info.statusText = 'Warning';
                        info.statusColor = '#f59e0b';
                    } else if (info.hasData) {
                        info.status = 'idle';
                        info.statusText = 'Idle';
                        info.statusColor = '#64748b';
                    } else {
                        info.status = 'unavailable';
                        info.statusText = 'Unavailable';
                        info.statusColor = '#64748b';
                    }

                } catch (err) {
                    console.warn('[GovernancePanel] _getData error:', err);
                }

                return info;
            },

            // ────────────────────────────────────────────────
            // GET DATA FALLBACK — 原始逻辑 (兼容性)
            // ────────────────────────────────────────────────
            
            _getDataFallback: function() {
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
                    recommendations: [],
                    policyStatus: 'unknown',
                    permissionStatus: 'unknown',
                    validationStatus: 'unknown',
                    safetyStatus: 'unknown',
                    aiStatus: 'unknown'
                };

                try {
                    var hasAnyGov = false;
                    var policy = window.LawAIApp.Policy;
                    var perm = window.LawAIApp.Permissions;
                    var valid = window.LawAIApp.Validation;
                    var safety = window.LawAIApp.Safety;
                    var aiGov = window.LawAIApp.AIGovernance;

                    if (policy) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof policy.getHealth === 'function') {
                            try {
                                var ph = policy.getHealth();
                                info.policyCount = ph.activePolicies || 0;
                                info.healthScore = Math.max(info.healthScore, ph.healthScore || 0);
                            } catch(e) {}
                        }
                        if (typeof policy.getViolations === 'function') {
                            try {
                                var violations = policy.getViolations();
                                info.violations = violations ? violations.length : 0;
                            } catch(e) {}
                        }
                    }

                    if (perm) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof perm.getHealth === 'function') {
                            try {
                                var pmh = perm.getHealth();
                                info.permissionCount = pmh.activePermissions || 0;
                                info.healthScore = Math.max(info.healthScore, pmh.healthScore || 0);
                            } catch(e) {}
                        }
                    }

                    if (valid) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof valid.getHealth === 'function') {
                            try {
                                var vh = valid.getHealth();
                                info.validatorCount = vh.validators || 0;
                                info.healthScore = Math.max(info.healthScore, vh.healthScore || 0);
                            } catch(e) {}
                        }
                    }

                    if (safety) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof safety.getHealth === 'function') {
                            try {
                                var sh = safety.getHealth();
                                info.safetyLocks = sh.activeLocks || 0;
                                info.healthScore = Math.max(info.healthScore, sh.healthScore || 0);
                            } catch(e) {}
                        }
                    }

                    if (aiGov) {
                        hasAnyGov = true;
                        info.isAvailable = true;
                        if (typeof aiGov.getAILevel === 'function') {
                            try {
                                var ai = aiGov.getAILevel();
                                info.aiLevel = ai.name || 'N/A';
                            } catch(e) {}
                        }
                        if (typeof aiGov.getRecommendations === 'function') {
                            try {
                                var recs = aiGov.getRecommendations();
                                info.recommendations = recs ? recs.slice(0, 3) : [];
                            } catch(e) {}
                        }
                    }

                    info.hasData = hasAnyGov;

                    if (info.violations > 0) {
                        info.status = 'violations';
                        info.statusText = 'Violations Detected';
                        info.statusColor = '#ef4444';
                    } else if (info.healthScore >= 80) {
                        info.status = 'healthy';
                        info.statusText = 'Healthy';
                        info.statusColor = '#22c55e';
                    } else if (info.healthScore >= 50) {
                        info.status = 'warning';
                        info.statusText = 'Warning';
                        info.statusColor = '#f59e0b';
                    } else if (info.hasData) {
                        info.status = 'idle';
                        info.statusText = 'Idle';
                        info.statusColor = '#64748b';
                    } else {
                        info.status = 'unavailable';
                        info.statusText = 'Unavailable';
                        info.statusColor = '#64748b';
                    }

                } catch (err) {
                    console.warn('[GovernancePanel] _getDataFallback error:', err);
                }

                return info;
            },

            // ────────────────────────────────────────────────
            // BUILD HTML — 构建 UI
            // ────────────────────────────────────────────────
            
            _buildHTML: function(data) {
                var statusColor = data.statusColor || '#64748b';
                var statusText = data.statusText || 'Unknown';

                // ── 构建状态徽章 ──
                var badges = [];
                
                if (data.policyCount > 0) {
                    var policyColor = data.policyStatus === 'healthy' ? '#22c55e' : '#f59e0b';
                    badges.push('<span style="padding:2px 8px;border-radius:10px;background:' + policyColor + '20;color:' + policyColor + ';font-size:9px;">📋 ' + data.policyCount + '</span>');
                }
                
                if (data.permissionCount > 0) {
                    badges.push('<span style="padding:2px 8px;border-radius:10px;background:#3b82f620;color:#3b82f6;font-size:9px;">🔑 ' + data.permissionCount + '</span>');
                }
                
                if (data.validatorCount > 0) {
                    badges.push('<span style="padding:2px 8px;border-radius:10px;background:#8b5cf620;color:#8b5cf6;font-size:9px;">✅ ' + data.validatorCount + '</span>');
                }
                
                if (data.safetyLocks > 0) {
                    var safetyColor = data.safetyStatus === 'safe' ? '#22c55e' : '#ef4444';
                    badges.push('<span style="padding:2px 8px;border-radius:10px;background:' + safetyColor + '20;color:' + safetyColor + ';font-size:9px;">🛡️ ' + data.safetyLocks + '🔒</span>');
                }
                
                if (data.aiLevel && data.aiLevel !== 'N/A') {
                    badges.push('<span style="padding:2px 8px;border-radius:10px;background:#a855f720;color:#a855f7;font-size:9px;">🤖 ' + data.aiLevel + '</span>');
                }

                // ── 健康分数徽章 ──
                var scoreBadge = '';
                if (data.healthScore > 0) {
                    var scoreColor = data.healthScore >= 80 ? '#22c55e' : (data.healthScore >= 50 ? '#f59e0b' : '#ef4444');
                    scoreBadge = '<span style="padding:2px 8px;border-radius:10px;background:' + scoreColor + '20;color:' + scoreColor + ';font-size:9px;">' + data.healthScore + '%</span>';
                }

                // ── 完整 HTML ──
                var html = '';
                
                // Header
                html += '<div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">';
                html += '<span style="font-weight:bold;color:#22c55e;font-size:11px;cursor:pointer;" onclick="window.LawAIApp._openGovernanceDashboard && window.LawAIApp._openGovernanceDashboard()" title="Click for full dashboard">🏛️ Governance 🔗</span>';
                html += '<span style="font-size:10px;color:' + statusColor + ';">' + statusText + '</span>';
                html += '</div>';
                
                // Badges
                if (badges.length > 0) {
                    html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">';
                    html += badges.join('');
                    if (scoreBadge) html += scoreBadge;
                    html += '</div>';
                }
                
                // Status bar
                html += '<div style="display:flex;align-items:center;gap:6px;margin-top:2px;">';
                html += '<div style="flex:1;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden;">';
                html += '<div style="width:' + Math.min(data.healthScore || 0, 100) + '%;height:100%;background:' + statusColor + ';border-radius:1px;"></div>';
                html += '</div>';
                html += '<span style="font-size:8px;color:#475569;">' + (data.healthScore || 0) + '%</span>';
                html += '</div>';
                
                // Violations warning
                if (data.violations > 0) {
                    html += '<div style="font-size:9px;color:#ef4444;margin-top:3px;">⚠️ ' + data.violations + ' violations detected</div>';
                }
                
                // Recommendations
                if (data.recommendations && data.recommendations.length > 0) {
                    html += '<div style="font-size:8px;color:#4a9eff;margin-top:2px;max-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">💡 ' + data.recommendations.slice(0, 2).join(' | ') + (data.recommendations.length > 2 ? '...' : '') + '</div>';
                }
                
                // Timestamp
                html += '<div style="font-size:7px;color:#475569;margin-top:3px;text-align:right;">Updated: ' + this._formatTimestamp(Date.now()) + '</div>';
                
                return html;
            },

            // ────────────────────────────────────────────────
            // UTILITY
            // ────────────────────────────────────────────────
            
            _formatTimestamp: function(ts) {
                try {
                    var d = new Date(ts);
                    return d.toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch(e) {
                    return 'N/A';
                }
            }
        });
        
        console.log('[GovernancePanel] Registered (Part 49.9.2)');
        console.log('   📋 Data source: RuntimeExplorer → Governance APIs');
        console.log('   🔒 Read-only mode: ENABLED');
    }
})();
