// ============================================================
// panelDetailManager.js
// Part 49.9.7 — Panel Detail Popup Manager
// Version: v4.9.9.7
// Module: Developer Experience Layer — Details
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Details = LawAIApp.Debug.Details || {};

/**
 * Panel Detail Manager
 * 
 * 职责：
 * - 打开 Panel 详情浮窗
 * - 渲染各 Panel 完整数据
 * - 刷新单个 Panel
 * - 关闭浮窗
 * 
 * 不负责：
 * - Panel 数据获取 (由各 Panel 自己负责)
 * - DevPanel 核心生命周期
 */
LawAIApp.Debug.Details.PanelDetailManager = {
    _overlay: null,
    _popup: null,
    _escHandler: null,
    _currentPanelId: null,

    // ============================================================
    // 打开详情浮窗
    // ============================================================

    open: function(panelId) {
        console.log('🔍 Opening detail for panel:', panelId);

        // ── 查找 Panel ──
        var panelEntry = null;
        var panels = LawAIApp.Debug.DevPanel._registeredPanels || [];
        for (var i = 0; i < panels.length; i++) {
            if (panels[i].id === panelId) {
                panelEntry = panels[i];
                break;
            }
        }

        if (!panelEntry || !panelEntry.panel) {
            alert('⚠️ Panel not found: ' + panelId);
            return;
        }

        // ── 获取 Panel 数据 ──
        var panel = panelEntry.panel;
        var data = null;

        if (typeof panel._getData === 'function') {
            data = panel._getData();
        } else if (typeof panel.getData === 'function') {
            data = panel.getData();
        } else if (panel._data) {
            data = panel._data;
        }

        if (!data) {
            alert('⚠️ No data available for panel: ' + panelId);
            return;
        }

        this._currentPanelId = panelId;
        var content = this._buildContent(panelId, data);
        this._createPopup(content);
    },

    // ============================================================
    // 构建内容
    // ============================================================

    _buildContent: function(panelId, data) {
        var panelName = this._getPanelName(panelId);
        var icon = this._getPanelIcon(panelId);

        var html = '';
        html += '<div style="max-width:640px;max-height:85vh;overflow-y:auto;padding:4px;">';

        // Header
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;margin-bottom:10px;">';
        html += '<span style="font-size:16px;font-weight:700;color:#4a9eff;">' + icon + ' ' + panelName + ' — Details</span>';
        html += '<span style="font-size:10px;color:#475569;">' + new Date().toLocaleTimeString() + '</span>';
        html += '</div>';

        // Data
        html += this._renderData(panelId, data);

        // Actions
        html += '<div style="display:flex;gap:6px;margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);flex-wrap:wrap;">';
        html += '<button onclick="LawAIApp.Debug.Details.PanelDetailManager.refresh()" style="padding:4px 12px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:6px;color:#4a9eff;font-size:10px;cursor:pointer;">🔄 Refresh</button>';
        html += '<button onclick="LawAIApp.Debug.Details.PanelDetailManager.close()" style="padding:4px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;font-size:10px;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        html += '</div>';
        return html;
    },

    // ============================================================
    // 各 Panel 数据渲染
    // ============================================================

    _renderData: function(panelId, data) {
        var html = '';

        switch(panelId) {
            case 'runtime':
                html = this._renderRuntime(data);
                break;
            case 'performance':
                html = this._renderPerformance(data);
                break;
            case 'metrics':
                html = this._renderMetrics(data);
                break;
            case 'event':
                html = this._renderEvent(data);
                break;
            case 'trace':
                html = this._renderTrace(data);
                break;
            case 'state':
                html = this._renderState(data);
                break;
            case 'cognitive':
                html = this._renderCognitive(data);
                break;
            case 'governance':
                html = this._renderGovernance(data);
                break;
            case 'explorer':
                html = this._renderExplorer(data);
                break;
            default:
                html = '<div style="font-size:12px;color:#64748b;">' + JSON.stringify(data, null, 2) + '</div>';
        }

        return html;
    },

    // ── Runtime ──
    _renderRuntime: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + (data.ready ? '#22c55e' : '#f59e0b') + ';">' + data.status + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Uptime</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.uptime + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Version</div><div style="font-size:14px;font-weight:600;color:#4a9eff;">' + data.version + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Registry</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.registryCount + ' modules</div></div>';
        if (data.registryModules) {
            html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#475569;">Loaded Modules</div><div style="font-size:11px;color:#94a3b8;word-wrap:break-word;">' + data.registryModules + '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Performance ──
    _renderPerformance: function(data) {
        var color = data.score >= 80 ? '#22c55e' : (data.score >= 50 ? '#f59e0b' : '#ef4444');
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Score</div><div style="font-size:20px;font-weight:700;color:' + color + ';">' + data.score + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + color + ';">' + data.label + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Boot Duration</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.bootDuration + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Modules</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.totalModules + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Records</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.totalRecords + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Average</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.averageDuration + '</div></div>';
        if (data.warnings && data.warnings.length > 0) {
            html += '<div style="padding:8px;background:rgba(239,68,68,0.05);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#ef4444;">⚠️ Warnings</div><div style="font-size:11px;color:#f59e0b;">' + data.warnings.join('; ') + '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Metrics ──
    _renderMetrics: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.status + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Health</div><div style="font-size:14px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.healthScore + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Collected</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.collectedMetrics + '/' + data.totalMetrics + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Coverage</div><div style="font-size:14px;font-weight:600;color:#e2e8f0;">' + data.coverage + '%</div></div>';
        if (data.missingMetrics && data.missingMetrics.length > 0) {
            html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#475569;">Missing Metrics</div><div style="font-size:11px;color:#94a3b8;word-wrap:break-word;">' + data.missingMetrics.join(', ') + '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Events ──
    _renderEvent: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Total Events</div><div style="font-size:18px;font-weight:600;color:#4a9eff;">' + data.totalEvents + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Sessions</div><div style="font-size:18px;font-weight:600;color:#e2e8f0;">' + data.sessionCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Categories</div><div style="font-size:14px;font-weight:600;color:#8b5cf6;">' + data.categoryCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Sources</div><div style="font-size:14px;font-weight:600;color:#22c55e;">' + data.sourceCount + '</div></div>';
        if (data.recentEvents && data.recentEvents.length > 0) {
            html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#475569;">📋 Recent Events</div>';
            html += '<div style="font-size:10px;color:#94a3b8;max-height:100px;overflow-y:auto;">';
            data.recentEvents.slice(0, 10).forEach(function(e) {
                var time = new Date(e.timestamp).toLocaleTimeString();
                html += '<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' + time + ' — ' + (e.eventName || e.eventId) + ' (' + e.source + ')</div>';
            });
            if (data.recentEvents.length > 10) {
                html += '<div style="padding:2px 0;color:#475569;">+' + (data.recentEvents.length - 10) + ' more...</div>';
            }
            html += '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Trace ──
    _renderTrace: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.status + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Health</div><div style="font-size:14px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.healthScore + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Total Traces</div><div style="font-size:14px;font-weight:600;color:#4a9eff;">' + data.totalTraces + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Active</div><div style="font-size:14px;font-weight:600;color:#f59e0b;">' + data.activeTraces + '</div></div>';
        html += '<div style="padding:8px;background:rgba(34,197,94,0.05);border-radius:6px;"><div style="font-size:9px;color:#22c55e;">✅ Completed</div><div style="font-size:14px;font-weight:600;color:#22c55e;">' + data.completedTraces + '</div></div>';
        html += '<div style="padding:8px;background:rgba(239,68,68,0.05);border-radius:6px;"><div style="font-size:9px;color:#ef4444;">❌ Failed</div><div style="font-size:14px;font-weight:600;color:#ef4444;">' + data.failedTraces + '</div></div>';
        html += '</div>';
        return html;
    },

    // ── State ──
    _renderState: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">States</div><div style="font-size:18px;font-weight:600;color:#4a9eff;">' + data.stateCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Sync Status</div><div style="font-size:14px;font-weight:600;color:' + (data.syncStatus === 'active' ? '#22c55e' : '#f59e0b') + ';">' + data.syncStatus + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Conflicts</div><div style="font-size:18px;font-weight:600;color:' + (data.conflictCount > 0 ? '#ef4444' : '#22c55e') + ';">' + data.conflictCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Snapshots</div><div style="font-size:18px;font-weight:600;color:#8b5cf6;">' + data.snapshotCount + '</div></div>';
        if (data.states && data.states.length > 0) {
            html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#475569;">📋 State List</div><div style="font-size:10px;color:#94a3b8;max-height:80px;overflow-y:auto;">';
            data.states.forEach(function(s) {
                html += '<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' + (s.id || s) + '</div>';
            });
            html += '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Cognitive ──
    _renderCognitive: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + (data.confidence >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.status + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Confidence</div><div style="font-size:18px;font-weight:600;color:' + (data.confidence >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.confidence + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Coverage</div><div style="font-size:14px;font-weight:600;color:#4a9eff;">' + data.coverage + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">AI Level</div><div style="font-size:14px;font-weight:600;color:#8b5cf6;">' + data.aiLevel + '</div></div>';
        if (data.insights && data.insights.length > 0) {
            html += '<div style="padding:8px;background:rgba(139,92,246,0.05);border-radius:6px;grid-column:span 2;"><div style="font-size:9px;color:#8b5cf6;">💡 Insights</div>';
            data.insights.forEach(function(i) {
                html += '<div style="font-size:11px;color:#94a3b8;padding:2px 0;">• ' + (i.summary || i.type) + '</div>';
            });
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    // ── Governance ──
    _renderGovernance: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Status</div><div style="font-size:14px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.status + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Health</div><div style="font-size:18px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.healthScore + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">📋 Policies</div><div style="font-size:14px;font-weight:600;color:#22c55e;">' + data.policyCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">🔑 Permissions</div><div style="font-size:14px;font-weight:600;color:#3b82f6;">' + data.permissionCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">✅ Validators</div><div style="font-size:14px;font-weight:600;color:#8b5cf6;">' + data.validatorCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">🛡️ Safety Locks</div><div style="font-size:14px;font-weight:600;color:' + (data.safetyLocks > 0 ? '#22c55e' : '#64748b') + ';">' + data.safetyLocks + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">🤖 AI Level</div><div style="font-size:14px;font-weight:600;color:#a855f7;">' + data.aiLevel + '</div></div>';
        if (data.violations > 0) {
            html += '<div style="padding:8px;background:rgba(239,68,68,0.05);border-radius:6px;"><div style="font-size:9px;color:#ef4444;">⚠️ Violations</div><div style="font-size:18px;font-weight:600;color:#ef4444;">' + data.violations + '</div></div>';
        }
        html += '</div>';
        return html;
    },

    // ── Explorer ──
    _renderExplorer: function(data) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Components</div><div style="font-size:18px;font-weight:600;color:#4a9eff;">' + data.componentCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">Health</div><div style="font-size:18px;font-weight:600;color:' + (data.healthScore >= 80 ? '#22c55e' : '#f59e0b') + ';">' + data.healthScore + '%</div></div>';
        html += '<div style="padding:8px;background:rgba(34,197,94,0.05);border-radius:6px;"><div style="font-size:9px;color:#22c55e;">✅ Healthy</div><div style="font-size:14px;font-weight:600;color:#22c55e;">' + data.healthyCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(245,158,11,0.05);border-radius:6px;"><div style="font-size:9px;color:#f59e0b;">⚠️ Warning</div><div style="font-size:14px;font-weight:600;color:#f59e0b;">' + data.warningCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(239,68,68,0.05);border-radius:6px;"><div style="font-size:9px;color:#ef4444;">❌ Error</div><div style="font-size:14px;font-weight:600;color:#ef4444;">' + data.errorCount + '</div></div>';
        html += '<div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;"><div style="font-size:9px;color:#475569;">📸 Snapshots</div><div style="font-size:14px;font-weight:600;color:#8b5cf6;">' + data.snapshotCount + '</div></div>';
        html += '</div>';
        return html;
    },

    // ============================================================
    // 辅助方法
    // ============================================================

    _getPanelName: function(panelId) {
        var names = {
            'runtime': 'Runtime Status',
            'performance': 'Performance',
            'metrics': 'Metrics',
            'event': 'Events',
            'trace': 'Tracing',
            'state': 'State Dashboard',
            'cognitive': 'Cognitive Engine',
            'governance': 'Governance Layer',
            'explorer': 'Runtime Explorer'
        };
        return names[panelId] || panelId;
    },

    _getPanelIcon: function(panelId) {
        var icons = {
            'runtime': '⚡',
            'performance': '📊',
            'metrics': '📈',
            'event': '🧠',
            'trace': '🛰',
            'state': '🔄',
            'cognitive': '🧠',
            'governance': '🏛️',
            'explorer': '🔍'
        };
        return icons[panelId] || '📄';
    },

    // ============================================================
    // 刷新 & 关闭
    // ============================================================

    refresh: function() {
        if (this._currentPanelId) {
            // 刷新 Panel 数据
            var panels = LawAIApp.Debug.DevPanel._registeredPanels || [];
            for (var i = 0; i < panels.length; i++) {
                if (panels[i].id === this._currentPanelId && panels[i].panel && typeof panels[i].panel.refresh === 'function') {
                    panels[i].panel.refresh();
                    break;
                }
            }
            // 重新打开
            this.open(this._currentPanelId);
        }
    },

    close: function() {
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
            this._popup = null;
        }
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        this._currentPanelId = null;
    },

    // ============================================================
    // 创建弹窗
    // ============================================================

    _createPopup: function(content) {
        this.close();

        var overlay = document.createElement('div');
        overlay.id = 'panel-detail-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;

        var popup = document.createElement('div');
        popup.id = 'panel-detail-popup';
        popup.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 20px;
            max-width: 640px;
            width: 90%;
            max-height: 85vh;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
        `;
        popup.innerHTML = content;

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                LawAIApp.Debug.Details.PanelDetailManager.close();
            }
        });

        var escHandler = function(e) {
            if (e.key === 'Escape') {
                LawAIApp.Debug.Details.PanelDetailManager.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        this._overlay = overlay;
        this._popup = popup;
        this._escHandler = escHandler;
    }
};

console.log('📋 [PanelDetailManager] Loaded');
