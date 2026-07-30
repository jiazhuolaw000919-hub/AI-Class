// ============================================================
// unifiedGovernanceDashboard.js — Minimal Working Version
// Part 49.7
// ============================================================

window.LawAIApp = window.LawAIApp || {};

window.LawAIApp.UnifiedGovernanceDashboard = {
    _container: null,
    _isOpen: false,
    _refreshInterval: null,

    open: function() {
        console.log('🏛️ [Governance] Opening dashboard...');
        
        var old = document.getElementById('governance-dashboard-overlay');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'governance-dashboard-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10050;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(6px);
        `;

        var popup = document.createElement('div');
        popup.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 24px;
            max-width: 800px;
            width: 95%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
        `;

        var container = document.createElement('div');
        container.id = 'governance-dashboard-container';
        popup.appendChild(container);
        overlay.appendChild(popup);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
                if (window.LawAIApp.UnifiedGovernanceDashboard) {
                    window.LawAIApp.UnifiedGovernanceDashboard._isOpen = false;
                    if (window.LawAIApp.UnifiedGovernanceDashboard._refreshInterval) {
                        clearInterval(window.LawAIApp.UnifiedGovernanceDashboard._refreshInterval);
                    }
                }
            }
        });

        var escHandler = function(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
                if (window.LawAIApp.UnifiedGovernanceDashboard) {
                    window.LawAIApp.UnifiedGovernanceDashboard._isOpen = false;
                    if (window.LawAIApp.UnifiedGovernanceDashboard._refreshInterval) {
                        clearInterval(window.LawAIApp.UnifiedGovernanceDashboard._refreshInterval);
                    }
                }
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(overlay);

        this._container = container;
        this._isOpen = true;

        this.render(container);
    },

    render: function(container) {
        if (!container) container = this._container;
        if (!container) return;

        var html = '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:16px;">';
        html += '<span style="font-size:18px;font-weight:700;color:#22c55e;">🏛️ Governance Dashboard</span>';
        html += '<button onclick="document.getElementById(\'governance-dashboard-overlay\')?.remove()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>';
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">';

        var sections = [
            { id: 'policy', icon: '📋', label: 'Policy', color: '#22c55e' },
            { id: 'permission', icon: '🔑', label: 'Permission', color: '#3b82f6' },
            { id: 'validation', icon: '✅', label: 'Validation', color: '#8b5cf6' },
            { id: 'safety', icon: '🛡️', label: 'Safety', color: '#f59e0b' },
            { id: 'ai', icon: '🤖', label: 'AI Governance', color: '#a855f7' }
        ];

        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            var data = this._getData(s.id);
            var statusColor = data.health >= 80 ? '#22c55e' : (data.health >= 50 ? '#f59e0b' : '#ef4444');
            
            html += '<div style="padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:3px solid ' + s.color + ';">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
            html += '<span style="font-size:11px;font-weight:600;color:#94a3b8;">' + s.icon + ' ' + s.label + '</span>';
            html += '<span style="font-size:9px;color:' + statusColor + ';">' + data.health + '%</span>';
            html += '</div>';
            html += '<div style="font-size:10px;color:#e2e8f0;margin-top:2px;">' + (data.count > 0 ? data.count + ' items' : '—') + '</div>';
            html += '<div style="width:100%;height:2px;background:rgba(255,255,255,0.05);border-radius:1px;margin-top:4px;overflow:hidden;">';
            html += '<div style="width:' + Math.min(data.health || 0, 100) + '%;height:100%;background:' + statusColor + ';border-radius:1px;"></div>';
            html += '</div>';
            html += '</div>';
        }

        html += '</div>';
        html += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;font-size:9px;color:#475569;">';
        html += '🔄 Auto-refresh every 5s';
        html += '</div>';

        container.innerHTML = html;
        this._container = container;

        if (this._refreshInterval) clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(function() {
            if (this._container && this._isOpen) {
                this.render(this._container);
            }
        }.bind(this), 5000);
    },

    _getData: function(id) {
        var data = { count: 0, health: 0 };
        try {
            if (id === 'policy') {
                var p = window.LawAIApp.Policy;
                if (p && p.getHealth) {
                    var h = p.getHealth();
                    data.count = h.activePolicies || 0;
                    data.health = h.healthScore || 0;
                }
            } else if (id === 'permission') {
                var p = window.LawAIApp.Permissions;
                if (p && p.getHealth) {
                    var h = p.getHealth();
                    data.count = h.activePermissions || 0;
                    data.health = h.healthScore || 0;
                }
            } else if (id === 'validation') {
                var v = window.LawAIApp.Validation;
                if (v && v.getHealth) {
                    var h = v.getHealth();
                    data.count = h.validators || 0;
                    data.health = h.healthScore || 0;
                }
            } else if (id === 'safety') {
                var s = window.LawAIApp.Safety;
                if (s && s.getHealth) {
                    var h = s.getHealth();
                    data.count = h.activeLocks || 0;
                    data.health = h.healthScore || 0;
                }
            } else if (id === 'ai') {
                var a = window.LawAIApp.AIGovernance;
                if (a && a.getAILevel) {
                    data.count = 1;
                    data.health = 80;
                }
            }
        } catch(e) { /* ignore */ }
        return data;
    },

    close: function() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
        this._isOpen = false;
        var overlay = document.getElementById('governance-dashboard-overlay');
        if (overlay) overlay.remove();
    }
};

// ============================================================
// 全局打开方法
// ============================================================

window.LawAIApp._openGovernanceDashboard = function() {
    var dashboard = window.LawAIApp.UnifiedGovernanceDashboard;
    if (!dashboard) {
        alert('⚠️ Governance Dashboard not loaded yet.');
        return;
    }
    dashboard.open();
};

console.log('🏛️ [UnifiedGovernance] Minimal dashboard loaded');
console.log('   📋 Open with: LawAIApp._openGovernanceDashboard()');
