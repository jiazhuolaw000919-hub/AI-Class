// ============================================================
// governanceDashboardLoader.js
// Part 49.10 — Governance Dashboard Loader
// Version: v4.9.10
// Module: Developer Experience Layer — Details
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Governance = LawAIApp.Debug.Governance || {};

/**
 * Governance Dashboard Loader
 * 
 * 职责：
 * - 打开 Governance Dashboard
 * - 如果 UnifiedGovernanceDashboard 存在，直接使用
 * - 否则创建独立的 Dashboard 浮窗
 * 
 * 设计原则：
 * - 不污染 DevPanel Core
 * - 独立文件，方便维护
 * - 错误隔离
 */
LawAIApp.Debug.Governance.DashboardLoader = {
    _popupOverlay: null,
    _popup: null,
    _popupEscHandler: null,

    /**
     * 打开 Governance Dashboard
     */
    open: function() {
        console.log('🏛️ [Governance] Opening dashboard...');

        // ── 检查 UnifiedGovernanceDashboard 是否存在 ──
        var dashboard = window.LawAIApp.UnifiedGovernanceDashboard;
        if (dashboard) {
            // 如果有 open 方法
            if (typeof dashboard.open === 'function') {
                dashboard.open();
                return;
            }
            // 如果有 render 方法
            if (typeof dashboard.render === 'function') {
                this._renderDashboard(dashboard);
                return;
            }
        }

        // ── 如果 dashboard 不存在，显示提示 ──
        this._showFallbackMessage();
    },

    /**
     * 渲染 Dashboard
     * @private
     */
    _renderDashboard: function(dashboard) {
        // 关闭已有弹窗
        this._close();

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
        popup.id = 'governance-dashboard-popup';
        popup.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 20px;
            max-width: 800px;
            width: 95%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
        `;

        // ── 渲染内容 ──
        var container = document.createElement('div');
        container.id = 'governance-dashboard-container';
        popup.appendChild(container);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // ── 调用 dashboard 的 render ──
        try {
            dashboard.render(container);
        } catch(err) {
            console.error('[Governance] Dashboard render error:', err);
            container.innerHTML = this._getErrorHTML(err.message);
        }

        // ── 添加关闭按钮 ──
        this._addCloseButton(popup);

        // ── 点击遮罩关闭 ──
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                LawAIApp.Debug.Governance.DashboardLoader._close();
            }
        });

        // ── ESC 关闭 ──
        var escHandler = function(e) {
            if (e.key === 'Escape') {
                LawAIApp.Debug.Governance.DashboardLoader._close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        this._popupOverlay = overlay;
        this._popup = popup;
        this._popupEscHandler = escHandler;

        console.log('🏛️ [Governance] Dashboard opened');
    },

    /**
     * 添加关闭按钮
     * @private
     */
    _addCloseButton: function(popup) {
        var closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: sticky;
            top: 0;
            float: right;
            background: none;
            border: none;
            color: #64748b;
            font-size: 20px;
            cursor: pointer;
            z-index: 1;
        `;
        closeBtn.onclick = function() {
            LawAIApp.Debug.Governance.DashboardLoader._close();
        };
        popup.prepend(closeBtn);
    },

    /**
     * 显示 Fallback 消息
     * @private
     */
    _showFallbackMessage: function() {
        this._close();

        var overlay = document.createElement('div');
        overlay.id = 'governance-fallback-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10050;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;

        var popup = document.createElement('div');
        popup.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 30px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            text-align: center;
        `;
        popup.innerHTML = `
            <div style="font-size:48px;margin-bottom:16px;">🏛️</div>
            <h2 style="color:#22c55e;margin-bottom:8px;">Governance Dashboard</h2>
            <p style="color:#94a3b8;font-size:14px;margin-bottom:16px;">
                The Governance Dashboard is loading.<br>
                Please wait or check the console for errors.
            </p>
            <button onclick="LawAIApp.Debug.Governance.DashboardLoader._close()" 
                    style="padding:8px 24px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.2);border-radius:8px;color:#4a9eff;font-size:14px;cursor:pointer;">
                Close
            </button>
            <div style="font-size:10px;color:#475569;margin-top:12px;">
                Tip: Make sure unifiedGovernanceDashboard.js is loaded
            </div>
        `;

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                LawAIApp.Debug.Governance.DashboardLoader._close();
            }
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        this._popupOverlay = overlay;
        this._popup = popup;

        console.warn('[Governance] Dashboard not available, showing fallback');
    },

    /**
     * 获取错误 HTML
     * @private
     */
    _getErrorHTML: function(message) {
        return `
            <div style="padding:20px;text-align:center;">
                <div style="font-size:36px;margin-bottom:12px;">⚠️</div>
                <h3 style="color:#ef4444;margin-bottom:8px;">Dashboard Error</h3>
                <p style="color:#94a3b8;font-size:12px;">${message || 'Unknown error'}</p>
                <button onclick="LawAIApp.Debug.Governance.DashboardLoader._close()" 
                        style="margin-top:12px;padding:6px 20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:6px;color:#ef4444;cursor:pointer;">
                    Close
                </button>
            </div>
        `;
    },

    /**
     * 关闭 Dashboard
     */
    _close: function() {
        if (this._popupOverlay) {
            this._popupOverlay.remove();
            this._popupOverlay = null;
            this._popup = null;
        }
        if (this._popupEscHandler) {
            document.removeEventListener('keydown', this._popupEscHandler);
            this._popupEscHandler = null;
        }
    }
};

console.log('🏛️ [Part 49.10] Governance Dashboard Loader loaded');
console.log('   📋 Use: LawAIApp.Debug.Governance.DashboardLoader.open()');
