window.LawAIApp = window.LawAIApp || {};

window.App = {

    version: "4.0.3",

    initialized: false,

    root: null,

    boot: null,

    _mounted: false,

    _retryCount: 0,

    _maxRetries: 5,

    /**
     * =========================
     * INIT
     * =========================
     */

    init: function(payload) {
        if (this.initialized) {
            console.log("🔄 App already initialized, refreshing...");
            this.refresh(payload);
            return;
        }

        this.initialized = true;
        console.log("🚀 App Runtime V" + this.version);
        console.log("📋 Boot payload:", payload);

        this.boot = payload?.boot || window.LawAIApp.bootStatus || {};
        this.mountRoot();
        this._setupComposerListener();
        this.render();
    },

    /**
     * =========================
     * 监听 COMPOSER_MOUNTED
     * =========================
     */

    _setupComposerListener: function() {
        if (this._composerHandler) {
            window.removeEventListener('COMPOSER_MOUNTED', this._composerHandler);
        }

        this._composerHandler = function(e) {
            console.log("📡 App received COMPOSER_MOUNTED:", e.detail?.version || '');
            this._mounted = true;
            if (this._fallbackTimer) {
                clearTimeout(this._fallbackTimer);
                this._fallbackTimer = null;
            }
            // 隐藏 loading
            this._hideLoadingState();
        }.bind(this);

        window.addEventListener('COMPOSER_MOUNTED', this._composerHandler);

        if (window.LawAIApp?.SystemComposer?.initialized) {
            console.log("✅ SystemComposer already initialized, marking as mounted");
            this._mounted = true;
        }
    },

    /**
     * =========================
     * ROOT
     * =========================
     */

    mountRoot: function() {
        var root = document.getElementById("law-runtime-root");
        if (!root) {
            document.body.innerHTML = `
                <div id="law-runtime-root" style="
                    min-height:100vh;
                    background:#0b1220;
                    color:white;
                    font-family:Arial;
                "></div>
            `;
            root = document.getElementById("law-runtime-root");
        }
        this.root = root;
    },

    /**
     * =========================
     * RENDER（增强版）
     * =========================
     */

    render: function() {
        if (!this.root) {
            console.warn("⚠️ Root element not found, aborting render");
            return;
        }

        if (this._mounted) {
            console.log("✅ Already mounted, skipping render");
            return;
        }

        var composer = window.LawAIApp?.SystemComposer;

        if (composer?.init) {
            console.log("🎯 SystemComposer found, initializing...");
            try {
                this._showLoadingState();
                var result = composer.init(this.boot);

                if (result && typeof result.then === 'function') {
                    console.log("⏳ SystemComposer.init is async, waiting...");
                    result
                        .then(function() {
                            console.log("✅ SystemComposer.init completed");
                            this._scheduleFallbackCheck();
                        }.bind(this))
                        .catch(function(err) {
                            console.error("❌ SystemComposer.init failed:", err);
                            this._showErrorState("SystemComposer 初始化失败：" + err.message);
                        }.bind(this));
                } else {
                    console.log("✅ SystemComposer.init completed (sync)");
                    this._scheduleFallbackCheck();
                }
            } catch (err) {
                console.error("❌ SystemComposer.init threw error:", err);
                this._showErrorState("SystemComposer 启动异常：" + err.message);
            }
            return;
        }

        // SystemComposer 不存在 → 等待或重试
        console.warn("⏳ SystemComposer not ready, attempt " + (this._retryCount + 1) + "/" + this._maxRetries);
        this._showLoadingState();

        if (this._retryCount < this._maxRetries) {
            this._retryCount++;
            setTimeout(function() {
                this.render();
            }.bind(this), 800);
        } else {
            this._showErrorState("SystemComposer 加载超时，请刷新页面");
        }
    },

    /**
     * =========================
     * 显示 Loading
     * =========================
     */

    _showLoadingState: function() {
        if (!this.root) return;
        if (!this.root.children.length || this.root.innerHTML.trim() === '') {
            this.root.innerHTML = `
                <div style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    min-height:100vh;
                    background:#0b1220;
                    color:white;
                    font-family:'Inter',Arial,sans-serif;
                    text-align:center;
                    padding:20px;
                ">
                    <div style="font-size:48px;margin-bottom:16px;">🚀</div>
                    <h1 style="font-size:24px;font-weight:600;margin:0 0 8px;">Loading Law AI Academy</h1>
                    <p style="color:#94a3b8;font-size:14px;margin:0;">Preparing your learning environment...</p>
                    <div style="margin-top:30px;">
                        <div style="
                            display:inline-block;
                            width:36px;
                            height:36px;
                            border:3px solid rgba(74,158,255,0.15);
                            border-top-color:#4a9eff;
                            border-radius:50%;
                            animation:spin 1s linear infinite;
                        "></div>
                    </div>
                    <style>
                        @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                </div>
            `;
        }
    },

    /**
     * =========================
     * 隐藏 Loading
     * =========================
     */

    _hideLoadingState: function() {
        if (!this.root) return;
        var isLoading = this.root.innerHTML.includes('Loading Law AI Academy') ||
                        this.root.innerHTML.includes('Runtime Loading') ||
                        this.root.innerHTML.includes('Waiting SystemComposer');
        if (isLoading) {
            console.log("🔄 Clearing loading state");
            // 不直接清空，让 SystemComposer 的内容显示
        }
    },

    /**
     * =========================
     * 兜底检查
     * =========================
     */

    _scheduleFallbackCheck: function() {
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
        }
        this._fallbackTimer = setTimeout(function() {
            console.log("🔍 Running fallback content check...");
            if (this._mounted) {
                console.log("✅ Already mounted, fallback not needed");
                this._fallbackTimer = null;
                return;
            }
            if (this.root && this.root.children.length > 0) {
                console.log("✅ Root has content, assuming SystemComposer mounted successfully");
                this._mounted = true;
            } else {
                console.warn("⚠️ Root is empty, SystemComposer may have failed");
                this._showErrorState("SystemComposer 未正常启动，请刷新重试");
            }
            this._fallbackTimer = null;
        }.bind(this), 3000);
    },

    /**
     * =========================
     * 显示错误状态
     * =========================
     */

    _showErrorState: function(message) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                min-height:100vh;
                background:#0b1220;
                color:white;
                font-family:'Inter',Arial,sans-serif;
                text-align:center;
                padding:20px;
            ">
                <h2 style="color:#ff6b6b;font-size:22px;">⚠️ System Error</h2>
                <p style="color:#94a3b8;margin-top:10px;font-size:14px;">${message || 'Unknown error'}</p>
                <button onclick="location.reload()" style="
                    margin-top:30px;
                    padding:12px 36px;
                    background:#4a9eff;
                    border:none;
                    border-radius:10px;
                    color:white;
                    font-size:15px;
                    font-weight:600;
                    cursor:pointer;
                    transition:transform 0.2s;
                " onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">🔄 Refresh</button>
            </div>
        `;
    },

    /**
     * =========================
     * REFRESH
     * =========================
     */

    refresh: function(payload) {
        if (payload?.boot) {
            this.boot = payload.boot;
        }
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }
        this._mounted = false;
        this._retryCount = 0;
        window.LawAIApp.SystemComposer?.refresh?.();
        setTimeout(function() {
            if (!this._mounted) {
                this._scheduleFallbackCheck();
            }
        }.bind(this), 500);
    },

    /**
     * =========================
     * DESTROY
     * =========================
     */

    destroy: function() {
        this.initialized = false;
        this.boot = null;
        this._mounted = false;
        this._retryCount = 0;

        if (this._composerHandler) {
            window.removeEventListener('COMPOSER_MOUNTED', this._composerHandler);
            this._composerHandler = null;
        }
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }
        if (this.root) {
            this.root.innerHTML = "";
        }
        console.log("🧹 App Runtime destroyed");
    }

};

/**
 * =========================
 * EVENTS
 * =========================
 */

window.addEventListener("SYSTEM_READY", function(e) {
    console.log("⚡ SYSTEM_READY");
    window.App.init(e.detail);
});

window.addEventListener("RUNTIME_REFRESH", function() {
    console.log("🔄 RUNTIME_REFRESH");
    window.App.refresh();
});

window.addEventListener("RUNTIME_RESET", function() {
    console.log("🔄 RUNTIME_RESET");
    window.App.destroy();
});

// 安全网：自动初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (!window.App.initialized) {
            console.warn("⚠️ App not initialized after DOM ready, checking for SystemComposer...");
            if (window.LawAIApp?.SystemComposer?.init) {
                console.log("🔄 Auto-initializing App");
                window.App.init({ boot: window.LawAIApp.bootStatus || {} });
            }
        }
    }, 100);
}

console.log("🚀 App Runtime V" + window.App.version + " Loaded");
