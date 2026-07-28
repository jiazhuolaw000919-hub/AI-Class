// ============================================================
// runtimePanel.js
// Part 49.8.2 — Extract Runtime Panel
// Version: v4.9.8.2
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Runtime Panel
 * 
 * 职责：
 * - render(container) — 渲染 Runtime UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 不负责：
 * - 任何 Business Logic
 * - 直接读取 window/LawAIApp/BootManager（通过 _getData 封装）
 * - 格式化其他 Panel 的数据
 */
LawAIApp.Debug.Panels.RuntimePanel = {
    _container: null,
    _visible: false,
    _refreshInterval: null,
    _data: null,
    _eventUnsubscribers: [],

    // ============================================================
    // PANEL CONTRACT — 必须实现的方法
    // ============================================================

    /**
     * 渲染 Runtime Panel
     * @param {HTMLElement} container - 父容器
     * @returns {Object} this — 支持链式调用
     */
    render: function(container) {
        if (!container) {
            console.warn('[RuntimePanel] No container provided');
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
     * 刷新数据 — 更新 Runtime UI
     */
    refresh: function() {
        if (!this._visible || !this._container) {
            return;
        }
        
        try {
            this._data = this._getData();
            this._updateUI(this._data);
        } catch (err) {
            console.warn('[RuntimePanel] Refresh failed:', err);
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
    // RUNTIME API — 数据获取（封装 Runtime 访问）
    // ============================================================

    /**
     * 获取 Runtime 数据
     * 唯一访问 LawAIApp / BootManager 的地方
     * @private
     * @returns {Object} Runtime 信息
     */
       _getData: function() {
        var info = {
            ready: false,
            status: 'unknown',
            uptime: '0s',
            version: 'N/A',
            registryCount: 0,
            registryModules: '',
            bootStage: 'N/A',
            bootProgress: 0
        };

        try {
            // ── 🔥 NEW: 从 RuntimeExplorer 获取数据 ──
            var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        
            // ── 1. BOOT MANAGER ──
            var bm = LawAIApp.BootManager || window.bootManager;
            if (bm) {
                info.ready = !!(bm._booted || (typeof bm.isBooted === 'function' && bm.isBooted()));
                info.status = info.ready ? 'running' : (bm._booting ? 'booting' : 'idle');
            
                if (bm._bootTimestamp) {
                    var elapsed = Date.now() - bm._bootTimestamp;
                    info.uptime = this._formatDuration(Math.round(elapsed / 1000));
                }
            }

            // ── 2. 🔥 从 Explorer 获取更多信息 ──
            if (explorer && explorer.getEntry) {
                var bootEntry = explorer.getEntry('BootManager');
                if (bootEntry) {
                    info.bootStage = bootEntry.metadata?.stage || 'N/A';
                    info.bootProgress = bootEntry.metadata?.progress || 0;
                }
            
                // ── 获取 Registry Count ──
                var allEntries = explorer.getAllEntries();
                if (allEntries) {
                    info.registryCount = Object.keys(allEntries).length;
                }
            }

            // ── 3. VERSION ──
            info.version = (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) || 'V4.5.9';

            // ── 4. REGISTRY COUNT (Fallback) ──
            if (info.registryCount === 0) {
                var count = 0;
                var names = [];
                for (var key in LawAIApp) {
                    if (LawAIApp.hasOwnProperty(key) && 
                        typeof LawAIApp[key] === 'object' && 
                        LawAIApp[key] !== null &&
                        key !== 'Debug' && 
                        key !== 'DevPanel' &&
                        key.charAt(0) !== '_') {
                        count++;
                        if (names.length < 10) names.push(key);
                    }
                }
                info.registryCount = count;
                info.registryModules = names.join(', ') + (count > 10 ? '...' : '');
            }

        } catch (err) {
            console.warn('[RuntimePanel] Could not get runtime data:', err);
        }

        return info;
    },
    // ============================================================
    // UI RENDERING — 所有 Runtime HTML 在此控制
    // ============================================================

    /**
     * 构建 HTML
     * @private
     * @param {Object} data - Runtime 数据
     * @returns {string} HTML 字符串
     */
    _buildHTML: function(data) {
        var statusColor = data.ready ? '#22c55e' : (data.status === 'booting' ? '#f59e0b' : '#64748b');
        var statusText = data.ready ? '✅ Ready' : (data.status === 'booting' ? '⏳ Booting...' : '⏸️ ' + data.status);
        
        return `
            <div id="runtime-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.06);border-radius:8px;border-left:2px solid #4a9eff;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime</span>
                    <span style="font-size:10px;color:${statusColor};">${statusText}</span>
                </div>
                
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Uptime: ${data.uptime}</span>
                    <span>Version: ${data.version}</span>
                </div>
                
                <!-- Registry -->
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Registry: ${data.registryCount} modules loaded
                    ${data.registryModules ? ' — ' + data.registryModules : ''}
                </div>
                
                <!-- Boot Progress (if booting) -->
                ${data.status === 'booting' ? `
                <div style="margin-top:4px;">
                    <div style="font-size:8px;color:#475569;">Boot Progress: ${Math.round(data.bootProgress)}%</div>
                    <div style="width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:2px;overflow:hidden;">
                        <div style="width:${Math.round(data.bootProgress)}%;height:100%;background:#4a9eff;border-radius:2px;transition:width 0.3s;"></div>
                    </div>
                    <div style="font-size:8px;color:#475569;margin-top:2px;">Current: ${data.bootStage}</div>
                </div>
                ` : ''}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="runtime-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#4a9eff;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.RuntimePanel._handleRefresh()">
                        🔄 refresh
                    </span>
                </div>
            </div>
        `;
    },

    /**
     * 更新 UI（不重建整个 DOM，仅更新数据）
     * @private
     * @param {Object} data - Runtime 数据
     */
    _updateUI: function(data) {
        if (!this._container) return;
        
        // 简单方案：重新渲染整个容器
        // Runtime Panel 数据量小，性能无影响
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
        
        // ── Runtime 事件监听 ──
        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsubBoot = eventBus.on('runtime.boot.complete', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubBoot);
                
                var unsubState = eventBus.on('runtime.state.change', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubState);
            }
        } catch (err) {
            // EventBus not available — 静默失败
        }
        
        // ── 键盘快捷键 ──
        this._boundKeyHandler = this._handleKeyDown.bind(this);
        document.addEventListener('keydown', this._boundKeyHandler);
    },

    /**
     * 解绑事件
     * @private
     */
    _unbindEvents: function() {
        // 取消事件订阅
        this._eventUnsubscribers.forEach(function(unsub) {
            if (typeof unsub === 'function') {
                try { unsub(); } catch (e) { /* ignore */ }
            }
        });
        this._eventUnsubscribers = [];
        
        // 移除键盘监听
        if (this._boundKeyHandler) {
            document.removeEventListener('keydown', this._boundKeyHandler);
            this._boundKeyHandler = null;
        }
    },

    /**
     * 键盘事件处理
     * @private
     */
    _handleKeyDown: function(e) {
        // Ctrl+Shift+R — 手动刷新 Runtime
        if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
            e.preventDefault();
            this.refresh();
        }
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
        }.bind(this), 5000); // 每 5 秒刷新（降低频率减少开销）
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
    // UTILITY — 格式化工具（仅 Runtime Panel 使用）
    // ============================================================

    /**
     * 格式化时长
     * @private
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时长
     */
    _formatDuration: function(seconds) {
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return mins + 'm ' + secs + 's';
        } else {
            var hours = Math.floor(seconds / 3600);
            var mins = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + mins + 'm';
        }
    },

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

// 为了兼容旧代码，保留 _getRuntimeInfo 的引用
LawAIApp.Debug.DevPanel = LawAIApp.Debug.DevPanel || {};
LawAIApp.Debug.DevPanel._getRuntimeInfo = function() {
    return LawAIApp.Debug.Panels.RuntimePanel._getData();
};

console.log('✅ [Part 49.8.2] RuntimePanel loaded');
console.log('   📋 Contract: render() | refresh() | destroy() | isVisible()');
