window.LawAIApp = window.LawAIApp || {};

window.App = {

    initialized: false,

    root: null,

    boot: null,

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

        this.render();

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
     * RENDER (增强版)
     * =========================
     */

    render() {

        if (!this.root) {
            console.warn("⚠️ Root element not found, aborting render");
            return;
        }

        // 检查 SystemComposer 是否可用
        const composer = window.LawAIApp?.SystemComposer;
        
        if (composer?.init) {

            console.log("🎯 SystemComposer found, initializing...");
            
            try {
                // 调用原有的 init，但传一个回调或等待它完成
                const result = composer.init(this.boot);
                
                // 如果 init 返回的是 Promise，等它完成后再检查
                if (result && typeof result.then === 'function') {
                    console.log("⏳ SystemComposer.init is async, waiting...");
                    result
                        .then(() => {
                            console.log("✅ SystemComposer.init completed successfully");
                            // 如果 SystemComposer 没有主动渲染，兜底显示
                            this.ensureContentRendered();
                        })
                        .catch((err) => {
                            console.error("❌ SystemComposer.init failed:", err);
                            this.showFallbackContent("SystemComposer 初始化失败，请刷新重试");
                        });
                } else {
                    // 同步调用完成，检查是否渲染了内容
                    console.log("✅ SystemComposer.init completed (sync)");
                    this.ensureContentRendered();
                }
                
            } catch (err) {
                console.error("❌ SystemComposer.init threw error:", err);
                this.showFallbackContent("SystemComposer 启动异常：" + err.message);
            }

            // 注意：这里不能 return，因为我们要执行后续的兜底逻辑
            // 但为了避免重复渲染，用标志控制
            this._composerCalled = true;
            
            // 延迟执行兜底检查（给 SystemComposer 一些时间渲染）
            if (!this._fallbackTimer) {
                this._fallbackTimer = setTimeout(() => {
                    this.ensureContentRendered();
                    this._fallbackTimer = null;
                }, 3000);
            }

            return;
        }

        // SystemComposer 不存在时，显示等待界面
        console.warn("⏳ SystemComposer not ready, showing loading state");
        this.showFallbackContent(`
            <h1>🚀 Runtime Loading...</h1>
            <p>Waiting SystemComposer...</p>
            <p style="font-size:12px;color:#666;margin-top:20px;">
                ⚡ System Ready, waiting for composer to mount...
            </p>
        `);

    },

    /**
     * =========================
     * 确保内容已渲染（兜底逻辑）
     * =========================
     */

    ensureContentRendered() {
        if (!this.root) return;
        
        // 检查 root 里面是否有实际内容（排除纯空白或只有默认文本）
        const hasContent = this.root.children.length > 0 && 
                          this.root.textContent.trim().length > 20;
        
        if (!hasContent) {
            console.warn("⚠️ Root has no content, rendering fallback");
            this.showFallbackContent(`
                <div style="padding:40px;text-align:center;">
                    <h2>🏛️ Law AI Academy</h2>
                    <p style="color:#aaa;margin-top:20px;">
                        System is ready, but UI module is loading...
                    </p>
                    <div style="margin-top:30px;">
                        <div style="display:inline-block;width:20px;height:20px;border:3px solid #4a9eff;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
                    </div>
                    <style>
                        @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                </div>
            `);
        } else {
            console.log("✅ Content already rendered by SystemComposer");
        }
    },

    /**
     * =========================
     * 显示兜底内容
     * =========================
     */

    showFallbackContent(html) {
        if (!this.root) return;
        if (typeof html === 'string') {
            this.root.innerHTML = html;
        }
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

        window.LawAIApp
            .SystemComposer
            ?.refresh?.();

        // 刷新后重新检查内容
        setTimeout(() => {
            this.ensureContentRendered();
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

        // 清除定时器
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
