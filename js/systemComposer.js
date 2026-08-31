// ================================================================
// ENGINE: SystemComposer — 极简版
// VERSION: 5.3.4 - Stable
// 职责：只做一件事 — 渲染 S4 Dashboard
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    initialized: false,
    root: null,
    _mountedNotified: false,

    // ============================================================
    // 初始化
    // ============================================================
    init: function() {
        if (this.initialized) {
            console.log("🔄 SystemComposer already initialized");
            return;
        }

        console.log("🧩 SystemComposer init...");

        try {
            this.root = document.getElementById("law-runtime-root") || document.body;
            this.initialized = true;
            
            // 直接渲染 Dashboard
            this._render();
            
            // 通知就绪
            this._notifyMounted();

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderError();
        }
    },

    // ============================================================
    // 渲染
    // ============================================================
    _render: function() {
        if (!this.root) return;

        // 检查是否已经有内容
        if (this.root.innerHTML && this.root.innerHTML.trim() !== '') {
            console.log("📌 Root already has content, skipping render");
            return;
        }

        console.log("⚡ Rendering S4 Dashboard...");

        // 🔥 优先使用真正的 S4 Dashboard
        if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
            try {
                // 确保有 systemComposerRoot 容器
                var container = document.getElementById('systemComposerRoot');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'systemComposerRoot';
                    this.root.appendChild(container);
                }
                window.LawAIApp.Dashboard.render();
                console.log("✅ S4 Dashboard rendered");
                this._hideLoader();
                return;
            } catch (e) {
                console.warn("⚠️ Dashboard.render error:", e);
            }
        }

        // ⚠️ 如果 Dashboard 不可用，显示加载提示
        console.warn("⚠️ Dashboard not available, showing loading state");
        this._renderLoading();
    },

    // ============================================================
    // 加载状态
    // ============================================================
    _renderLoading: function() {
        if (!this.root) return;
        if (document.getElementById('systemComposerRoot')) return;

        this.root.innerHTML = `
            <div id="systemComposerRoot" style="
                min-height: 100vh;
                background: #0b1220;
                color: #e2e8f0;
                font-family: 'Inter', -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Law AI Academy</h2>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Loading your learning environment...</p>
                <div style="margin-top: 24px; width: 32px; height: 32px; border: 2px solid rgba(74,158,255,0.12); border-top-color: #4a9eff; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            </div>
        `;
        console.log("🔄 Loading state rendered");
        
        // 3 秒后重试 Dashboard
        var self = this;
        setTimeout(function() {
            if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
                console.log("🔄 Retrying Dashboard render...");
                try {
                    window.LawAIApp.Dashboard.render();
                } catch (e) {
                    console.warn("⚠️ Retry failed:", e);
                }
            }
        }, 3000);
    },

    // ============================================================
    // 错误状态
    // ============================================================
    _renderError: function() {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="
                min-height: 100vh;
                background: #0b1220;
                color: #e2e8f0;
                font-family: 'Inter', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">System Error</h2>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Please refresh the page</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 32px;
                    background: #4a9eff;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                ">🔄 Refresh</button>
            </div>
        `;
    },

    // ============================================================
    // 隐藏加载占位
    // ============================================================
    _hideLoader: function() {
        var loader = document.getElementById('loading-placeholder');
        if (loader) {
            loader.classList.add('hidden');
            console.log('🔒 Loader hidden');
        }
    },

    // ============================================================
    // 通知就绪
    // ============================================================
    _notifyMounted: function() {
        if (this._mountedNotified) return;
        try {
            window.dispatchEvent(new CustomEvent('COMPOSER_MOUNTED', {
                detail: { version: '5.3.4', initialized: true }
            }));
            this._mountedNotified = true;
            console.log("📡 COMPOSER_MOUNTED dispatched");
        } catch (err) {
            console.warn("Failed to dispatch:", err);
        }
    },

    // ============================================================
    // 刷新
    // ============================================================
    refresh: function() {
        console.log("🔄 Refreshing...");
        this._render();
    },

    // ============================================================
    // 状态
    // ============================================================
    getStatus: function() {
        return {
            initialized: this.initialized,
            mounted: this._mountedNotified,
            hasDashboard: !!(window.LawAIApp && window.LawAIApp.Dashboard)
        };
    },

    isReady: function() {
        return this.initialized && this._mountedNotified;
    }
};

// ============================================================
// Event Listeners
// ============================================================

window.addEventListener("SYSTEM_READY", function(e) {
    console.log("📡 SYSTEM_READY received");
    if (!LawAIApp.SystemComposer.initialized) {
        LawAIApp.SystemComposer.init();
    } else {
        LawAIApp.SystemComposer.refresh();
    }
});

console.log("🧩 SystemComposer V5.3.4 loaded");
