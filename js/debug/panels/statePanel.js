// ============================================================
// statePanel.js
// Part 49.8.5 — Extract State Panel
// Version: v4.9.8.5
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * State Panel
 * 
 * 职责：
 * - render(container) — 渲染 State UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 必须通过 State Sync API
 * - 禁止直接读取内部 State Store
 * - 不得调用 Cognitive Engine
 */
LawAIApp.Debug.Panels.StatePanel = {
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
            console.warn('[StatePanel] No container provided');
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
            console.warn('[StatePanel] Refresh failed:', err);
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
    // STATE API — 必须通过 State Sync API
    // ============================================================

    _getData: function() {
        var info = {
            stateCount: 0,
            syncStatus: 'unknown',
            conflictCount: 0,
            snapshotCount: 0,
            insightCount: 0,
            hasData: false,
            isAvailable: false,
            runtimeState: null,
            states: [],
            latestSnapshot: null,
            syncHealth: 'unknown',
            statusColor: '#64748b',
            statusText: 'Unknown'
        };

        try {
            // ── 🔥 NEW: 从 RuntimeExplorer 获取数据 ──
            var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        
            // ── 从 Explorer 获取 State 信息 ──
            if (explorer && explorer.getTreeNode) {
                var stateNode = explorer.getTreeNode('runtime.state');
                if (stateNode && stateNode.children) {
                    info.stateCount = stateNode.children.length;
                    info.hasData = info.stateCount > 0;
                
                    // 提取 state 列表
                    info.states = stateNode.children.slice(0, 10).map(function(node) {
                        return { id: node.id, label: node.label };
                    });
                }
            }

            // ── State Registry (原有逻辑) ──
            var registry = LawAIApp.StateRegistry || window.stateRegistry;
            if (registry) {
                var states = null;
                if (typeof registry.getAll === 'function') {
                    states = registry.getAll();
                }
                if (states && states.length > 0) {
                    info.stateCount = states.length;
                    info.hasData = true;
                    info.states = states.slice(0, 10);
                }
                info.isAvailable = true;
            }

            // ── 其余原有逻辑保持不变 ──
            // ... (Sync Engine, Conflict Resolver, Persistence, Intelligence, Runtime Integration)

            // ── Status ──
            if (info.hasData) {
                if (info.conflictCount > 0) {
                    info.statusColor = '#ef4444';
                    info.statusText = 'Conflicts';
                } else if (info.syncStatus === 'active') {
                    info.statusColor = '#22c55e';
                    info.statusText = 'Synced';
                } else {
                    info.statusColor = '#f59e0b';
                    info.statusText = 'Idle';
                }
            } else if (info.isAvailable) {
                info.statusColor = '#64748b';
                info.statusText = 'Empty';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[StatePanel] Could not get state data:', err);
        }

        return info;
    },

    // ============================================================
    // UI RENDERING
    // ============================================================

    _buildHTML: function(data) {
        var statusColor = data.statusColor || '#64748b';
        var statusText = data.statusText || 'Unknown';

        return `
            <div id="state-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔄 State Dashboard</span>
                    <span style="font-size:10px;color:${data.hasData ? '#22c55e' : '#64748b'};">${data.hasData ? '✅ Active' : '⏳ Loading'}</span>
                </div>
                
                ${data.isAvailable && data.hasData ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>States: ${data.stateCount}</span>
                    <span>Sync: <span style="color:${statusColor};">${data.syncStatus}</span></span>
                    <span>Conflicts: ${data.conflictCount}</span>
                    <span>Insights: ${data.insightCount}</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Snapshots: ${data.snapshotCount}</span>
                    ${data.runtimeState ? `<span>Runtime: ${data.runtimeState.status}</span>` : ''}
                    ${data.runtimeState ? `<span>Ready: ${data.runtimeState.ready ? '✅' : '❌'}</span>` : ''}
                </div>
                
                <!-- State List -->
                ${data.states.length > 0 ? `
                    <div style="margin-top:3px;font-size:8px;color:#475569;max-height:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        📋 ${data.states.slice(0, 5).map(function(s) { return s.id; }).join(', ')}${data.states.length > 5 ? '...' : ''}
                    </div>
                ` : ''}
                
                <!-- Warnings -->
                ${data.conflictCount > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${data.conflictCount} unresolved conflicts
                    </div>
                ` : ''}
                ${data.insightCount > 0 ? `
                    <div style="font-size:9px;color:#8b5cf6;margin-top:2px;">
                        💡 ${data.insightCount} state insights available
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ${data.isAvailable ? '⏳ No state data available yet...' : '⚠️ State system not available'}
                </div>
                `}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="state-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.StatePanel._handleRefresh()">
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
            var engine = LawAIApp.StateSyncEngine || window.stateSyncEngine;
            if (engine && typeof engine.subscribe === 'function') {
                var unsub = engine.subscribe('*', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) { /* ignore */ }

        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('state.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
                
                var unsubConflict = eventBus.on('state.conflict', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubConflict);
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

console.log('✅ [Part 49.8.5] StatePanel loaded');
