// ============================================================
// tracePanel.js
// Part 49.8.4 — Extract Trace Panel
// Version: v4.9.8.4
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Trace Panel
 * 
 * 职责：
 * - render(container) — 渲染 Trace UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 统一通过 LawAIApp.RuntimeTrace API 获取
 * - 禁止直接访问内部 Store
 */
LawAIApp.Debug.Panels.TracePanel = {
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
            console.warn('[TracePanel] No container provided');
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
            console.warn('[TracePanel] Refresh failed:', err);
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
    // TRACE API — 统一通过 LawAIApp.RuntimeTrace
    // ============================================================

    _getData: function() {
        var info = {
            status: 'unknown',
            totalTraces: 0,
            activeTraces: 0,
            completedTraces: 0,
            failedTraces: 0,
            coverage: 0,
            healthScore: 0,
            orphanTraces: 0,
            validationWarnings: 0,
            isAvailable: false,
            statusColor: '#64748b',
            statusText: 'Unknown'
        };

        try {
            var traceHealth = LawAIApp.RuntimeTraceHealth || window.runtimeTraceHealth;
            if (traceHealth && typeof traceHealth.getHealth === 'function') {
                var data = traceHealth.getHealth();
                if (data) {
                    info.status = data.status || 'unknown';
                    info.totalTraces = data.totalTraces || 0;
                    info.activeTraces = data.activeTraces || 0;
                    info.completedTraces = data.completedTraces || 0;
                    info.failedTraces = data.failedTraces || 0;
                    info.coverage = data.coverageScore || 0;
                    info.healthScore = data.healthScore || 0;
                    info.orphanTraces = data.orphanTraces || 0;
                    info.validationWarnings = data.validationWarnings || 0;
                    info.isAvailable = true;
                }
            }

            // ── Fallback: check if trace system exists ──
            if (!info.isAvailable) {
                var traceCollector = LawAIApp.RuntimeTraceCollector || window.runtimeTraceCollector;
                if (traceCollector) {
                    info.isAvailable = true;
                    info.status = 'idle';
                    info.statusText = 'Ready';
                    info.statusColor = '#f59e0b';
                }
            }

            // ── Status Color ──
            if (info.healthScore >= 80) {
                info.statusColor = '#22c55e';
                info.statusText = 'Healthy';
            } else if (info.healthScore >= 50) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Warning';
            } else if (info.isAvailable) {
                info.statusColor = '#64748b';
                info.statusText = 'Idle';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[TracePanel] Could not get trace data:', err);
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
            <div id="trace-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(6,182,212,0.04);border-radius:8px;border-left:2px solid #06b6d4;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🛰 Runtime Tracing</span>
                    <span style="font-size:10px;color:${data.healthScore >= 80 ? '#22c55e' : '#f59e0b'};">${data.healthScore}%</span>
                </div>
                
                ${data.isAvailable ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Traces: ${data.totalTraces}</span>
                    <span>Active: ${data.activeTraces}</span>
                    <span>Coverage: ${data.coverage}%</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Completed: ${data.completedTraces}</span>
                    ${data.failedTraces > 0 ? `<span style="color:#ef4444;">❌ Failed: ${data.failedTraces}</span>` : ''}
                    ${data.orphanTraces > 0 ? `<span style="color:#f59e0b;">📭 Orphans: ${data.orphanTraces}</span>` : ''}
                    ${data.failedTraces === 0 && data.orphanTraces === 0 ? '<span>✅ All traces healthy</span>' : ''}
                </div>
                
                <!-- Warnings -->
                ${data.failedTraces > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${data.failedTraces} failed traces
                    </div>
                ` : ''}
                ${data.orphanTraces > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${data.orphanTraces} orphan traces detected
                    </div>
                ` : ''}
                ${data.validationWarnings > 0 ? `
                    <div style="font-size:8px;color:#f59e0b;margin-top:1px;">
                        ⚠️ ${data.validationWarnings} validation warnings
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ⚠️ Trace system not available
                </div>
                <div style="font-size:8px;color:#475569;margin-top:2px;">
                    Runtime Tracing not initialized
                </div>
                `}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="trace-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#06b6d4;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.TracePanel._handleRefresh()">
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
                var unsub = eventBus.on('trace.recorded', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
                
                var unsubComplete = eventBus.on('trace.completed', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubComplete);
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

console.log('✅ [Part 49.8.4] TracePanel loaded');
