// ================================================================
// app.js – Runtime V5.1.2 - Runtime Recovery + Profiler + Dependency (Phase P.2)
// 渲染优先：立即显示 Dashboard，不等待任何引擎初始化完成
// ================================================================

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

window.App = {

    version: "5.1.2",

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
    _cacheCleanupTimer: null,

    init: function(payload) {
        if (this._state.destroyed) {
            console.warn('⚠️ App destroyed, cannot init');
            return;
        }
        this._renderImmediately();
    
        // 🔥 Part 106: 注册 Calendar 路由
        this._registerCalendarRoute();

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

        var bm = LawAIApp.BootManager || window.bootManager;
        if (bm && typeof bm.start === 'function' && !bm._booted) {
            console.log('🔥 App.init → Auto-starting BootManager...');
            bm.start();
        } else if (bm && bm._booted) {
            console.log('✅ BootManager already booted, skipping');
        }

        this.mountRoot();

        if (window.LawAIApp?.memoryEngine && typeof window.LawAIApp.memoryEngine.init === 'function') {
            try {
                window.LawAIApp.memoryEngine.init();
                console.log('[App] ✅ memoryEngine initialized');
            } catch (e) {
                console.warn('[App] ⚠️ memoryEngine init failed:', e);
            }
        }

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

        this._startCacheCleanup();

        this._initPracticeModules();
        this._initNotesModule();

        this._renderImmediately();
        this._setupComposerListener();

        this._loadIntelligenceModules();

        this._initDecisionExperience();

        this._state.bootTimeline.push({ event: 'init_complete', time: Date.now() });
        this._emit('APP_INITIALIZED', { version: this.version });

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

        console.log("⚡ Rendering immediately (no skeleton, no loading)...");

        // 🔥 直接尝试渲染 S4 Dashboard
        if (this._renderS4Dashboard()) {
            console.log("✅ Dashboard rendered directly");
            return;
        }

        // 🔥 如果没有 Dashboard，尝试 SystemComposer
        var composer = safeGet(window, 'LawAIApp.SystemComposer');
        if (composer && typeof composer.init === 'function') {
            try {
                composer.init(this._boot);
                console.log("✅ Composer initiated");
                return;
            } catch (err) {
                console.warn("⚠️ Composer init error:", err);
            }
        }

        // ⚠️ 最后才显示 skeleton（但改为立即消失）
        this._showMinimalSkeleton(root);
    },

    _renderS4Dashboard: function() {
        var root = this.getRoot();
        if (!root) return;

        // 如果 Dashboard 存在，直接渲染
        if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
            console.log("📊 Rendering S4 Dashboard...");
            // 清空 root
            root.innerHTML = '';
            // 创建容器
            var container = document.createElement('div');
            container.id = 'systemComposerRoot';
            root.appendChild(container);
            // 渲染 Dashboard
            window.LawAIApp.Dashboard.render();
            return true;
        }
        return false;
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

    destroy: function() {
        if (this._state.destroyed) return;

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

    _startCacheCleanup: function() {
        if (this._cacheCleanupTimer) {
            clearInterval(this._cacheCleanupTimer);
            this._cacheCleanupTimer = null;
        }

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
        }, 300000);

        console.log('[App] 🧹 Cache cleanup timer started (every 5 minutes)');
    },

    _initPracticeModules: function() {
        var engine = safeGet(window, 'LawAIApp.PracticeEngine');
        if (engine && typeof engine.init === 'function') {
            engine.init();
            console.log('[App] ✅ PracticeEngine initialized');
        } else {
            console.log('[App] ⚠️ PracticeEngine not available yet, will retry...');
            setTimeout(function() {
                var engine2 = safeGet(window, 'LawAIApp.PracticeEngine');
                if (engine2 && typeof engine2.init === 'function') {
                    engine2.init();
                    console.log('[App] ✅ PracticeEngine initialized (delayed)');
                }
            }, 1000);
        }

        var module = safeGet(window, 'LawAIApp.PracticeModule');
        if (module) {
            console.log('[App] ✅ PracticeModule available');
        }

        var progress = safeGet(window, 'LawAIApp.PracticeProgress');
        if (progress) {
            console.log('[App] ✅ PracticeProgress available');
        }
    },

    _initNotesModule: function() {
        var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
        if (notes && typeof notes.init === 'function') {
            notes.init();
            console.log('[App] ✅ Notes module initialized');
        } else {
            console.log('[App] ⚠️ Notes module not available');
        }
    },

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

    render: function() {
        if (!this._renderAttempted) {
            this._renderImmediately();
        }
    },

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

    _loadIntelligenceModules: function() {
        setTimeout(function() {
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

            console.log('[App] ✅ Intelligence modules loading initiated');
        }.bind(this), 2000);
    },

    _initDecisionExperience: function() {
        // 检查 DecisionExperience 是否已通过 AcademyLoader 加载
        var de = safeGet(window, 'LawAIApp.DecisionExperience');
        if (de && typeof de.init === 'function' && !de.initialized) {
            try {
                de.init();
                console.log('[App] ✅ DecisionExperience initialized');
            } catch (e) {
                console.warn('[App] ⚠️ DecisionExperience init failed:', e);
            }
        } else if (de && de.initialized) {
            console.log('[App] ✅ DecisionExperience already initialized');
        } else {
            // 延迟重试（等待 AcademyLoader 加载完成）
            setTimeout(function() {
                var de2 = safeGet(window, 'LawAIApp.DecisionExperience');
                if (de2 && typeof de2.init === 'function' && !de2.initialized) {
                    try {
                        de2.init();
                        console.log('[App] ✅ DecisionExperience initialized (delayed)');
                    } catch (e) {
                        console.warn('[App] ⚠️ DecisionExperience delayed init failed:', e);
                    }
                }
            }, 2000);
        }
    },

    _registerCalendarRoute: function() {
        var checkRouter = function(attempts) {
            attempts = attempts || 0;
            var router = safeGet(window, 'LawAIApp.Router') || window.LawAIApp?.Router;
        
            if (router && typeof router.register === 'function') {
                console.log('[App] 📅 Registering Calendar route...');
            
                // 🔥 主入口：calendar
                router.register('calendar', function() {
                    if (window.LawAIApp?.Calendar) {
                        if (typeof window.LawAIApp.Calendar.init === 'function') {
                            window.LawAIApp.Calendar.init();
                        }
                        window.LawAIApp.Calendar.render();
                    } else {
                        console.warn('[App] ⚠️ Calendar not loaded yet');
                        var root = document.getElementById('app') || document.getElementById('law-runtime-root');
                        if (root) {
                            root.innerHTML = `
                                <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;color:#94a3b8;font-family:'Inter',sans-serif;">
                                    <div style="text-align:center;">
                                        <div style="font-size:48px;margin-bottom:16px;">📅</div>
                                        <p>Loading Calendar...</p>
                                    </div>
                                </div>
                            `;
                        }
                        this._loadCalendar();
                    }
                }.bind(this));
            
                // planner 作为别名（兼容旧链接）
                router.register('planner', function() {
                    router.navigate('calendar');
                });
            
                console.log('[App] ✅ Calendar route registered');
            } else if (attempts < 10) {
                setTimeout(function() {
                    this._registerCalendarRoute(attempts + 1);
                }.bind(this), 300);
            } else {
                console.warn('[App] ⚠️ Router not available after 10 attempts');
            }
        }.bind(this);

        checkRouter(0);
    },
    
    _loadCalendar: function() {
        // 动态加载 Calendar 如果未加载
        if (window.LawAIApp?.Calendar) {
            return;
        }
    
        console.log('[App] 📅 Loading Calendar...');
        var files = [
            '/js/calendarEngine.js',
            '/js/calendarPlanner.js',
            '/js/calendarTimeline.js',
            '/js/calendarEngineAdapter.js',
            '/js/calendar.js',
            '/js/calendarDashboard.js',
            '/js/calendar/CalendarSurfaceAdapter.js',
            '/js/calendar/CalendarViewModel.js',
            '/js/calendar/CalendarEventAdapter.js',
            '/js/calendar/CalendarRenderer.js'
        ];
    
        var loaded = 0;
        var self = this;
        files.forEach(function(file) {
            var script = document.createElement('script');
            script.src = file + '?v=' + Date.now();
            script.onload = function() {
                loaded++;
                if (loaded === files.length) {
                    console.log('[App] ✅ Calendar loaded');
                    if (window.LawAIApp?.Calendar && typeof window.LawAIApp.Calendar.init === 'function') {
                        window.LawAIApp.Calendar.init();
                    }
                    // 重新导航到 planner
                    var router = safeGet(window, 'LawAIApp.Router') || window.LawAIApp?.Router;
                    if (router && typeof router.navigate === 'function') {
                        router.navigate('planner');
                    }
                }
            };
            script.onerror = function() {
                loaded++;
                console.warn('[App] ⚠️ Failed to load:', file);
            };
            document.head.appendChild(script);
        });
    },

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

LawAIApp.app = window.App;

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
