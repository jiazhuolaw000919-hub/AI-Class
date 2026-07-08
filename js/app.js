window.LawAIApp = window.LawAIApp || {};

window.App = {

    initialized: false,

    root: null,

    boot: null,

    _mounted: false,

    /**
     * =========================
     * INIT
     * =========================
     */

    init(payload) {

        if (this.initialized) {

            this.refresh(payload);

            return;

        }

        this.initialized = true;

        console.log("🚀 App Runtime V4");
        console.log("📋 Boot payload:", payload);

        this.boot =
            payload?.boot ||
            window.LawAIApp.bootStatus ||
            {};

        this.mountRoot();

        // 监听 SystemComposer 挂载完成事件
        this._setupComposerListener();

        this.render();

    },

    /**
     * =========================
     * 监听 COMPOSER_MOUNTED
     * =========================
     */

    _setupComposerListener() {
        // 移除旧的监听器，防止重复
        if (this._composerHandler) {
            window.removeEventListener('COMPOSER_MOUNTED', this._composerHandler);
        }

        this._composerHandler = (e) => {
            console.log("📡 App received COMPOSER_MOUNTED:", e.detail);
            this._mounted = true;
            // 移除 loading 状态，显示内容
            this._hideLoadingState();
        };

        window.addEventListener('COMPOSER_MOUNTED', this._composerHandler);

        // 如果 SystemComposer 已经初始化完成，直接标记
        if (window.LawAIApp?.SystemComposer?.initialized) {
            console.log("✅ SystemComposer already initialized, marking as mounted");
            this._mounted = true;
            this._hideLoadingState();
        }
    },

    /**
     * =========================
     * 隐藏 Loading 状态
     * =========================
     */

    _hideLoadingState() {
        if (!this.root) return;
        // 如果 root 里还是 loading 内容，清除它
        const isLoading = this.root.innerHTML.includes('Runtime Loading') ||
                          this.root.innerHTML.includes('Waiting SystemComposer');
        if (isLoading) {
            console.log("🔄 Clearing loading state from root");
            // 不直接清空，因为 SystemComposer 已经渲染了内容
            // 但如果是 loading 状态，让它自己消失
        }
    },

    /**
     * =========================
     * ROOT
     * =========================
     */

    mountRoot() {

        let root =
            document.getElementById(
                "law-runtime-root"
            );

        if (!root) {

            document.body.innerHTML = `

            <div
                id="law-runtime-root"
                style="
                    min-height:100vh;
                    background:#0b1220;
                    color:white;
                    font-family:Arial;
                ">
            </div>

            `;

            root =
                document.getElementById(
                    "law-runtime-root"
                );

        }

        this.root = root;

    },

    /**
     * =========================
     * RENDER（增强版）
     * =========================
     */

    render() {

        if (!this.root) {
            console.warn("⚠️ Root element not found, aborting render");
            return;
        }

        const composer = window.LawAIApp?.SystemComposer;
        
        if (composer?.init) {

            console.log("🎯 SystemComposer found, initializing...");
            
            try {
                // 先显示 loading
                this._showLoadingState();

                const result = composer.init(this.boot);
                
                if (result && typeof result.then === 'function') {
                    console.log("⏳ SystemComposer.init is async, waiting...");
                    result
                        .then(() => {
                            console.log("✅ SystemComposer.init completed successfully");
                            // 如果 3 秒后还没收到 COMPOSER_MOUNTED，强行检查
                            this._scheduleFallbackCheck();
                        })
                        .catch((err) => {
                            console.error("❌ SystemComposer.init failed:", err);
                            this._showErrorState("SystemComposer 初始化失败：" + err.message);
                        });
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

        // SystemComposer 不存在时，显示等待界面
        console.warn("⏳ SystemComposer not ready, showing loading state");
        this._showLoadingState();

    },

    /**
     * =========================
     * 显示 Loading
     * =========================
     */

    _showLoadingState() {
        if (!this.root) return;
        // 只在 root 为空或没有内容时显示
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
                    font-family:Arial;
                    text-align:center;
                    padding:20px;
                ">
                    <h1 style="font-size:24px;">🚀 Runtime Loading...</h1>
                    <p style="color:#888;margin-top:10px;">Waiting SystemComposer...</p>
                    <div style="margin-top:30px;">
                        <div style="
                            display:inline-block;
                            width:30px;
                            height:30px;
                            border:3px solid #1e293b;
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
     * 兜底检查
     * =========================
     */

    _scheduleFallbackCheck() {
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
        }
        this._fallbackTimer = setTimeout(() => {
            console.log("🔍 Running fallback content check...");
            // 检查是否收到了 COMPOSER_MOUNTED 事件
            if (!this._mounted) {
                console.warn("⚠️ COMPOSER_MOUNTED not received, checking root content...");
                // 检查 root 是否有内容
                if (this.root && this.root.children.length === 0) {
                    console.warn("⚠️ Root is empty, SystemComposer may have failed silently");
                    this._showErrorState("SystemComposer 未正常启动，请刷新重试");
                } else {
                    console.log("✅ Root has content, assuming SystemComposer mounted successfully");
                    this._mounted = true;
                }
            }
            this._fallbackTimer = null;
        }, 5000); // 5 秒兜底
    },

    /**
     * =========================
     * 显示错误状态
     * =========================
     */

    _showErrorState(message) {
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
                font-family:Arial;
                text-align:center;
                padding:20px;
            ">
                <h2 style="color:#ff6b6b;">⚠️ System Error</h2>
                <p style="color:#aaa;margin-top:10px;">${message || 'Unknown error'}</p>
                <button onclick="location.reload()" style="
                    margin-top:30px;
                    padding:10px 30px;
                    background:#4a9eff;
                    border:none;
                    border-radius:8px;
                    color:white;
                    font-size:16px;
                    cursor:pointer;
                ">🔄 Refresh</button>
            </div>
        `;
    },

    /**
     * =========================
     * REFRESH
     * =========================
     */

    refresh(payload) {

        if (payload?.boot) {
            this.boot = payload.boot;
        }

        // 清除兜底定时器
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }

        this._mounted = false;

        window.LawAIApp
            .SystemComposer
            ?.refresh?.();

        // 刷新后重新检查内容
        setTimeout(() => {
            if (!this._mounted) {
                this._scheduleFallbackCheck();
            }
        }, 500);

    },

    /**
     * =========================
     * DESTROY
     * =========================
     */

    destroy() {

        this.initialized = false;
        this.boot = null;
        this._mounted = false;

        // 移除事件监听
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

    }

};

/**
 * =========================
 * EVENTS
 * =========================
 */

window.addEventListener(

    "SYSTEM_READY",

    (e) => {

        console.log("⚡ SYSTEM_READY");
        console.log("📦 Event detail:", e.detail);
        window.App.init(e.detail);

    }

);

window.addEventListener(

    "RUNTIME_REFRESH",

    () => {

        console.log("🔄 RUNTIME_REFRESH");
        window.App.refresh();

    }

);

window.addEventListener(

    "RUNTIME_RESET",

    () => {

        console.log("🔄 RUNTIME_RESET");
        window.App.destroy();

    }

);

// 额外的安全网：如果 DOM 加载完成但 App 还没初始化，自动触发
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!window.App.initialized) {
            console.warn("⚠️ App not initialized after DOM ready, checking for SystemComposer...");
            if (window.LawAIApp?.SystemComposer?.init) {
                console.log("🔄 Auto-initializing App");
                window.App.init({ boot: window.LawAIApp.bootStatus || {} });
            }
        }
    }, 100);
}

console.log("🚀 App Runtime V4 Loaded");
