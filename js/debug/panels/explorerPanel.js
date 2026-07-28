// ============================================================
// explorerPanel.js
// Part 49.9.6 — Runtime Explorer Panel (DevPanel Integration)
// Version: v4.9.9.6
// Status: Architecture Integration
// Module: Developer Experience Layer — Panels
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Explorer Panel
 * 
 * 职责：
 * - 在 DevPanel 中显示 Runtime Explorer 入口
 * - 显示 Registry 统计信息
 * - 提供快捷操作 (Build Snapshot, Search, etc.)
 * - 点击后展开详细 Explorer 视图
 */
LawAIApp.Debug.Panels.ExplorerPanel = {
    _container: null,
    _visible: false,
    _refreshInterval: null,
    _data: null,
    _expanded: false,

    // ============================================================
    // PANEL CONTRACT
    // ============================================================

    render: function(container) {
        if (!container) {
            console.warn('[ExplorerPanel] No container provided');
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
            console.warn('[ExplorerPanel] Refresh failed:', err);
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
    // GET DATA — 从 RuntimeExplorer 获取数据
    // ============================================================

    _getData: function() {
        var info = {
            isAvailable: false,
            componentCount: 0,
            healthyCount: 0,
            warningCount: 0,
            errorCount: 0,
            healthScore: 0,
            snapshotCount: 0,
            registryReady: false,
            inspectorReady: false,
            searchReady: false,
            statusColor: '#64748b',
            statusText: 'Unavailable'
        };

        try {
            var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
            var registry = LawAIApp.Runtime && LawAIApp.Runtime.Registry;
            var inspector = LawAIApp.Runtime && LawAIApp.Runtime.Inspector;
            var search = LawAIApp.Runtime && LawAIApp.Runtime.Search;
            var snapshot = LawAIApp.Runtime && LawAIApp.Runtime.Snapshot;

            // ── Check availability ──
            if (explorer && explorer.isInitialized && explorer.isInitialized()) {
                info.isAvailable = true;
                info.registryReady = true;
            }

            if (registry && registry.getAll) {
                var all = registry.getAll();
                if (all) {
                    info.componentCount = Object.keys(all).length;
                    
                    // ── Count by status ──
                    var healthy = 0, warning = 0, error = 0;
                    for (var id in all) {
                        if (!all.hasOwnProperty(id)) continue;
                        var entry = all[id];
                        if (entry.status === 'active' || entry.status === 'healthy') {
                            healthy++;
                        } else if (entry.status === 'error') {
                            error++;
                        } else {
                            warning++;
                        }
                    }
                    info.healthyCount = healthy;
                    info.warningCount = warning;
                    info.errorCount = error;
                    
                    if (info.componentCount > 0) {
                        info.healthScore = Math.round((healthy / info.componentCount) * 100);
                    }
                }
            }

            if (inspector && inspector.getStats) {
                var stats = inspector.getStats();
                info.snapshotCount = stats.snapshotCount || 0;
                info.inspectorReady = true;
            }

            if (search && search.isInitialized && search.isInitialized()) {
                info.searchReady = true;
            }

            // ── Status ──
            if (info.healthScore >= 80) {
                info.statusColor = '#22c55e';
                info.statusText = 'Healthy';
            } else if (info.healthScore >= 50) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Warning';
            } else if (info.componentCount > 0) {
                info.statusColor = '#64748b';
                info.statusText = 'Idle';
            } else if (info.isAvailable) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Loading';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[ExplorerPanel] Could not get explorer data:', err);
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
            <div id="explorer-panel-container" 
             style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;cursor:pointer;"
             onclick="LawAIApp.Debug.Details.PanelDetailManager.open('explorer')"
             title="Click for full details">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔍 Runtime Explorer</span>
                    <span style="font-size:10px;color:${statusColor};">${data.isAvailable ? '✅ Active' : '⏳ Loading'}</span>
                </div>
                
                ${data.isAvailable ? `
                <!-- Stats -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Components: ${data.componentCount}</span>
                    <span>✅ ${data.healthyCount}</span>
                    <span>⚠️ ${data.warningCount}</span>
                    <span>❌ ${data.errorCount}</span>
                    <span>Health: ${data.healthScore}%</span>
                </div>
                
                <!-- Quick Actions -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;">
                    <button onclick="event.stopPropagation();LawAIApp.Debug.Panels.ExplorerPanel._buildSnapshot()" 
                            style="padding:2px 10px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:6px;color:#4a9eff;font-size:9px;cursor:pointer;">
                        📸 Snapshot
                    </button>
                    <button onclick="event.stopPropagation();LawAIApp.Debug.Panels.ExplorerPanel._exportReport()" 
                            style="padding:2px 10px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:6px;color:#8b5cf6;font-size:9px;cursor:pointer;">
                        📊 Export
                    </button>
                    <button onclick="event.stopPropagation();LawAIApp.Debug.Panels.ExplorerPanel._refreshExplorer()" 
                            style="padding:2px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#94a3b8;font-size:9px;cursor:pointer;">
                        🔄 Refresh
                    </button>
                </div>
                
                <!-- Status Badges -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:7px;color:#475569;">
                    ${data.registryReady ? '<span>📋 Registry ✅</span>' : '<span>📋 Registry ⏳</span>'}
                    ${data.inspectorReady ? '<span>🔬 Inspector ✅</span>' : '<span>🔬 Inspector ⏳</span>'}
                    ${data.searchReady ? '<span>🔎 Search ✅</span>' : '<span>🔎 Search ⏳</span>'}
                    <span>📸 ${data.snapshotCount} snapshots</span>
                </div>
                
                <!-- Click Hint -->
                <div style="font-size:7px;color:#475569;margin-top:2px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:3px;">
                    Click to open full Explorer
                </div>
                ` : `
                <!-- Loading State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ⏳ Runtime Explorer initializing...
                </div>
                <div style="font-size:8px;color:#475569;margin-top:2px;">
                    Please wait for system to load
                </div>
                `}

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
    // ACTIONS
    // ============================================================

    /**
     * 打开完整的 Runtime Explorer
     * @private
     */
    _openExplorer: function() {
        console.log('🔍 [ExplorerPanel] Opening Runtime Explorer...');
        
        // ── 检查 Explorer 是否可用 ──
        var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        if (!explorer || !explorer.isInitialized || !explorer.isInitialized()) {
            alert('⚠️ Runtime Explorer not available. Please check console for errors.');
            return;
        }

        // ── 获取 Tree ──
        var tree = explorer.getTree ? explorer.getTree() : null;
        
        // ── 获取 Stats ──
        var stats = explorer.getStats ? explorer.getStats() : null;

        // ── 构建弹窗内容 ──
        var content = this._buildExplorerContent(tree, stats);
        
        // ── 创建浮窗 ──
        this._createExplorerPopup(content);
    },

    /**
     * 构建 Explorer 内容
     * @private
     */
    _buildExplorerContent: function(tree, stats) {
        var html = '';

        html += '<div style="max-width:600px;max-height:80vh;overflow-y:auto;padding:4px;">';

        // ── Header ──
        html += '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;margin-bottom:10px;">';
        html += '<span style="font-size:14px;font-weight:700;color:#4a9eff;">🔍 Runtime Explorer</span>';
        html += '<span style="font-size:10px;color:#475569;">v4.9.9.5</span>';
        html += '</div>';

        // ── Stats ──
        if (stats) {
            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">';
            html += '<div style="padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#4a9eff;">' + stats.total + '</div><div style="font-size:8px;color:#475569;">Components</div></div>';
            html += '<div style="padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#22c55e;">' + (stats.byStatus?.active || 0) + '</div><div style="font-size:8px;color:#475569;">Active</div></div>';
            html += '<div style="padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#8b5cf6;">' + Object.keys(stats.byType || {}).length + '</div><div style="font-size:8px;color:#475569;">Types</div></div>';
            html += '</div>';
        }

        // ── Tree ──
        if (tree) {
            html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">📂 Runtime Structure</div>';
            html += '<div style="padding:6px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:9px;font-family:monospace;max-height:300px;overflow-y:auto;">';
            html += this._renderTree(tree, 0);
            html += '</div>';
        }

        // ── Actions ──
        html += '<div style="display:flex;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">';
        html += '<button onclick="LawAIApp.Runtime.Snapshot.export({format:\'json\',download:true})" style="padding:4px 12px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:6px;color:#4a9eff;font-size:10px;cursor:pointer;">📸 Export JSON</button>';
        html += '<button onclick="LawAIApp.Runtime.Snapshot.export({format:\'markdown\',download:true})" style="padding:4px 12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:6px;color:#8b5cf6;font-size:10px;cursor:pointer;">📊 Export MD</button>';
        html += '<button onclick="LawAIApp.Debug.Panels.ExplorerPanel._closeExplorerPopup()" style="padding:4px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#64748b;font-size:10px;cursor:pointer;">✕ Close</button>';
        html += '</div>';

        html += '</div>';

        return html;
    },

    /**
     * 渲染 Tree
     * @private
     */
    _renderTree: function(node, depth) {
        var indent = '  '.repeat(depth);
        var html = '';

        if (!node) return '';

        if (node.label) {
            var icon = node.type === 'root' ? '📁' : '📄';
            var color = node.type === 'collection' ? '#4a9eff' : '#94a3b8';
            html += indent + '<span style="color:' + color + ';">' + icon + ' ' + node.label + '</span>';
            if (node.id) {
                html += ' <span style="color:#475569;font-size:8px;">(' + node.id + ')</span>';
            }
            html += '\n';
        }

        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                html += this._renderTree(node.children[i], depth + 1);
            }
        }

        return html;
    },

    /**
     * 创建 Explorer 弹窗
     * @private
     */
    _createExplorerPopup: function(content) {
        // ── 移除旧弹窗 ──
        this._closeExplorerPopup();

        // ── 创建弹窗 ──
        var overlay = document.createElement('div');
        overlay.id = 'explorer-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;

        var popup = document.createElement('div');
        popup.id = 'explorer-popup';
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

        // ── 点击外部关闭 ──
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                LawAIApp.Debug.Panels.ExplorerPanel._closeExplorerPopup();
            }
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // ── 保存引用 ──
        this._popupOverlay = overlay;
        this._popup = popup;
    },

    /**
     * 关闭 Explorer 弹窗
     * @private
     */
    _closeExplorerPopup: function() {
        if (this._popupOverlay) {
            this._popupOverlay.remove();
            this._popupOverlay = null;
            this._popup = null;
        }
    },

    /**
     * 构建 Snapshot
     * @private
     */
    _buildSnapshot: function() {
        var snapshot = LawAIApp.Runtime && LawAIApp.Runtime.Snapshot;
        if (snapshot && snapshot.build) {
            var result = snapshot.build();
            if (result) {
                alert('✅ Snapshot built: ' + result.id + '\nComponents: ' + result.summary.componentCount + '\nHealth: ' + result.summary.healthScore + '%');
                this.refresh();
            }
        } else {
            alert('⚠️ Snapshot system not available');
        }
    },

    /**
     * 导出 Report
     * @private
     */
    _exportReport: function() {
        var snapshot = LawAIApp.Runtime && LawAIApp.Runtime.Snapshot;
        if (snapshot && snapshot.export) {
            snapshot.export({ format: 'markdown', download: true });
        } else {
            alert('⚠️ Export system not available');
        }
    },

    /**
     * 刷新 Explorer
     * @private
     */
    _refreshExplorer: function() {
        var explorer = LawAIApp.Runtime && LawAIApp.Runtime.Explorer;
        if (explorer && explorer.refreshSearchIndex) {
            explorer.refreshSearchIndex();
        }
        this.refresh();
        console.log('[ExplorerPanel] Refreshed');
    },

    // ============================================================
    // EVENT BINDING
    // ============================================================

    _bindEvents: function() {
        if (!this._container) return;

        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('registry.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers = this._eventUnsubscribers || [];
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) { /* ignore */ }
    },

    _unbindEvents: function() {
        if (this._eventUnsubscribers) {
            this._eventUnsubscribers.forEach(function(unsub) {
                if (typeof unsub === 'function') {
                    try { unsub(); } catch (e) { /* ignore */ }
                }
            });
            this._eventUnsubscribers = [];
        }
    },

    // ============================================================
    // AUTO REFRESH
    // ============================================================

    _startAutoRefresh: function() {
        if (this._refreshInterval) return;
        this._refreshInterval = setInterval(function() {
            this.refresh();
        }.bind(this), 10000); // 10 seconds
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
};

console.log('🔍 [Part 49.9.6] ExplorerPanel loaded');
console.log('   📋 Click the panel or use DevPanel to access Runtime Explorer');
