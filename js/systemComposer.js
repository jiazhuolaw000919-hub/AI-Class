// ================================================================
// ENGINE: SystemComposer
// LAYER: UI Layer
// DOMAIN: System Composition & UI Rendering
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 5.3.3 - S4 Dashboard Integration
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'SystemComposer',
    _engineVersion: '5.3.3',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'UI Layer',
    _domain: 'System Composition & UI Rendering',

    // ============================================================
    // 1. Runtime State
    // ============================================================
    initialized: false,
    boot: {},
    root: null,
    cache: {},
    panels: {},
    _mounting: false,
    _mountedNotified: false,
    _renderScheduled: false,
    _dirtyPanels: new Set(),
    _recoveryAttempts: 0,
    _maxRecoveryAttempts: 3,
    _deferredRendered: false,
    _panelsRegistered: false,
    _firstPaintComplete: false,
    _hydrationStage: 0,

    // ============================================================
    // 2. DOM Cache
    // ============================================================
    _cacheDOM: function() {
        if (Object.keys(this.cache).length > 0) return this.cache;

        this.cache = {
            learning: document.getElementById("learningPanel"),
            workspace: document.getElementById("workspacePanel"),
            runtime: document.getElementById("runtimePanel"),
            modules: document.getElementById("modulePanel"),
            systemComposerRoot: document.getElementById("systemComposerRoot")
        };
        console.log("📦 DOM cached");
        return this.cache;
    },

    getDOM: function(key) {
        this._cacheDOM();
        return this.cache[key] || null;
    },

    // ============================================================
    // 3. Panel Registry
    // ============================================================
    registerPanel: function(name, renderer) {
        if (!name || typeof renderer !== "function") {
            console.warn("Invalid panel registration:", name);
            return;
        }
        this.panels[name] = renderer;
        this._dirtyPanels.add(name);
        console.log('📌 Panel "' + name + '" registered');
    },

    resolvePanel: function(name) {
        return this.panels[name] || null;
    },

    // ============================================================
    // 4. Render Queue
    // ============================================================
    scheduleRender: function(panelName) {
        if (panelName && this.panels[panelName]) {
            this._dirtyPanels.add(panelName);
        }

        if (this._renderScheduled) return;

        this._renderScheduled = true;
        requestAnimationFrame(function() {
            this._processQueue();
        }.bind(this));
    },

    _processQueue: function() {
        this._renderScheduled = false;

        if (this._dirtyPanels.size === 0) return;

        console.log("🎨 Processing render queue, panels:", Array.from(this._dirtyPanels));

        var sortedPanels = Array.from(this._dirtyPanels);
        sortedPanels.forEach(function(name) {
            this._renderPanel(name);
        }.bind(this));

        this._dirtyPanels.clear();
    },

    // ============================================================
    // 5. Dirty Panel Render
    // ============================================================
    _renderPanel: function(name) {
        var renderer = this.panels[name];
        if (!renderer) {
            console.warn('⚠️ Panel not found:', name);
            return;
        }

        try {
            renderer();
            console.log('✅ Panel "' + name + '" rendered');
            this._recoveryAttempts = 0;
        } catch (err) {
            console.warn('⚠️ Panel "' + name + '" render failed:', err);
        }
    },

    // ============================================================
    // 6. Recovery
    // ============================================================
    recover: function() {
        if (this._recoveryAttempts >= this._maxRecoveryAttempts) {
            console.warn('⚠️ Max recovery attempts reached');
            return;
        }

        this._recoveryAttempts++;
        console.log('🔄 Recovery attempt ' + this._recoveryAttempts);

        Object.keys(this.panels).forEach(function(name) {
            this._dirtyPanels.add(name);
        }.bind(this));

        this._processQueue();

        if (this._dirtyPanels.size === 0) {
            this._recoveryAttempts = 0;
            console.log('✅ Recovery complete');
        }
    },

    // ============================================================
    // 7. Init — 只做一件事：立即渲染
    // ============================================================
    init: function(boot) {
        boot = boot || {};
        this.boot = boot || LawAIApp.bootStatus || {};

        if (this.initialized) {
            console.log("🔄 SystemComposer already initialized, refreshing...");
            this.refresh();
            if (!this._mountedNotified) {
                this._notifyMounted();
            }
            return;
        }

        if (this._mounting) {
            console.warn("⏳ SystemComposer is already mounting, skipping duplicate init");
            return;
        }

        this._mounting = true;
        this._mountedNotified = false;
        console.log("🧩 SystemComposer V" + this._engineVersion + " initializing...");

        try {
            this.initialized = true;
            this.root = document.getElementById("law-runtime-root") || document.body;
            this._cacheDOM();

            var existingRoot = document.getElementById("systemComposerRoot");
            if (existingRoot) {
                console.log("🔄 systemComposerRoot already exists, reusing...");
                this.root = existingRoot;
            } else {
                if (this.root.id === "law-runtime-root") {
                    // 🔥 关键：立即渲染，不等待任何东西
                    this._renderMainUI();
                } else {
                    console.warn("⚠️ Root element is not 'law-runtime-root', using fallback");
                    this._renderMinimalUI();
                }
                this._cacheDOM();
            }

            // 🔥 面板注册延迟到首屏渲染后（不阻塞）
            this._schedulePanelRegistration();

            // 🔥 刷新延迟到首屏渲染后（不阻塞）
            var self = this;
            setTimeout(function() {
                self.refresh();
                console.log("✅ SystemComposer panels refreshed (after render)");
            }, 300);

            setTimeout(function() {
                self._notifyMounted();
            }, 100);

            // 🔥 标记首屏完成
            this._firstPaintComplete = true;

            // 🔥 隐藏全局 Loader
            this._hideLoader();

            console.log("✅ SystemComposer V" + this._engineVersion + " initialized successfully");

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }
    },

    /**
     * 🔥 隐藏全局 Loader（首屏后立即执行）
     */
    _hideLoader: function() {
        var loader = document.getElementById('loading-placeholder');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 800);
            console.log('🔒 Global loader hidden');
        }
    },

    /**
     * 🔥 延迟注册面板（不阻塞首屏）
     */
    _schedulePanelRegistration: function() {
        if (this._panelsRegistered) return;
        this._panelsRegistered = true;

        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 200); };
        
        scheduleFn(function() {
            this.panels = {
                learning: function() { this.mountLearning(); }.bind(this),
                workspace: function() { this.mountWorkspace(); }.bind(this),
                runtime: function() { this.mountRuntime(); }.bind(this),
                modules: function() { this.mountRuntimeModules(); }.bind(this)
            };
            console.log('📌 Panels registered (deferred)');
        }.bind(this));
    },

    // ============================================================
    // 8. Refresh
    // ============================================================
    refresh: function() {
        console.log("🔄 SystemComposer refreshing all panels...");
        Object.values(this.panels).forEach(function(panel) {
            try { panel(); } catch (err) { console.warn("Panel render failed:", err); }
        });
        this._notifyMounted();
    },

    refreshPanel: function(name) {
        if (!this.panels[name]) {
            console.warn('Panel "' + name + '" not found');
            return;
        }
        try { this.panels[name](); } catch (err) { console.warn('Panel ' + name + ' refresh failed', err); }
    },

    // ============================================================
    // 9. Destroy
    // ============================================================
    destroy: function() {
        this.initialized = false;
        this.boot = {};
        this.cache = {};
        this.panels = {};
        this.root = null;
        this._mounting = false;
        this._mountedNotified = false;
        this._dirtyPanels.clear();
        this._renderScheduled = false;
        this._deferredRendered = false;
        this._panelsRegistered = false;
        this._firstPaintComplete = false;
        this._hydrationStage = 0;
        console.log("🧩 SystemComposer destroyed");
    },

    // ============================================================
    // 10. Notify Mounted
    // ============================================================
    _notifyMounted: function() {
        if (this._mountedNotified) return;
        try {
            var event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: { version: this._engineVersion, initialized: this.initialized, root: this.root ? this.root.id : null }
            });
            window.dispatchEvent(event);
            this._mountedNotified = true;
            console.log("📡 Dispatched COMPOSER_MOUNTED event (once)");
        } catch (err) {
            console.warn("Failed to dispatch COMPOSER_MOUNTED:", err);
        }
    },

    // ============================================================
    // 11. 🔥 MAIN UI RENDER — 优先使用 S4 Dashboard
    // ============================================================

    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        console.log("⚡ First Paint: Rendering S4 Dashboard...");

        // 🔥 优先使用真正的 S4 Dashboard
        if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
            // 创建容器
            var container = document.createElement('div');
            container.id = 'systemComposerRoot';
            this.root.appendChild(container);
            
            // 调用真正的 Dashboard
            window.LawAIApp.Dashboard.render();
            
            // 隐藏 loader
            this._hideLoader();
            console.log("✅ S4 Dashboard rendered");
            return;
        }

        // ⚠️ Fallback: 如果 Dashboard 不可用，显示 minimal skeleton
        console.warn("⚠️ Dashboard not available, using minimal skeleton");
        this._showMinimalSkeleton();
    },

    // ============================================================
    // 12. 🔥 Minimal Skeleton — 当 Dashboard 不可用时
    // ============================================================

    _showMinimalSkeleton: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;

        var container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'min-height: 100vh; background: #0b1220; color: #e2e8f0; font-family: "Inter", -apple-system, sans-serif;';
        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">🚀</div>
                <h2 style="font-size:22px;font-weight:600;margin:0 0 8px;">Law AI Academy</h2>
                <p style="color:#94a3b8;font-size:14px;margin:0;">Loading your learning environment...</p>
                <div style="margin-top:24px;width:32px;height:32px;border:2px solid rgba(74,158,255,0.12);border-top-color:#4a9eff;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                <style>
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            </div>
        `;
        this.root.appendChild(container);
        this.root = container;
        console.log("🔄 Minimal skeleton rendered");
    },

    // ============================================================
    // 13. Fallback UI 方法
    // ============================================================

    _renderMinimalUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;
        var container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'padding:20px;background:#0b1220;color:white;';
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <h1 style="margin:0;">🚀 Law AI Academy</h1>
                <span style="font-size:14px;color:#4a9eff;font-weight:normal;background:#1e293b;padding:4px 12px;border-radius:20px;">v${this._engineVersion}</span>
            </div>
            <div id="learningPanel"></div>
            <br>
            <div id="workspacePanel"></div>
            <br>
            <div id="runtimePanel"></div>
            <br>
            <div id="modulePanel"></div>
            <div style="margin-top:40px;text-align:center;color:#475569;font-size:12px;">⚡ System running in fallback mode</div>
        `;
        this.root.appendChild(container);
        this.root = container;
    },

    _renderFallbackUI: function(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;font-family:'Inter',sans-serif;">
                <h2>⚠️ SystemComposer Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <p style="color:#666;font-size:14px;margin-top:20px;">Please refresh or check console for details</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:14px;cursor:pointer;">🔄 Refresh</button>
            </div>
        `;
    },

    // ============================================================
    // 14. 导航守卫 — 立即可用
    // ============================================================
    _setupNavGuard: function() {
        var navItems = document.querySelectorAll('.nav-item');
        var self = this;
        navItems.forEach(function(item) {
            item.removeEventListener('click', self._navClickHandler);
            item.addEventListener('click', self._navClickHandler = function(e) {
                var tab = this.getAttribute('data-tab');
            
                if (tab === 'home') {
                    window.location.href = '/';
                    return;
                }
                if (tab === 'academy') {
                    window.location.href = '/pages/academy.html';
                    return;
                }
            
                e.preventDefault();
            
                // 🔥 Notes: 使用独立 NotesView 渲染（不跳转页面）
                if (tab === 'notes') {
                    var container = document.getElementById('academy-root');
                    if (!container) {
                        container = document.createElement('div');
                        container.id = 'academy-root';
                        container.style.cssText = 'min-height: 100vh; background: #0b1220; padding: 20px;';
                        document.body.prepend(container);
                    }
                
                    if (window.LawAIApp?.NotesView && typeof window.LawAIApp.NotesView.render === 'function') {
                        window.LawAIApp.NotesView.render(container);
                        navItems.forEach(function(nav) {
                            nav.style.color = '#64748b';
                            nav.classList.remove('active');
                        });
                        this.style.color = '#4a9eff';
                        this.classList.add('active');
                    } else {
                        window.location.href = '/pages/academy.html#notes';
                    }
                    return;
                }
            
                var tabNames = {
                    'calendar': '📅 Calendar',                    
                    'settings': '⚙️ Settings'
                };
                var tabDisplay = tabNames[tab] || tab;
                if (LawAIApp.Toast && typeof LawAIApp.Toast.info === 'function') {
                    LawAIApp.Toast.info(tabDisplay + ' is coming soon! 🚧');
                } else {
                    alert(tabDisplay + ' is coming soon! 🚧');
                }
            
                navItems.forEach(function(nav) {
                    nav.style.color = '#64748b';
                    nav.classList.remove('active');
                });
                this.style.color = '#4a9eff';
                this.classList.add('active');               
            });
        });
    },

    // ============================================================
    // 15. 原有 Panel 方法
    // ============================================================
    mountLearning: function() {
        var el = this.getDOM('learning');
        if (!el) return;
        var state = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                state = LawAIApp.ProgressEngine.getState();
            }
        } catch (err) {}
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📚 Learning</h2><div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;"><span>Level ${state.level || 1}</span><span>XP ${state.xp || 0}</span><span>Streak ${state.streak || 0}</span><span>Day ${state.day || 1}</span></div></div>`;
    },

    mountWorkspace: function() {
        var el = this.getDOM('workspace');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">🧩 Workspace</h2><p style="color:#94a3b8;font-size:13px;">Ready</p></div>`;
    },

    mountRuntime: function() {
        var el = this.getDOM('runtime');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">⚙ Runtime</h2><p style="color:#4a9eff;font-size:13px;">🟢 Online</p></div>`;
    },

    mountRuntimeModules: function() {
        var el = this.getDOM('modules');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📦 Modules</h2><p style="color:#94a3b8;font-size:13px;">All systems ready</p></div>`;
    },

    // ============================================================
    // 16. COMPOSE PLACEHOLDER METHODS
    // ============================================================
    composeLayout: function() {},
    composeDashboard: function() {},
    composeWorkspace: function() {},
    composeWidgets: function() {},
    activateModules: function() {},

    // ============================================================
    // 17. ENGINE STATUS
    // ============================================================
    getStatus: function() {
        var allPanels = Object.keys(this.panels);
        var dirtyPanels = Array.from(this._dirtyPanels);
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this.initialized,
            mounted: this._mountedNotified,
            totalPanels: allPanels.length,
            panels: allPanels,
            dirtyPanels: dirtyPanels,
            recoveryAttempts: this._recoveryAttempts,
            maxRecoveryAttempts: this._maxRecoveryAttempts,
            rootExists: !!this.root,
            domCacheSize: Object.keys(this.cache).length,
            deferredRendered: this._deferredRendered,
            panelsRegistered: this._panelsRegistered,
            firstPaintComplete: this._firstPaintComplete,
            hydrationStage: this._hydrationStage
        };
    },

    // ============================================================
    // 18. IS READY
    // ============================================================
    isReady: function() {
        return this.initialized && this._mountedNotified;
    }
};

// ============================================================
// Event Listeners
// ============================================================

window.addEventListener("LEARNING_UI_REFRESH", function() {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

window.addEventListener("SYSTEM_READY", function(e) {
    console.log("📡 SYSTEM_READY received by SystemComposer");
    if (!LawAIApp.SystemComposer.initialized) {
        LawAIApp.SystemComposer.init(e.detail ? e.detail.boot : undefined);
    } else {
        LawAIApp.SystemComposer.boot = e.detail ? e.detail.boot : LawAIApp.bootStatus || {};
        LawAIApp.SystemComposer.refresh();
    }
});

window.addEventListener("RUNTIME_READY", function() {
    LawAIApp.SystemComposer?.refreshPanel("runtime");
    LawAIApp.SystemComposer?.refreshPanel("modules");
});

window.addEventListener("WORKSPACE_UPDATED", function() {
    LawAIApp.SystemComposer?.refreshPanel("workspace");
});

window.addEventListener("PROFILE_UPDATED", function() {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

console.log("🧩 SystemComposer V" + LawAIApp.SystemComposer._engineVersion + " Ready");

if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer V' + LawAIApp.SystemComposer._engineVersion + ' attached to LawAIApp');
}
