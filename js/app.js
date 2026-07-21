// ================================================================
// app.js – Runtime V5.1.2 - Runtime Recovery + Profiler + Dependency (Phase P.2)
// 渲染优先：立即显示 Dashboard，不等待任何引擎初始化完成
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 🔥 同时暴露到 window.App 和 LawAIApp.app
// ============================================================

window.App = {

    version: "5.1.2",

    // ============================================================
    // 1. Runtime State
    // ============================================================
    _state: {
        initialized: false,
        started: false,
        mounted: false,
        destroyed: false,
        healthy: false,
        booted: false,
        safeMode: false,
        retries: 0,
        maxRetries: 3,
        errors: [],
        bootTimeline: [],
        version: "5.1.2"
    },

    get initialized() { return this._state.initialized; },
    set initialized(val) { this._state.initialized = val; },

    get root() { return this._root; },
    set root(val) { this._root = val; },

    get boot() { return this._boot; },
    set boot(val) { this._boot = val; },

    get _mounted() { return this._state.mounted; },
    set _mounted(val) { this._state.mounted = val; },

    get _retryCount() { return this._state.retries; },
    set _retryCount(val) { this._state.retries = val; },

    get _maxRetries() { return this._state.maxRetries; },
    set _maxRetries(val) { this._state.maxRetries = val; },

    _root: null,
    _boot: {},
    _composerHandler: null,
    _fallbackTimer: null,
    _renderAttempted: false,

    // ============================================================
    // 2. Runtime Lifecycle
    // ============================================================

    init: function(payload) {
        if (this._state.destroyed) {
            console.warn('⚠️ App destroyed, cannot init');
            return;
        }

        if (this._state.initialized) {
            console.log("🔄 App already initialized, refreshing...");
            this.refresh(payload);
            return;
        }

        this._state.initialized = true;
        this._state.started = true;
        this._state.booted = true;
        this._state.healthy = true;
        this._state.bootTimeline.push({ event: 'init', time: Date.now() });

        console.log("🚀 App Runtime V" + this.version);
        console.log("📋 Boot payload:", payload);

        this._boot = payload?.boot || window.LawAIApp.bootStatus || {};

        this.mountRoot();
        this._renderImmediately();
        this._setupComposerListener();

        this._state.bootTimeline.push({ event: 'init_complete', time: Date.now() });
        this._emit('APP_INITIALIZED', { version: this.version });

        // 🔥 Profiler + Dependency
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.registerEngine('App');
            LawAIApp.DevTools.RuntimeProfiler._currentCaller = 'App';
            LawAIApp.DevTools.RuntimeProfiler.addDependency('App', 'SystemComposer');
        }
    },

    _renderImmediately: function() {
        if (this._renderAttempted) return;
        this._renderAttempted = true;

        var root = this.getRoot();
        if (!root) {
            console.warn("⚠️ Root not found, cannot render immediately");
            return;
        }

        console.log("⚡ Rendering immediately (no waiting)...");

        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.recordRender('dashboard');
        }

        var composer = window.LawAIApp?.SystemComposer;

        if (composer && typeof composer.init === 'function') {
            try {
                var result = composer.init(this._boot);
                if (result && typeof result.then === 'function') {
                    result.catch(function(err) {
                        console.warn('⚠️ Composer init async error:', err);
                    });
                }
                console.log("✅ Composer initiated (immediate)");
                return;
            } catch (err) {
                console.warn("⚠️ Composer init immediate error:", err);
            }
        }

        this._showMinimalSkeleton(root);
    },

    _showMinimalSkeleton: function(root) {
        if (!root) return;
        if (root.innerHTML.trim() !== '') return;

        root.innerHTML = `
            <div style="
                min-height: 100vh;
                background: linear-gradient(145deg, #0b1220 0%, #141c2e 50%, #0f1a2e 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #e2e8f0;
                font-family: 'Inter', -apple-system, sans-serif;
                padding: 20px;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Law AI Academy</h2>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Preparing your learning environment...</p>
                <div style="margin-top: 24px; width: 32px; height: 32px; border: 2px solid rgba(74,158,255,0.12); border-top-color: #4a9eff; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            </div>
        `;

        setTimeout(function() {
            var composer = window.LawAIApp?.SystemComposer;
            if (composer && typeof composer.init === 'function') {
                try {
                    composer.init(this._boot);
                    console.log("✅ Composer initialized (delayed fallback)");
                } catch (err) {
                    console.warn("⚠️ Composer init delayed fallback error:", err);
                }
            } else {
                console.warn("⚠️ Composer still not available after 1s");
            }
        }.bind(this), 1000);
    },

    destroy: function() {
        if (this._state.destroyed) return;

        this._state.initialized = false;
        this._state.started = false;
        this._state.mounted = false;
        this._state.destroyed = true;
        this._state.healthy = false;
        this._state.booted = false;
        this._state.retries = 0;
        this._state.errors = [];

        if (this._composerHandler) {
            window.removeEventListener('COMPOSER_MOUNTED', this._composerHandler);
            this._composerHandler = null;
        }
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }
        if (this._root) {
            this._root.innerHTML = "";
        }

        this._emit('RUNTIME_DESTROYED', {});
        console.log("🧹 App Runtime destroyed");
    },

    // ============================================================
    // 3. Runtime Health
    // ============================================================

    getHealth: function() {
        var composerReady = !!(window.LawAIApp?.SystemComposer?.initialized);
        var composerMounted = !!(window.LawAIApp?.SystemComposer?._mountedNotified);

        return {
            version: this.version,
            initialized: this._state.initialized,
            started: this._state.started,
            mounted: this._state.mounted,
            booted: this._state.booted,
            healthy: this._state.healthy,
            safeMode: this._state.safeMode,
            destroyed: this._state.destroyed,
            composerReady: composerReady,
            composerMounted: composerMounted,
            retries: this._state.retries,
            errors: this._state.errors.slice(-5),
            bootTimeline: this._state.bootTimeline.slice(-10)
        };
    },

    isHealthy: function() {
        return this._state.healthy && this._state.booted && !this._state.destroyed;
    },

    markHealthy: function() {
        this._state.healthy = true;
        this._state.errors = [];
        console.log('✅ App healthy');
    },

    markUnhealthy: function(reason) {
        this._state.healthy = false;
        this._state.errors.push({ time: Date.now(), reason: reason });
        console.warn('⚠️ App unhealthy:', reason);
    },

    // ============================================================
    // 4. Root Management
    // ============================================================

    mountRoot: function() {
        var root = document.getElementById("law-runtime-root");
        if (!root) {
            var wrapper = document.createElement('div');
            wrapper.id = 'law-runtime-root';
            wrapper.style.cssText = 'min-height:100vh;background:#0b1220;color:white;';
            document.body.prepend(wrapper);
            root = wrapper;
            console.warn('🛡️ Created fallback root element');
        }
        this._root = root;
        return root;
    },

    getRoot: function() {
        return this._root || document.getElementById('law-runtime-root') || document.getElementById('app');
    },

    // ============================================================
    // 5. Render Pipeline
    // ============================================================

    render: function() {
        if (!this._renderAttempted) {
            this._renderImmediately();
        }
    },

    // ============================================================
    // 6. Recovery
    // ============================================================

    recover: function() {
        if (this._state.destroyed) return;

        console.log("🔄 Recovery started");
        this._state.retries = 0;
        this._state.errors = [];
        this._state.mounted = false;

        if (window.LawAIApp?.SystemComposer) {
            try {
                if (typeof window.LawAIApp.SystemComposer.recover === 'function') {
                    window.LawAIApp.SystemComposer.recover();
                } else {
                    if (typeof window.LawAIApp.SystemComposer.destroy === 'function') {
                        window.LawAIApp.SystemComposer.destroy();
                    }
                    window.LawAIApp.SystemComposer.init(this._boot);
                }
                this.markHealthy();
                console.log("✅ Recovery successful");
                this._emit('RUNTIME_RECOVERED', {});
                return;
            } catch (err) {
                console.warn("⚠️ Recovery failed:", err);
            }
        }

        this._renderImmediately();
    },

    restart: function() {
        if (this._state.destroyed) {
            this._state.destroyed = false;
        }
        this._state.booted = false;
        this._state.mounted = false;
        this._state.healthy = false;
        this._state.retries = 0;
        this._state.errors = [];
        this._renderAttempted = false;
        this.init({ boot: this._boot });
        this._emit('RUNTIME_RESET', {});
        console.log("🔄 Runtime restarted");
    },

    // ============================================================
    // 7. Refresh
    // ============================================================

    _refreshLock: false,

    refresh: function(payload) {
        if (this._refreshLock) {
            console.warn("⚠️ Refresh already in progress");
            return;
        }

        this._refreshLock = true;

        if (payload?.boot) {
            this._boot = payload.boot;
        }
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }

        this._state.mounted = false;
        this._state.retries = 0;

        window.LawAIApp?.SystemComposer?.refresh?.();

        setTimeout(function() {
            if (!this._state.mounted) {
                this._scheduleFallbackCheck();
            }
            this._refreshLock = false;
            console.log("✅ Refresh complete");
            this._emit('RUNTIME_REFRESH_COMPLETE', {});
        }.bind(this), 500);
    },

    // ============================================================
    // 8. Loading / Error States
    // ============================================================

    _showLoadingState: function() {},

    _hideLoadingState: function() {
        var root = this.getRoot();
        if (!root) return;
        var isLoading = root.innerHTML.includes('Preparing your learning environment') ||
                        root.innerHTML.includes('Loading Law AI Academy');
        if (isLoading) {
            console.log("🔄 Clearing loading state");
        }
    },

    _showErrorState: function(message) {
        var root = this.getRoot();
        if (!root) return;
        root.innerHTML = `
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

    // ============================================================
    // 9. Event Listeners
    // ============================================================

    _setupComposerListener: function() {
        if (this._composerHandler) {
            window.removeEventListener('COMPOSER_MOUNTED', this._composerHandler);
        }

        this._composerHandler = function(e) {
            console.log("📡 App received COMPOSER_MOUNTED:", e.detail?.version || '');
            this._state.mounted = true;
            this.markHealthy();
            if (this._fallbackTimer) {
                clearTimeout(this._fallbackTimer);
                this._fallbackTimer = null;
            }
            this._hideLoadingState();
            this._emit('APP_RENDERED', { version: this.version, mounted: true });
        }.bind(this);

        window.addEventListener('COMPOSER_MOUNTED', this._composerHandler);

        if (window.LawAIApp?.SystemComposer?.initialized) {
            console.log("✅ SystemComposer already initialized, marking as mounted");
            this._state.mounted = true;
            this.markHealthy();
        }
    },

    _scheduleFallbackCheck: function() {
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
        }
        this._fallbackTimer = setTimeout(function() {
            console.log("🔍 Running fallback content check...");
            if (this._state.mounted) {
                console.log("✅ Already mounted, fallback not needed");
                this._fallbackTimer = null;
                return;
            }
            var root = this.getRoot();
            if (root && root.children.length > 0 && root.innerHTML.trim() !== '') {
                console.log("✅ Root has content, assuming SystemComposer mounted successfully");
                this._state.mounted = true;
                this.markHealthy();
                this._emit('APP_RENDERED', { version: this.version, mounted: true, fallback: true });
            } else {
                console.warn("⚠️ Root is empty, SystemComposer may have failed");
                this.markUnhealthy('Fallback check failed: root empty');
                this._showErrorState("SystemComposer 未正常启动，请刷新重试");
            }
            this._fallbackTimer = null;
        }.bind(this), 3000);
    },

    // ============================================================
    // 10. Events
    // ============================================================

    _emit: function(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            window.dispatchEvent(event);
            if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                window.LawAIApp.EventBus.emit(eventName, data);
            }
        } catch (err) {}
    }

};

// ============================================================
// 🔥 暴露到 LawAIApp.app（让 DevPanel 和系统能检测到）
// ============================================================
LawAIApp.app = window.App;

// ============================================================
// Global Event Listeners
// ============================================================

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

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (!window.App._state.initialized) {
            console.warn("⚠️ App not initialized after DOM ready, checking for SystemComposer...");
            if (window.LawAIApp?.SystemComposer?.init) {
                console.log("🔄 Auto-initializing App");
                window.App.init({ boot: window.LawAIApp.bootStatus || {} });
            }
        }
    }, 200);
}

console.log("🚀 App Runtime V" + window.App.version + " Loaded");
