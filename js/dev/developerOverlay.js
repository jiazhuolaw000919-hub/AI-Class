// ================================================================
// developerOverlay.js – Developer Overlay V1.0.0
// Ctrl+Shift+K 显示性能数据覆盖层
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.DeveloperOverlay = {
    _visible: false,
    _overlay: null,
    _shortcut: 'Ctrl+Shift+K',

    /**
     * 初始化
     */
    init: function() {
        // 监听键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
                e.preventDefault();
                this.toggle();
            }
        }.bind(this));

        console.log('🛠️ DeveloperOverlay initialized (Ctrl+Shift+K to toggle)');
    },

    /**
     * 切换显示
     */
    toggle: function() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * 显示覆盖层
     */
    show: function() {
        if (this._visible) return;
        this._visible = true;

        if (!this._overlay) {
            this._buildOverlay();
        }

        this._updateData();
        this._overlay.style.display = 'block';
        console.log('🛠️ DeveloperOverlay shown');
    },

    /**
     * 隐藏覆盖层
     */
    hide: function() {
        if (!this._visible) return;
        this._visible = false;
        if (this._overlay) {
            this._overlay.style.display = 'none';
        }
        console.log('🛠️ DeveloperOverlay hidden');
    },

    /**
     * 构建覆盖层 DOM
     */
    _buildOverlay: function() {
        var overlay = document.createElement('div');
        overlay.id = 'dev-overlay';
        overlay.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 340px;
            max-height: 60vh;
            overflow-y: auto;
            background: rgba(11,18,32,0.92);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 16px 20px;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, monospace;
            font-size: 12px;
            z-index: 99999;
            box-shadow: 0 16px 64px rgba(0,0,0,0.6);
            display: none;
            pointer-events: none;
            user-select: none;
        `;

        overlay.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;">
                <span style="font-weight:600;color:#4a9eff;font-size:13px;">🛠️ Runtime</span>
                <span style="font-size:10px;color:#64748b;">Ctrl+Shift+K</span>
            </div>
            <div id="dev-overlay-content">
                <div style="color:#64748b;">Loading data...</div>
            </div>
        `;

        document.body.appendChild(overlay);
        this._overlay = overlay;

        // 自动更新
        this._updateInterval = setInterval(function() {
            if (this._visible) {
                this._updateData();
            }
        }.bind(this), 2000);
    },

    /**
     * 更新数据
     */
    _updateData: function() {
        var content = document.getElementById('dev-overlay-content');
        if (!content) return;

        var profiler = LawAIApp.DevTools.RuntimeProfiler;
        if (!profiler) {
            content.innerHTML = '<div style="color:#64748b;">Profiler not available</div>';
            return;
        }

        var data = profiler.getData();
        var reportData = profiler.getReportData();

        var html = '';
        html += `<div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span style="color:#64748b;">⏱️ Total</span>
            <span style="font-weight:600;color:#4a9eff;">${reportData.totalTime || data.totalTime || 0}ms</span>
        </div>`;

        // 引擎数量
        var engineCount = Object.keys(reportData.engines).length;
        html += `<div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span style="color:#64748b;">📦 Engines</span>
            <span style="font-weight:600;">${engineCount}</span>
        </div>`;

        // 最慢引擎
        if (reportData.slowestEngine) {
            html += `<div style="display:flex;justify-content:space-between;padding:2px 0;">
                <span style="color:#64748b;">🐢 Slowest</span>
                <span style="font-weight:600;color:#ef4444;">${reportData.slowestEngine} (${reportData.slowestTime}ms)</span>
            </div>`;
        }

        // 存储
        html += `<div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span style="color:#64748b;">💾 Reads/Writes</span>
            <span style="font-weight:600;">${data.storageReads || 0}/${data.storageWrites || 0}</span>
        </div>`;

        // 渲染
        var renderTotal = 0;
        for (var page in data.renderCounts) {
            renderTotal += data.renderCounts[page] || 0;
        }
        html += `<div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span style="color:#64748b;">🔄 Renders</span>
            <span style="font-weight:600;">${renderTotal}</span>
        </div>`;

        // 阶段
        var stages = reportData.stages || {};
        var stageLabels = {
            critical: 'Critical',
            ux: 'UX',
            intelligence: 'Intel',
            background: 'BG'
        };
        var stageColors = {
            critical: '#4a9eff',
            ux: '#22c55e',
            intelligence: '#8b5cf6',
            background: '#f59e0b'
        };
        html += `<div style="border-top:1px solid rgba(255,255,255,0.04);margin:6px 0 4px;padding-top:6px;">`;
        for (var stage in stages) {
            var label = stageLabels[stage] || stage;
            var time = stages[stage] || 0;
            var color = stageColors[stage] || '#64748b';
            html += `<div style="display:flex;justify-content:space-between;padding:1px 0;font-size:11px;">
                <span style="color:#64748b;">${label}</span>
                <span style="color:${color};">${time}ms</span>
            </div>`;
        }
        html += `</div>`;

        content.innerHTML = html;
    },

    /**
     * 销毁
     */
    destroy: function() {
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = null;
        }
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
        }
        this._visible = false;
        console.log('🛠️ DeveloperOverlay destroyed');
    }
};

// 自动初始化
LawAIApp.DevTools.DeveloperOverlay.init();

console.log('🛠️ DeveloperOverlay V1.0.0 ready (Ctrl+Shift+K)');
