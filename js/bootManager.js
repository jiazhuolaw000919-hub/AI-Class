// ================================================================
// bootManager.js – V3.0.2 - Recovery Architecture Integration
// 只做一件事：调度启动，不执行具体逻辑
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.BootManager = {
    _booted: false,
    _stages: {
        critical: false,
        ux: false,
        intelligence: false,
        background: false
    },

    // ============================================================
    // 🔥 PART 1 RECOVERY: Architecture Integration
    // ============================================================

    /**
     * 🔥 Initialize Recovery Architecture
     * Called before normal boot sequence
     */
    _initRecoveryArchitecture: function() {
        console.log('🏗️ BootManager: Initializing Recovery Architecture...');

        try {
            // 1. Check if DomainRegistry exists (loaded via script tag or module)
            if (typeof LawAIApp.DomainRegistry !== 'undefined') {
                if (typeof LawAIApp.DomainRegistry.init === 'function') {
                    LawAIApp.DomainRegistry.init();
                }
                console.log('✅ DomainRegistry initialized');
            } else if (typeof window.domainRegistry !== 'undefined') {
                if (typeof window.domainRegistry.init === 'function') {
                    window.domainRegistry.init();
                }
                console.log('✅ DomainRegistry initialized (global)');
            } else {
                console.warn('⚠️ DomainRegistry not found - skipping');
            }

            // 2. LayerRegistry
            if (typeof LawAIApp.LayerRegistry !== 'undefined') {
                if (typeof LawAIApp.LayerRegistry.init === 'function') {
                    LawAIApp.LayerRegistry.init();
                }
                console.log('✅ LayerRegistry initialized');
            } else if (typeof window.layerRegistry !== 'undefined') {
                if (typeof window.layerRegistry.init === 'function') {
                    window.layerRegistry.init();
                }
                console.log('✅ LayerRegistry initialized (global)');
            } else {
                console.warn('⚠️ LayerRegistry not found - skipping');
            }

            // 3. ArchitectureValidator
            if (typeof LawAIApp.ArchitectureValidator !== 'undefined') {
                if (typeof LawAIApp.ArchitectureValidator.validate === 'function') {
                    LawAIApp.ArchitectureValidator.validate();
                }
                console.log('✅ ArchitectureValidator initialized');
            } else if (typeof window.architectureValidator !== 'undefined') {
                if (typeof window.architectureValidator.validate === 'function') {
                    window.architectureValidator.validate();
                }
                console.log('✅ ArchitectureValidator initialized (global)');
            } else {
                console.warn('⚠️ ArchitectureValidator not found - skipping');
            }

            // 4. RuntimeHealth
            if (typeof LawAIApp.RuntimeHealth !== 'undefined') {
                if (typeof LawAIApp.RuntimeHealth.init === 'function') {
                    LawAIApp.RuntimeHealth.init();
                }
                console.log('✅ RuntimeHealth initialized');
            } else if (typeof window.runtimeHealth !== 'undefined') {
                if (typeof window.runtimeHealth.init === 'function') {
                    window.runtimeHealth.init();
                }
                console.log('✅ RuntimeHealth initialized (global)');
            } else {
                console.warn('⚠️ RuntimeHealth not found - skipping');
            }

            // 5. SystemComposer compose placeholders
            if (LawAIApp.SystemComposer) {
                if (typeof LawAIApp.SystemComposer.composeLayout === 'function') {
                    LawAIApp.SystemComposer.composeLayout();
                }
                if (typeof LawAIApp.SystemComposer.composeDashboard === 'function') {
                    LawAIApp.SystemComposer.composeDashboard();
                }
                if (typeof LawAIApp.SystemComposer.composeWorkspace === 'function') {
                    LawAIApp.SystemComposer.composeWorkspace();
                }
                if (typeof LawAIApp.SystemComposer.composeWidgets === 'function') {
                    LawAIApp.SystemComposer.composeWidgets();
                }
                if (typeof LawAIApp.SystemComposer.activateModules === 'function') {
                    LawAIApp.SystemComposer.activateModules();
                }
                console.log('✅ SystemComposer placeholders initialized');
            } else {
                console.warn('⚠️ SystemComposer not found - skipping');
            }

            console.log('✅ Recovery Foundation Ready');

        } catch (err) {
            console.warn('⚠️ Recovery architecture initialization warning:', err.message);
            // 继续启动，不阻塞
        }
    },

    // ============================================================
    // ORIGINAL START METHOD (Extended)
    // ============================================================

    start: function() {
        if (this._booted) {
            return Promise.resolve({ status: 'already_booted' });
        }

        // 🔥 PART 1 RECOVERY: Initialize architecture before boot
        this._initRecoveryArchitecture();

        this._booted = true;

        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.registerEngine('BootManager');
            LawAIApp.DevTools.RuntimeProfiler._currentCaller = 'BootManager';
        }

        try {
            LawAIApp.EventBus?.emit?.('BootStarted');
        } catch (e) { /* 静默 */ }

        console.log('🚀 BootManager: Startup scheduled');

        return Promise.resolve({ status: 'started' });
    },

    // ============================================================
    // ORIGINAL METHODS (Unchanged)
    // ============================================================

    markStage: function(stage) {
        if (this._stages[stage] !== undefined) {
            this._stages[stage] = true;
        }
    },

    getStatus: function() {
        return {
            booted: this._booted,
            stages: this._stages,
            allComplete: Object.values(this._stages).every(function(v) { return v; })
        };
    },

    getStages: function() {
        return this._stages;
    },

    isBooted: function() {
        return this._booted;
    }
};

console.log('🚀 BootManager V3.0.2 ready (Recovery Architecture + Profiler + Dependency)');
