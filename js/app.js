// ================================================================
// app.js – Runtime V5.1.2 - Runtime Recovery + Profiler + Dependency (Phase P.2)
// 渲染优先：立即显示 Dashboard，不等待任何引擎初始化完成
// ================================================================

// ============================================================
// 🔥 安全访问辅助函数（与 academyView.js 保持一致）
// ============================================================

/**
 * 安全获取对象属性（替代 ?.）
 * @param {Object} obj - 目标对象
 * @param {string} path - 属性路径，用 '.' 分隔
 * @returns {*} 属性值或 undefined
 */
function safeGet(obj, path) {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        current = current[parts[i]];
    }
    return current;
}

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

    // ═══ S4 Part 10: 缓存清理定时器 ═══
    _cacheCleanupTimer: null,

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

        // 🔥 Part 45.9.1: Auto-trigger BootManager from App.init()
        var bm = LawAIApp.BootManager || window.bootManager;
        if (bm && typeof bm.start === 'function' && !bm._booted) {
            console.log('🔥 App.init → Auto-starting BootManager...');
            bm.start();
        } else if (bm && bm._booted) {
            console.log('✅ BootManager already booted, skipping');
        }

        this.mountRoot();

        // ============================================================
        // 🔥 Part 35: 初始化 MemoryEngine
        // ============================================================
        if (window.LawAIApp?.MemoryEngine && typeof window.LawAIApp.MemoryEngine.init === 'function') {
            try {
                window.LawAIApp.MemoryEngine.init();
                console.log('[App] ✅ MemoryEngine initialized');
            } catch (e) {
                console.warn('[App] ⚠️ MemoryEngine init failed:', e);
            }
        }

        // ════════════════════════════════════════════════════════════
        // ═══ S4 Part 10: 初始化 ContentLoader（新增） ═══
        // ════════════════════════════════════════════════════════════
        var loader = safeGet(window, 'LawAIApp.S4ContentLoader') || safeGet(window, 'LawAIApp.ContentLoader');
        if (loader && typeof loader.loadCourseIndex === 'function') {
            console.log('[App] 📚 Preloading Content Index...');
            loader.loadCourseIndex().then(function(index) {
                console.log('[App] ✅ Content Index loaded:', index ? Object.keys(index.schools || {}).length + ' schools' : 'none');
            }).catch(function(err) {
                console.warn('[App] ⚠️ Content Index preload failed:', err);
            });
        } else {
            console.warn('[App] ⚠️ ContentLoader not available, skipping S4 content preload');
        }

        // ═══ S4 Part 10: 启动缓存清理定时器（新增） ═══
        this._startCacheCleanup();

        // ════════════════════════════════════════════════════════════
        // ═══ Part 33: 初始化 Practice 模块 ═══
        // ════════════════════════════════════════════════════════════
        this._initPracticeModules();
        this._initNotesModule();

        this._renderImmediately();
        this._setupComposerListener();

        this._loadIntelligenceModules();

        this._state.bootTimeline.push({ event: 'init_complete', time: Date.now() });
        this._emit('APP_INITIALIZED', { version: this.version });

        // 🔥 Profiler + Dependency
        if (
            LawAIApp.DevTools &&
            LawAIApp.DevTools.RuntimeProfiler
        ) {
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

        var composer = safeGet(window, 'LawAIApp.SystemComposer');

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
            var composer = safeGet(window, 'LawAIApp.SystemComposer');
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

    // 🔥 Part 42: 延迟加载 Intelligence 模块（不阻塞首屏）
    setTimeout(function() {
        // 检查是否已存在
        if (window.LawAIApp?.KnowledgeGapEngine) {
            console.log('[App] ✅ KnowledgeGapEngine already loaded');
            return;
        }

        // 动态加载 knowledgeGapEngine.js
        var script = document.createElement('script');
        script.src = '/js/knowledgeGapEngine.js';
        script.async = true;
        script.onload = function() {
            console.log('[App] ✅ KnowledgeGapEngine loaded');
            // 自动初始化已内置
        };
        script.onerror = function() {
            console.warn('[App] ⚠️ KnowledgeGapEngine load failed');
        };
        document.head.appendChild(script);

        // 同样加载 gapDetector.js
        var script2 = document.createElement('script');
        script2.src = '/js/gapDetector.js';
        script2.async = true;
        script2.onload = function() {
            console.log('[App] ✅ GapDetector loaded');
        };
        script2.onerror = function() {
            console.warn('[App] ⚠️ GapDetector load failed');
        };
        document.head.appendChild(script2);
    }, 2000); // 延迟 2 秒，让首屏先渲染完

    destroy: function() {
        if (this._state.destroyed) return;

        // ═══ S4 Part 10: 清理缓存清理定时器 ═══
        if (this._cacheCleanupTimer) {
            clearInterval(this._cacheCleanupTimer);
            this._cacheCleanupTimer = null;
        }

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

    // ═══ S4 Part 10: 启动缓存清理定时器 ═══
    _startCacheCleanup: function() {
        if (this._cacheCleanupTimer) {
            clearInterval(this._cacheCleanupTimer);
            this._cacheCleanupTimer = null;
        }

        // 每 5 分钟清理一次旧缓存（最多保留 50 条，10 分钟以上过期）
        this._cacheCleanupTimer = setInterval(function() {
            var loader = safeGet(window, 'LawAIApp.S4ContentLoader') || safeGet(window, 'LawAIApp.ContentLoader');
            if (loader && typeof loader.evictOldCache === 'function') {
                try {
                    var result = loader.evictOldCache(50, 600000);
                    if (result && result.evicted > 0) {
                        console.log('[App] 🧹 Cache cleanup: evicted ' + result.evicted + ' entries');
                    }
                } catch (e) {
                    console.warn('[App] ⚠️ Cache cleanup error:', e);
                }
            }
        }, 300000); // 5 分钟

        console.log('[App] 🧹 Cache cleanup timer started (every 5 minutes)');
    },

    // ════════════════════════════════════════════════════════════
    // ═══ Part 33: 初始化 Practice 模块 ═══
    // ════════════════════════════════════════════════════════════
    _initPracticeModules: function() {
        // 检查 PracticeEngine 是否已加载
        var engine = safeGet(window, 'LawAIApp.PracticeEngine');
        if (engine && typeof engine.init === 'function') {
            engine.init();
            console.log('[App] ✅ PracticeEngine initialized');
        } else {
            console.log('[App] ⚠️ PracticeEngine not available yet, will retry...');
            // 如果还没加载，延迟重试
            setTimeout(function() {
                var engine2 = safeGet(window, 'LawAIApp.PracticeEngine');
                if (engine2 && typeof engine2.init === 'function') {
                    engine2.init();
                    console.log('[App] ✅ PracticeEngine initialized (delayed)');
                }
            }, 1000);
        }

        // 检查 PracticeModule
        var module = safeGet(window, 'LawAIApp.PracticeModule');
        if (module) {
            console.log('[App] ✅ PracticeModule available');
        }

        // 检查 PracticeProgress
        var progress = safeGet(window, 'LawAIApp.PracticeProgress');
        if (progress) {
            console.log('[App] ✅ PracticeProgress available');
        }
    },

    // ═══ Part 34: 初始化 Notes 模块 ═══
    _initNotesModule: function() {
        var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
        if (notes && typeof notes.init === 'function') {
            notes.init();
            console.log('[App] ✅ Notes module initialized');
        } else {
            console.log('[App] ⚠️ Notes module not available');
        }
    },

    // ============================================================
    // 3. Runtime Health
    // ============================================================

    getHealth: function() {
        var composer = safeGet(window, 'LawAIApp.SystemComposer');
        var composerReady = !!(composer && composer.initialized);
        var composerMounted = !!(composer && composer._mountedNotified);

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

        if (safeGet(window, 'LawAIApp.SystemComposer')) {
            var composer = safeGet(window, 'LawAIApp.SystemComposer');
            try {
                if (typeof composer.recover === 'function') {
                    composer.recover();
                } else {
                    if (typeof composer.destroy === 'function') {
                        composer.destroy();
                    }
                    composer.init(this._boot);
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

        var composer = safeGet(window, 'LawAIApp.SystemComposer');
        if (composer && typeof composer.refresh === 'function') {
            composer.refresh();
        }

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

        var composer = safeGet(window, 'LawAIApp.SystemComposer');
        if (composer && composer.initialized) {
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
    // 🔥 Part 42: 延迟加载 Intelligence 模块（不阻塞首屏）
    // ============================================================
    _loadIntelligenceModules: function() {
        setTimeout(function() {
            // 1. KnowledgeGapEngine
            if (window.LawAIApp?.KnowledgeGapEngine) {
                console.log('[App] ✅ KnowledgeGapEngine already loaded');
            } else {
                var script = document.createElement('script');
                script.src = '/js/knowledgeGapEngine.js';
                script.async = true;
                script.onload = function() {
                    console.log('[App] ✅ KnowledgeGapEngine loaded');
                    if (window.LawAIApp?.KnowledgeGapEngine &&
                        typeof window.LawAIApp.KnowledgeGapEngine.init === 'function') {
                        window.LawAIApp.KnowledgeGapEngine.init();
                    }
                };
                script.onerror = function() {
                    console.warn('[App] ⚠️ KnowledgeGapEngine load failed');
                };
                document.head.appendChild(script);
            }

            // 2. GapDetector
            if (window.LawAIApp?.GapDetector) {
                console.log('[App] ✅ GapDetector already loaded');
            } else {
                var script2 = document.createElement('script');
                script2.src = '/js/gapDetector.js';
                script2.async = true;
                script2.onload = function() {
                    console.log('[App] ✅ GapDetector loaded');
                };
                script2.onerror = function() {
                    console.warn('[App] ⚠️ GapDetector load failed');
                };
                document.head.appendChild(script2);
            }

            // 3. KnowledgeGraph (Part 40)
            if (!window.LawAIApp?.KnowledgeGraph) {
                var script3 = document.createElement('script');
                script3.src = '/js/knowledgeGraph.js';
                script3.async = true;
                script3.onload = function() {
                    console.log('[App] ✅ KnowledgeGraph loaded');
                };
                script3.onerror = function() {
                    console.warn('[App] ⚠️ KnowledgeGraph load failed');
                };
                document.head.appendChild(script3);
            }

            // 4. PrerequisiteEngine (Part 41)
            if (!window.LawAIApp?.PrerequisiteEngine) {
                var script4 = document.createElement('script');
                script4.src = '/js/prerequisiteEngine.js';
                script4.async = true;
                script4.onload = function() {
                    console.log('[App] ✅ PrerequisiteEngine loaded');
                };
                script4.onerror = function() {
                    console.warn('[App] ⚠️ PrerequisiteEngine load failed');
                };
                document.head.appendChild(script4);
            }
    
            // 5. KnowledgeGapEngine (Part 42) - 已经加载了，这里不再重复

            console.log('[App] ✅ Intelligence modules loading initiated');
        }.bind(this), 2000);
    },

    // ============================================================
    // 10. Events
    // ============================================================

    _emit: function(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            window.dispatchEvent(event);
            if (safeGet(window, 'LawAIApp.EventBus') && typeof window.LawAIApp.EventBus.emit === 'function') {
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
            var composer = safeGet(window, 'LawAIApp.SystemComposer');
            if (composer && composer.init) {
                console.log("🔄 Auto-initializing App");
                window.App.init({ boot: window.LawAIApp.bootStatus || {} });
            }
        }
    }, 200);
}

console.log("🚀 App Runtime V" + window.App.version + " Loaded");
