// ============================================================
// performancePanel.js
// Part 49.8.3 — Extract Performance Panel
// Version: v4.9.8.3
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Performance Panel
 * 
 * 职责：
 * - render(container) — 渲染 Performance UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 统一通过 LawAIApp.Performance 获取
 * - 禁止直接读取内部 Store
 * - 禁止重复计算已有指标
 */
LawAIApp.Debug.Panels.PerformancePanel = {
    _container: null,
    _visible: false,
    _refreshInterval: null,
    _data: null,
    _eventUnsubscribers: [],

    // ============================================================
    // PANEL CONTRACT — 必须实现的方法
    // ============================================================

    /**
     * 渲染 Performance Panel
     * @param {HTMLElement} container - 父容器
     * @returns {Object} this — 支持链式调用
     */
    render: function(container) {
        if (!container) {
            console.warn('[PerformancePanel] No container provided');
            return this;
        }

        this._container = container;
        this._visible = true;
        
        // 获取数据
        this._data = this._getData();
        
        // 构建 HTML
        container.innerHTML = this._buildHTML(this._data);
        
        // 绑定事件
        this._bindEvents();
        
        // 开始自动刷新
        this._startAutoRefresh();
        
        return this;
    },

    /**
     * 刷新数据 — 更新 Performance UI
     */
    refresh: function() {
        if (!this._visible || !this._container) {
            return;
        }
        
        try {
            this._data = this._getData();
            this._updateUI(this._data);
        } catch (err) {
            console.warn('[PerformancePanel] Refresh failed:', err);
        }
    },

    /**
     * 销毁 Panel — 清理所有资源
     */
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

    /**
     * 检查 Panel 是否可见
     * @returns {boolean}
     */
    isVisible: function() {
        return this._visible;
    },

    // ============================================================
    // PERFORMANCE API — 统一通过 LawAIApp.Performance 获取数据
    // ============================================================

    /**
     * 获取 Performance 数据
     * 统一通过 LawAIApp.Performance 获取
     * 禁止直接读取内部 Store
     * @private
     * @returns {Object} Performance 信息
     */
    _getData: function() {
        var info = {
            score: 0,
            status: 'UNKNOWN',
            label: 'Unknown',
            bootDuration: 'N/A',
            averageDuration: 'N/A',
            slowestModule: 'N/A',
            fastestModule: 'N/A',
            totalModules: 0,
            totalRecords: 0,
            warnings: [],
            hasData: false,
            isAvailable: false,
            healthScore: 0,
            statusColor: '#64748b'
        };

        try {
            // ── PRIMARY SOURCE: Performance API ──
            var perf = LawAIApp.Performance || (window.LawAIApp && window.LawAIApp.Performance);
            if (perf) {
                info.isAvailable = true;
                var report = null;
                if (typeof perf.report === 'function') {
                    report = perf.report();
                }
                if (report) {
                    info.hasData = !!(report.summary && report.summary.hasData);
                    
                    // Health
                    if (report.health) {
                        info.score = report.health.score || 0;
                        info.status = report.health.status || 'UNKNOWN';
                        info.label = report.health.label || 'Unknown';
                        info.healthScore = report.health.score || 0;
                    }
                    
                    // Summary
                    if (report.summary) {
                        info.bootDuration = report.summary.bootDuration || 'N/A';
                        info.averageDuration = report.summary.averageDuration || 'N/A';
                        info.slowestModule = report.summary.slowestModule || 'N/A';
                        info.fastestModule = report.summary.fastestModule || 'N/A';
                        info.totalModules = report.summary.totalModules || 0;
                        info.totalRecords = report.summary.totalRecords || 0;
                    }
                    
                    // Warnings
                    if (report.warnings) {
                        info.warnings = report.warnings;
                    }
                }
            }

            // ── FALLBACK 1: BootPipeline ──
            if (!info.hasData) {
                var pipeline = LawAIApp.BootPipeline || window.bootPipeline;
                if (pipeline && typeof pipeline.getPipelineStatus === 'function') {
                    var ps = pipeline.getPipelineStatus();
                    if (ps && ps.status === 'completed') {
                        info.isAvailable = true;
                        info.hasData = true;
                        info.bootDuration = ps.totalDuration ? ps.totalDuration + 'ms' : 'N/A';
                        info.totalModules = (ps.completedStages && ps.completedStages.length) || 0;
                        info.score = 100;
                        info.status = 'EXCELLENT';
                        info.label = 'Boot Completed';
                        info.healthScore = 100;
                    } else if (ps && ps.status === 'running') {
                        info.isAvailable = true;
                        info.label = 'Booting...';
                        info.status = 'BOOTING';
                    }
                }
            }

            // ── FALLBACK 2: BootManager ──
            if (!info.hasData) {
                var bm = LawAIApp.BootManager || window.bootManager;
                if (bm && bm._booted) {
                    info.isAvailable = true;
                    info.hasData = true;
                    info.score = 100;
                    info.status = 'EXCELLENT';
                    info.label = 'Booted';
                    info.bootDuration = 'N/A';
                    info.healthScore = 100;
                }
            }

            // ── Status Color ──
            if (info.score >= 80) {
                info.statusColor = '#22c55e';
            } else if (info.score >= 50) {
                info.statusColor = '#f59e0b';
            } else {
                info.statusColor = '#ef4444';
            }

        } catch (err) {
            console.warn('[PerformancePanel] Could not get performance data:', err);
        }

        return info;
    },

    // ============================================================
    // UI RENDERING — 所有 Performance HTML 在此控制
    // ============================================================

    /**
     * 构建 HTML
     * @private
     * @param {Object} data - Performance 数据
     * @returns {string} HTML 字符串
     */
    _buildHTML: function(data) {
        var scoreColor = data.score >= 80 ? '#22c55e' : (data.score >= 50 ? '#f59e0b' : '#ef4444');
        var scoreDisplay = data.isAvailable ? data.score + '%' : 'N/A';
        var statusDisplay = data.label || 'Unknown';
        var statusColor = data.statusColor || '#64748b';
        
        return `
            <div id="performance-panel-container" 
             style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;cursor:pointer;"
             onclick="LawAIApp.Debug.Details.PanelDetailManager.open('performance')"
             title="Click for full details">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime Performance</span>
                    <span style="font-size:10px;color:${scoreColor};">${scoreDisplay}</span>
                </div>
                
                ${data.isAvailable && data.hasData ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${statusDisplay}</span></span>
                    <span>Boot: ${data.bootDuration}</span>
                    <span>Modules: ${data.totalModules}</span>
                    <span>Records: ${data.totalRecords}</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Avg: ${data.averageDuration}</span>
                    <span>Slowest: ${data.slowestModule}</span>
                    <span>Fastest: ${data.fastestModule}</span>
                </div>
                
                <!-- Warnings -->
                ${data.warnings && data.warnings.length > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${data.warnings.length} performance ${data.warnings.length === 1 ? 'warning' : 'warnings'}
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ${data.isAvailable ? '⏳ Collecting performance data...' : '⚠️ Performance framework not available'}
                </div>
                `}
                
                ${!data.isAvailable ? `
                    <div style="font-size:8px;color:#475569;margin-top:2px;">
                        Enable debug mode or restart to collect data
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="perf-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.PerformancePanel._handleRefresh()">
                        🔄 refresh
                    </span>
                </div>

                !-- Click Hint -->
                <div style="font-size:7px;color:#475569;text-align:right;margin-top:2px;">
                    🔍 Click for details
                </div>
            </div>
        `;
    },

    /**
     * 更新 UI（不重建整个 DOM，仅更新数据）
     * @private
     * @param {Object} data - Performance 数据
     */
    _updateUI: function(data) {
        if (!this._container) return;
        
        // 简单方案：重新渲染整个容器
        // Performance Panel 数据量小，性能无影响
        this._container.innerHTML = this._buildHTML(data);
    },

    // ============================================================
    // EVENT BINDING — 所有事件在此管理
    // ============================================================

    /**
     * 绑定事件
     * @private
     */
    _bindEvents: function() {
        if (!this._container) return;
        
        // ── Performance 事件监听 ──
        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsubPerf = eventBus.on('performance.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubPerf);
                
                var unsubBoot = eventBus.on('runtime.boot.complete', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubBoot);
            }
        } catch (err) {
            // EventBus not available — 静默失败
        }
        
        // ── Performance API 直接监听 ──
        try {
            var perf = LawAIApp.Performance;
            if (perf && typeof perf.on === 'function') {
                var unsub = perf.on('update', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) {
            // Performance.on not available
        }
    },

    /**
     * 解绑事件
     * @private
     */
    _unbindEvents: function() {
        this._eventUnsubscribers.forEach(function(unsub) {
            if (typeof unsub === 'function') {
                try { unsub(); } catch (e) { /* ignore */ }
            }
        });
        this._eventUnsubscribers = [];
    },

    /**
     * 刷新按钮处理（暴露给 onclick）
     * @private
     */
    _handleRefresh: function() {
        this.refresh();
    },

    // ============================================================
    // AUTO REFRESH — 定时刷新
    // ============================================================

    /**
     * 启动自动刷新
     * @private
     */
    _startAutoRefresh: function() {
        if (this._refreshInterval) return;
        this._refreshInterval = setInterval(function() {
            this.refresh();
        }.bind(this), 5000); // 每 5 秒刷新
    },

    /**
     * 停止自动刷新
     * @private
     */
    _stopAutoRefresh: function() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
    },

    // ============================================================
    // UTILITY — 格式化工具（仅 Performance Panel 使用）
    // ============================================================

    /**
     * 格式化时间戳
     * @private
     * @param {number} ts - 时间戳
     * @returns {string} 格式化后的时间
     */
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

// ============================================================
// ALIASES — 保持兼容
// ============================================================

console.log('✅ [Part 49.8.3] PerformancePanel loaded');
console.log('   📋 Contract: render() | refresh() | destroy() | isVisible()');
