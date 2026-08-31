// ================================================================
// ENGINE: SystemComposer
// LAYER: UI Layer
// DOMAIN: System Composition & UI Rendering
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 5.3.4 - Fixed (No Loading)
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'SystemComposer',
    _engineVersion: '5.3.4',
    version: '5.3.4',
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
        if (!renderer) return;

        try {
            renderer();
            this._recoveryAttempts = 0;
        } catch (err) {
            console.warn('⚠️ Panel "' + name + '" render failed:', err);
        }
    },

    // ============================================================
    // 6. Recovery
    // ============================================================
    recover: function() {
        if (this._recoveryAttempts >= this._maxRecoveryAttempts) return;

        this._recoveryAttempts++;
        console.log('🔄 Recovery attempt ' + this._recoveryAttempts);

        Object.keys(this.panels).forEach(function(name) {
            this._dirtyPanels.add(name);
        }.bind(this));

        this._processQueue();

        if (this._dirtyPanels.size === 0) {
            this._recoveryAttempts = 0;
        }
    },

    // ============================================================
    // 7. Hide Loader (🔥 修复：正确的函数名)
    // ============================================================
    _hideLoader: function() {
        var loader = document.getElementById('loading-placeholder');
        if (loader) {
            loader.style.display = 'none';
            console.log('🔒 Loader hidden');
        }
        
        // 也尝试隐藏其他可能的 loading 元素
        var loadingEls = document.querySelectorAll('[id*="loading"], [class*="loading"], [id*="skeleton"], [class*="skeleton"]');
        loadingEls.forEach(function(el) {
            if (el.id !== 'systemComposerRoot') {
                el.style.display = 'none';
            }
        });
    },

    // ============================================================
    // 8. Init (🔥 修复：无延迟，直接渲染)
    // ============================================================
    init: function(boot) {
        boot = boot || {};
        this.boot = boot || LawAIApp.bootStatus || {};

        if (this.initialized) {
            console.log("🔄 SystemComposer already initialized");
            return;
        }

        if (this._mounting) {
            console.warn("⏳ Already mounting");
            return;
        }

        this._mounting = true;
        console.log("🧩 SystemComposer V" + this.version + " initializing...");

        try {
            this.initialized = true;
            this.root = document.getElementById("law-runtime-root") || document.body;

            var existingRoot = document.getElementById("systemComposerRoot");
            if (existingRoot) {
                console.log("🔄 systemComposerRoot already exists");
            } else {
                // 🔥 立即渲染，无延迟
                this._renderMainUI();
            }

            // 🔥 立即注册面板
            this.panels = {
                learning: function() { this.mountLearning(); }.bind(this),
                workspace: function() { this.mountWorkspace(); }.bind(this),
                runtime: function() { this.mountRuntime(); }.bind(this),
                modules: function() { this.mountRuntimeModules(); }.bind(this)
            };
            this._panelsRegistered = true;

            this._firstPaintComplete = true;
            this._hideLoader();

            // 🔥 立即通知 mounted
            this._notifyMounted();

            console.log("✅ SystemComposer initialized");

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }
    },

    // ============================================================
    // 9. Refresh
    // ============================================================
    refresh: function() {
        Object.values(this.panels).forEach(function(panel) {
            try { panel(); } catch (err) {}
        });
        this._notifyMounted();
    },

    refreshPanel: function(name) {
        if (!this.panels[name]) return;
        try { this.panels[name](); } catch (err) {}
    },

    // ============================================================
    // 10. Destroy
    // ============================================================
    destroy: function() {
        this.initialized = false;
        this.boot = {};
        this.cache = {};
        this.panels = {};
        this.root = null;
        this._mounting = false;
        this._mountedNotified = false;
        if (this._dirtyPanels) this._dirtyPanels.clear();
        this._renderScheduled = false;
        this._deferredRendered = false;
        this._panelsRegistered = false;
        this._firstPaintComplete = false;
        this._hydrationStage = 0;
        console.log("🧩 SystemComposer destroyed");
    },

    // ============================================================
    // 11. Notify Mounted
    // ============================================================
    _notifyMounted: function() {
        if (this._mountedNotified) return;
        try {
            var event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: { version: this.version, initialized: this.initialized, root: this.root ? this.root.id : null }
            });
            window.dispatchEvent(event);
            this._mountedNotified = true;
            console.log("📡 COMPOSER_MOUNTED dispatched");
        } catch (err) {}
    },

    // ============================================================
    // 12. Render Main UI (🔥 无 loading)
    // ============================================================
    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;
    
        console.log("⚡ Rendering Dashboard...");

        // 🔥 直接使用 Dashboard
        if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
            var container = document.createElement('div');
            container.id = 'systemComposerRoot';
            this.root.appendChild(container);
        
            window.LawAIApp.Dashboard.render();
        
            this._hideLoader();
            console.log("✅ Dashboard rendered");
            return;
        }

        // ⚠️ Fallback
        this._renderMinimalUI();
    },

    // ============================================================
    // 13. Minimal UI
    // ============================================================
    _renderMinimalUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;
        var container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'padding:20px;background:#0b1220;color:white;min-height:100vh;';
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <h1 style="margin:0;">🚀 Law AI Academy</h1>
                <span style="font-size:14px;color:#4a9eff;background:#1e293b;padding:4px 12px;border-radius:20px;">v${this.version}</span>
            </div>
            <div id="learningPanel"></div>
            <br>
            <div id="workspacePanel"></div>
            <br>
            <div id="runtimePanel"></div>
            <br>
            <div id="modulePanel"></div>
        `;
        this.root.appendChild(container);
    },

    _renderFallbackUI: function(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;font-family:'Inter',sans-serif;">
                <h2>⚠️ System Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:14px;cursor:pointer;">🔄 Refresh</button>
            </div>
        `;
    },

    // ============================================================
    // 14. Panel 方法
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
    // 15. Status
    // ============================================================
    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            initialized: this.initialized,
            mounted: this._mountedNotified,
            totalPanels: Object.keys(this.panels).length,
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

window.addEventListener("LEARNING_UI_REFRESH", function() {
    if (LawAIApp.SystemComposer) {
        LawAIApp.SystemComposer.refreshPanel("learning");
    }
});

window.addEventListener("SYSTEM_READY", function(e) {
    console.log("📡 SYSTEM_READY received");
    if (!LawAIApp.SystemComposer.initialized) {
        LawAIApp.SystemComposer.init(e.detail ? e.detail.boot : undefined);
    } else {
        LawAIApp.SystemComposer.refresh();
    }
});

window.addEventListener("RUNTIME_READY", function() {
    if (LawAIApp.SystemComposer) {
        LawAIApp.SystemComposer.refreshPanel("runtime");
        LawAIApp.SystemComposer.refreshPanel("modules");
    }
});

console.log("🧩 SystemComposer V" + LawAIApp.SystemComposer.version + " loaded");
