// ================================================================
// ExperienceComposer — Experience Layer Core
// LAYER: Experience Layer
// VERSION: 2.1.0 (Academy Integration Patch)
// 
// RESPONSIBILITY:
//   - Feature registration & orchestration
//   - AcademyLoader integration
//   - Runtime lifecycle compatibility
//   - AcademyManifest loading support
//   - Academy lifecycle events
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceComposer = {
    // ============================================================
    // STATE
    // ============================================================
    _initialized: false,
    _started: false,
    _features: {},
    _academyLoaded: false,
    _academyStatus: 'pending', // pending | initializing | ready | failed
    _viewState: {}, // 替代 DOM 检测的状态管理

    // ============================================================
    // 1. PUBLIC API — Bootstrap
    // ============================================================

    /**
     * start() — Experience Layer 启动入口
     */
    start: function() {
        if (this._started) {
            console.log('[ExperienceComposer] Already started');
            return this.getStatus();
        }

        console.log('[ExperienceComposer] 🚀 Starting Experience Layer...');
        this._started = true;

        this._initEventBus();
        this._registerFeatures();
        this._waitForRuntimeAndLoadAcademy();

        this._emit('EXPERIENCE_STARTED', {
            features: Object.keys(this._features),
            timestamp: Date.now()
        });

        console.log('[ExperienceComposer] ✅ Experience Layer started');
        console.log('[ExperienceComposer] 📦 Registered features:', Object.keys(this._features));

        return this.getStatus();
    },

    /**
     * getStatus() — 获取 Experience 层状态
     */
    getStatus: function() {
        return {
            initialized: this._initialized,
            started: this._started,
            features: Object.keys(this._features),
            academyLoaded: this._academyLoaded,
            academyStatus: this._academyStatus,
            academyReady: this._academyStatus === 'ready',
            viewState: this._viewState
        };
    },

    /**
     * registerFeature() — 注册 Feature
     */
    registerFeature: function(name, feature) {
        if (!name || !feature) {
            console.warn('[ExperienceComposer] Invalid feature registration');
            return false;
        }

        if (this._features[name]) {
            console.warn('[ExperienceComposer] Feature already registered:', name);
            return false;
        }

        this._features[name] = {
            ...feature,
            registeredAt: Date.now(),
            status: 'registered'
        };

        console.log('[ExperienceComposer] 📦 Feature registered:', name);
        this._emit('FEATURE_REGISTERED', { name, feature: this._features[name] });

        return true;
    },

    /**
     * getFeature() — 获取已注册的 Feature
     */
    getFeature: function(name) {
        return this._features[name] || null;
    },

    /**
     * getFeatures() — 获取所有 Features
     */
    getFeatures: function() {
        return { ...this._features };
    },

    /**
     * getViewState() — 获取 View 状态（替代 DOM 检测）
     */
    getViewState: function() {
        return { ...this._viewState };
    },

    /**
     * setViewState() — 设置 View 状态
     */
    setViewState: function(key, value) {
        this._viewState[key] = value;
        this._emit('VIEW_STATE_UPDATED', { key, value });
        return this._viewState;
    },

    // ============================================================
    // 2. PRIVATE — Event Bus
    // ============================================================

    _initEventBus: function() {
        var bus = LawAIApp.EventBus;
        if (!bus) {
            console.warn('[ExperienceComposer] EventBus not available');
            return;
        }

        bus.on('experience:update', function(data) {
            this.renderExperience(data);
        }.bind(this));

        bus.on('RUNTIME_READY', function() {
            console.log('[ExperienceComposer] 📡 RUNTIME_READY received');
            this._loadAcademy();
        }.bind(this));

        // 🔥 Academy 生命周期事件监听
        bus.on('ACADEMY_INITIALIZING', function(data) {
            console.log('[ExperienceComposer] 📡 ACADEMY_INITIALIZING');
            this._academyStatus = 'initializing';
            this.setViewState('academy', 'initializing');
        }.bind(this));

        bus.on('ACADEMY_READY', function(data) {
            console.log('[ExperienceComposer] 📡 ACADEMY_READY received');
            this._academyLoaded = true;
            this._academyStatus = 'ready';
            this.setViewState('academy', 'ready');
            
            // 🔥 验证 Registry 可用性
            this._verifyRegistries();

            this._emit('EXPERIENCE_READY', {
                academy: data,
                features: Object.keys(this._features)
            });
        }.bind(this));

        bus.on('ACADEMY_FAILED', function(data) {
            console.warn('[ExperienceComposer] 📡 ACADEMY_FAILED:', data?.error);
            this._academyStatus = 'failed';
            this.setViewState('academy', 'failed');
        }.bind(this));

        console.log('[ExperienceComposer] ✅ EventBus listeners active');
    },

    // ============================================================
    // 3. PRIVATE — Feature Registration
    // ============================================================

    _registerFeatures: function() {
        this.registerFeature('academy', {
            name: 'Academy Experience',
            version: '1.0.0',
            loader: 'academyLoader.js',
            manifest: 'academyManifest.js',
            status: 'pending'
        });
    },

    // ============================================================
    // 4. PRIVATE — Runtime Check
    // ============================================================

    _waitForRuntimeAndLoadAcademy: function() {
        if (this._isRuntimeReady()) {
            console.log('[ExperienceComposer] ✅ Runtime already ready, loading Academy...');
            this._loadAcademy();
            return;
        }

        console.log('[ExperienceComposer] ⏳ Waiting for Runtime...');

        var self = this;
        var checkCount = 0;
        var maxChecks = 30;

        var checkInterval = setInterval(function() {
            checkCount++;
            if (self._isRuntimeReady()) {
                clearInterval(checkInterval);
                console.log('[ExperienceComposer] ✅ Runtime ready (polling), loading Academy...');
                self._loadAcademy();
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.warn('[ExperienceComposer] ⚠️ Runtime not ready after timeout, loading Academy anyway...');
                self._loadAcademy();
            }
        }, 200);
    },

    _isRuntimeReady: function() {
        return !!(window.LawAIApp?.RuntimeOS || window.LawAIApp?.BootManager?.status === 'ready');
    },

    // ============================================================
    // 5. PRIVATE — Academy Integration (核心补丁)
    // ============================================================

    _loadAcademy: function() {
        // 防止重复加载
        if (this._academyLoaded) {
            console.log('[ExperienceComposer] Academy already loaded');
            return;
        }

        // 防止重复加载中
        if (this._academyStatus === 'initializing') {
            console.log('[ExperienceComposer] Academy already initializing');
            return;
        }

        // 🔥 发送 ACADEMY_INITIALIZING 事件
        this._academyStatus = 'initializing';
        this.setViewState('academy', 'initializing');
        this._emit('ACADEMY_INITIALIZING', { 
            timestamp: Date.now(),
            loader: 'academyLoader.js'
        });

        // 检查 AcademyLoader 是否已经存在
        if (window.LawAIApp?.AcademyLoader) {
            console.log('[ExperienceComposer] AcademyLoader already exists');
            this._academyLoaded = true;
            this._startAcademy();
            return;
        }

        // 🔥 先加载 AcademyManifest（确保存在）
        this._loadAcademyManifest();

        console.log('[ExperienceComposer] 🏛️ Loading AcademyLoader...');

        var script = document.createElement('script');
        script.src = 'js/academy/academyLoader.js';
        script.async = false;

        script.onload = function() {
            console.log('[ExperienceComposer] ✅ AcademyLoader loaded');
            this._academyLoaded = true;
            this._startAcademy();
        }.bind(this);

        script.onerror = function() {
            console.warn('[ExperienceComposer] ⚠️ AcademyLoader load failed, retrying in 2s...');
            this._academyStatus = 'failed';
            this._emit('ACADEMY_FAILED', { error: 'Loader load failed', retrying: true });
            setTimeout(function() {
                this._academyStatus = 'pending';
                this._loadAcademy();
            }.bind(this), 2000);
        }.bind(this);

        document.head.appendChild(script);
    },

    /**
     * 🔥 NEW: 加载 AcademyManifest
     */
    _loadAcademyManifest: function() {
        // 检查是否已经存在
        if (window.LawAIApp?.AcademyManifest) {
            console.log('[ExperienceComposer] ✅ AcademyManifest already exists');
            return;
        }

        console.log('[ExperienceComposer] 📋 Loading AcademyManifest...');

        var script = document.createElement('script');
        script.src = 'js/academy/academyManifest.js';
        script.async = false;

        script.onload = function() {
            console.log('[ExperienceComposer] ✅ AcademyManifest loaded');
            if (window.LawAIApp?.AcademyManifest) {
                console.log('[ExperienceComposer] 📋 Manifest version:', window.LawAIApp.AcademyManifest.version);
            }
        }.bind(this);

        script.onerror = function() {
            console.warn('[ExperienceComposer] ⚠️ AcademyManifest load failed (non-critical)');
            // Manifest 不是必须的，Loader 有默认值
        }.bind(this);

        document.head.appendChild(script);
    },

    _startAcademy: function() {
        var loader = window.LawAIApp?.AcademyLoader;
        if (!loader) {
            console.warn('[ExperienceComposer] AcademyLoader not available');
            this._academyStatus = 'failed';
            this._emit('ACADEMY_FAILED', { error: 'Loader not available' });
            return;
        }

        var status = loader.getStatus ? loader.getStatus() : {};
        if (status.status === 'ready' || status.status === 'starting') {
            console.log('[ExperienceComposer] Academy already started');
            this._academyStatus = 'ready';
            this._verifyRegistries();
            return;
        }

        console.log('[ExperienceComposer] 🏛️ Starting Academy...');

        try {
            var result = loader.start();
            if (result && typeof result.then === 'function') {
                result.then(function() {
                    console.log('[ExperienceComposer] ✅ Academy started');
                    this._academyStatus = 'ready';
                    this._verifyRegistries();
                    this._emit('ACADEMY_READY', { status: 'ready' });
                }.bind(this)).catch(function(err) {
                    console.warn('[ExperienceComposer] Academy start failed:', err);
                    this._academyStatus = 'failed';
                    this._emit('ACADEMY_FAILED', { error: err.message });
                }.bind(this));
            } else {
                console.log('[ExperienceComposer] ✅ Academy started (sync)');
                this._academyStatus = 'ready';
                this._verifyRegistries();
                this._emit('ACADEMY_READY', { status: 'ready' });
            }
        } catch (err) {
            console.warn('[ExperienceComposer] Academy start error:', err);
            this._academyStatus = 'failed';
            this._emit('ACADEMY_FAILED', { error: err.message });
        }
    },

    /**
     * 🔥 NEW: 验证 Academy Registry 可用性
     */
    _verifyRegistries: function() {
        console.log('[ExperienceComposer] 🔍 Verifying Academy Registries...');

        var checks = {
            AcademyRegistry: !!(window.LawAIApp?.AcademyRegistry),
            SchoolRegistry: !!(window.LawAIApp?.SchoolRegistry)
        };

        var allAvailable = checks.AcademyRegistry && checks.SchoolRegistry;

        if (allAvailable) {
            console.log('[ExperienceComposer] ✅ All registries available');
            
            // 获取统计信息
            try {
                var stats = window.LawAIApp.AcademyRegistry?.getStats?.();
                if (stats) {
                    console.log('[ExperienceComposer] 📊 Academy stats:', stats);
                }
            } catch (e) {
                // 忽略
            }
        } else {
            console.warn('[ExperienceComposer] ⚠️ Some registries missing:', checks);
        }

        this._emit('REGISTRY_VERIFIED', { 
            checks: checks, 
            allAvailable: allAvailable,
            timestamp: Date.now()
        });

        return checks;
    },

    // ============================================================
    // 6. PRIVATE — Event Helpers
    // ============================================================

    _emit: function(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            window.dispatchEvent(event);

            if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
                LawAIApp.EventBus.emit(eventName, data);
            }
        } catch (err) {
            // 忽略
        }
    },

    // ============================================================
    // 7. LEGACY — renderExperience (保持原有功能)
    // ============================================================

    renderExperience: function(data) {
        var root = document.getElementById('app');
        if (!root) return;

        // 🔥 使用 ViewState 替代 DOM 检测
        if (this._viewState.academy === 'ready' || this._viewState.academy === 'initializing') {
            // Academy 正在渲染，不覆盖
            console.log('[ExperienceComposer] Academy active, skipping render');
            return;
        }

        root.innerHTML = `
            <div style="padding:20px;color:white">
                <h2>🧠 Learning Experience</h2>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;
    },

    // ============================================================
    // 8. LEGACY — init (保持兼容)
    // ============================================================

    init: function() {
        console.log('🎬 ExperienceComposer init (legacy)');
        return this.start();
    }
};

// ============================================================
// AUTO-INIT (延迟，等待 app.js 调用)
// ============================================================

console.log('🎬 ExperienceComposer V2.1 loaded (Academy Integration Patch)');

// 如果 app.js 调用了 ExperienceComposer.init()，它会触发 start()
// 不自动启动，避免过早加载
