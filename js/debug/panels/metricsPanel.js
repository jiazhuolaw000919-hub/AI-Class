// ============================================================
// metricsPanel.js
// Part 49.8.8 — Metrics Panel
// Version: v4.9.8.8
// Status: Architecture Restoration
// Module: Developer Experience Layer — Panels
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Metrics Panel
 * 
 * 职责：
 * - Runtime Metrics
 * - Coverage
 * - Health
 * - Errors
 * - Warnings
 * 
 * 数据来源：
 * - LawAIApp.RuntimeMetricsHealth
 * - LawAIApp.RuntimeMetricsCollector
 */
LawAIApp.Debug.Panels.MetricsPanel = {
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
            console.warn('[MetricsPanel] No container provided');
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
            console.warn('[MetricsPanel] Refresh failed:', err);
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
    // METRICS API
    // ============================================================

    // metricsPanel.js — _getData() 方法

    _getData: function() {
        var info = {
            status: 'unknown',
            totalMetrics: 0,
            collectedMetrics: 0,
            coverage: 0,
            healthScore: 0,
            errors: 0,
            warnings: 0,
            missingMetrics: [],
            validationWarnings: 0,
            isAvailable: false,
            hasData: false,
            statusColor: '#64748b',
            statusText: 'Unknown',
            metricNames: []
        };

        try {
            // ── 🔥 NEW: 从 RuntimeExplorer 获取数据 ──
            var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        
            if (explorer && explorer.getAllEntries) {
                var allEntries = explorer.getAllEntries();
                if (allEntries) {
                    // 过滤出 metrics 类型的组件
                    var metricsEntries = [];
                    for (var id in allEntries) {
                        if (allEntries.hasOwnProperty(id)) {
                            var entry = allEntries[id];
                            if (entry.type === 'metric' || entry.category === 'performance') {
                                metricsEntries.push(entry);
                            }
                        }
                    }
                    info.totalMetrics = metricsEntries.length;
                    info.collectedMetrics = metricsEntries.filter(function(e) { 
                        return e.status === 'active'; 
                    }).length;
                    info.hasData = info.collectedMetrics > 0;
                
                    if (info.totalMetrics > 0) {
                        info.coverage = Math.round((info.collectedMetrics / info.totalMetrics) * 100);
                    }
                }
            }

            // ── 原有 Metrics Health 逻辑 ──
            var health = LawAIApp.RuntimeMetricsHealth || window.runtimeMetricsHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                if (data) {
                    info.status = data.status || 'unknown';
                    info.totalMetrics = data.totalMetrics || info.totalMetrics;
                    info.collectedMetrics = data.collectedMetrics || info.collectedMetrics;
                    info.coverage = data.coverageScore || info.coverage;
                    info.healthScore = data.healthScore || 0;
                    info.errors = data.errors || 0;
                    info.warnings = data.warnings || 0;
                    info.missingMetrics = data.missingMetrics || [];
                    info.validationWarnings = data.validationWarnings || 0;
                    info.isAvailable = true;
                    info.hasData = info.hasData || info.collectedMetrics > 0;
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

            if (info.errors > 0) {
                info.statusColor = '#ef4444';
                info.statusText = 'Errors';
            }

        } catch (err) {
            console.warn('[MetricsPanel] Could not get metrics data:', err);
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
            div id="metrics-panel-container" 
             style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;cursor:pointer;"
             onclick="LawAIApp.Debug.Details.PanelDetailManager.open('metrics')"
             title="Click for full details">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">📈 Runtime Metrics</span>
                    <span style="font-size:10px;color:${data.healthScore >= 80 ? '#22c55e' : (data.healthScore >= 50 ? '#f59e0b' : '#64748b')};">${data.healthScore}%</span>
                </div>
                
                ${data.isAvailable ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Metrics: ${data.collectedMetrics}/${data.totalMetrics}</span>
                    <span>Coverage: ${data.coverage}%</span>
                    <span>Health: ${data.healthScore}%</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    ${data.errors > 0 ? `<span style="color:#ef4444;">❌ Errors: ${data.errors}</span>` : ''}
                    ${data.warnings > 0 ? `<span style="color:#f59e0b;">⚠️ Warnings: ${data.warnings}</span>` : ''}
                    ${data.missingMetrics.length > 0 ? `<span style="color:#94a3b8;">📭 Missing: ${data.missingMetrics.length}</span>` : ''}
                </div>
                
                <!-- Missing Metrics List -->
                ${data.missingMetrics.length > 0 ? `
                    <div style="font-size:8px;color:#475569;margin-top:2px;max-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        Missing: ${data.missingMetrics.slice(0, 4).join(', ')}${data.missingMetrics.length > 4 ? '...' : ''}
                    </div>
                ` : ''}
                
                <!-- Metric Names -->
                ${data.metricNames.length > 0 ? `
                    <div style="margin-top:2px;font-size:7px;color:#475569;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        📊 ${data.metricNames.join(', ')}${data.metricNames.length > 10 ? '...' : ''}
                    </div>
                ` : ''}
                
                ${data.validationWarnings > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${data.validationWarnings} validation warnings
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ⚠️ Metrics system not available
                </div>
                `}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="metrics-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.MetricsPanel._handleRefresh()">
                        🔄 refresh
                    </span>
                </div>

                <!-- Click Hint -->
                <div style="font-size:7px;color:#475569;text-align:right;margin-top:2px;">
                    🔍 Click for details
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
                var unsub = eventBus.on('metrics.collected', function() {
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

console.log('✅ [Part 49.8.8] MetricsPanel loaded');
