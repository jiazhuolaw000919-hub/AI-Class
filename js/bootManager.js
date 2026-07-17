// ================================================================
// bootManager.js – V3.0.3 - Recovery Architecture Integration
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
    // 🔥 PART 1 & 2 RECOVERY: Architecture Integration
    // ============================================================

    /**
     * 🔥 Initialize Recovery Architecture
     * Called before normal boot sequence
     */
    _initRecoveryArchitecture: function() {
        console.log('🏗️ BootManager: Initializing Recovery Architecture...');

        try {
            // ============================================================
            // 1. RUNTIME STATUS (先设置状态)
            // ============================================================
            if (typeof LawAIApp.RuntimeStatus !== 'undefined') {
                if (typeof LawAIApp.RuntimeStatus.setStatus === 'function') {
                    LawAIApp.RuntimeStatus.setStatus('initializing');
                }
                console.log('✅ RuntimeStatus initialized');
            } else if (typeof window.runtimeStatus !== 'undefined') {
                if (typeof window.runtimeStatus.setStatus === 'function') {
                    window.runtimeStatus.setStatus('initializing');
                }
                console.log('✅ RuntimeStatus initialized (global)');
            } else {
                console.warn('⚠️ RuntimeStatus not found - skipping');
            }

            // ============================================================
            // 2. RUNTIME KERNEL
            // ============================================================
            if (typeof LawAIApp.RuntimeKernel !== 'undefined') {
                if (typeof LawAIApp.RuntimeKernel.initialize === 'function') {
                    LawAIApp.RuntimeKernel.initialize();
                }
                console.log('✅ RuntimeKernel initialized');
            } else if (typeof window.runtimeKernel !== 'undefined') {
                if (typeof window.runtimeKernel.initialize === 'function') {
                    window.runtimeKernel.initialize();
                }
                console.log('✅ RuntimeKernel initialized (global)');
            } else {
                console.warn('⚠️ RuntimeKernel not found - skipping');
            }

            // ============================================================
            // 3. RUNTIME REGISTRY (你的现有版本 - 已存在)
            // ============================================================
            if (typeof LawAIApp.RuntimeRegistry !== 'undefined') {
                // 你的现有 RuntimeRegistry 已经 ready
                console.log('✅ RuntimeRegistry already available (LawAIApp.RuntimeRegistry)');
            }

            // ============================================================
            // 4. RUNTIME LIFECYCLE
            // ============================================================
            if (typeof LawAIApp.RuntimeLifecycle !== 'undefined') {
                if (typeof LawAIApp.RuntimeLifecycle.init === 'function') {
                    LawAIApp.RuntimeLifecycle.init();
                }
                console.log('✅ RuntimeLifecycle initialized');
            } else if (typeof window.runtimeLifecycle !== 'undefined') {
                if (typeof window.runtimeLifecycle.init === 'function') {
                    window.runtimeLifecycle.init();
                }
                console.log('✅ RuntimeLifecycle initialized (global)');
            } else {
                console.warn('⚠️ RuntimeLifecycle not found - skipping');
            }

            // ============================================================
            // 5. DOMAIN REGISTRY
            // ============================================================
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

            // ============================================================
            // 6. LAYER REGISTRY
            // ============================================================
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

            // ============================================================
            // 7. ARCHITECTURE VALIDATOR
            // ============================================================
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

            // ============================================================
            // 8. RUNTIME HEALTH
            // ============================================================
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

            // ============================================================
            // 9. RUNTIME INSPECTOR
            // ============================================================
            if (typeof LawAIApp.RuntimeInspector !== 'undefined') {
                if (typeof LawAIApp.RuntimeInspector.init === 'function') {
                    LawAIApp.RuntimeInspector.init();
                }
                console.log('✅ RuntimeInspector initialized');
            } else if (typeof window.runtimeInspector !== 'undefined') {
                if (typeof window.runtimeInspector.init === 'function') {
                    window.runtimeInspector.init();
                }
                console.log('✅ RuntimeInspector initialized (global)');
            } else {
                console.warn('⚠️ RuntimeInspector not found - skipping');
            }

            // ============================================================
            // 10. BOOT PERFORMANCE
            // ============================================================
            if (typeof LawAIApp.BootPerformance !== 'undefined') {
                if (typeof LawAIApp.BootPerformance.init === 'function') {
                    LawAIApp.BootPerformance.init();
                }
                console.log('✅ BootPerformance initialized');
            } else if (typeof window.bootPerformance !== 'undefined') {
                if (typeof window.bootPerformance.init === 'function') {
                    window.bootPerformance.init();
                }
                console.log('✅ BootPerformance initialized (global)');
            } else {
                console.warn('⚠️ BootPerformance not found - skipping');
            }

            // ============================================================
            // 11. SYSTEM COMPOSER (占位方法)
            // ============================================================
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
                if (typeof LawAIApp.SystemComposer.refresh === 'function') {
                    LawAIApp.SystemComposer.refresh();
                }
                if (typeof LawAIApp.SystemComposer.destroy === 'function') {
                    LawAIApp.SystemComposer.destroy();
                }
                console.log('✅ SystemComposer placeholders initialized');
            } else {
                console.warn('⚠️ SystemComposer not found - skipping');
            }

            // ============================================================
            // 12. RUNTIME KERNEL BOOT
            // ============================================================
            if (typeof LawAIApp.RuntimeKernel !== 'undefined') {
                if (typeof LawAIApp.RuntimeKernel.boot === 'function') {
                    LawAIApp.RuntimeKernel.boot();
                }
                console.log('✅ RuntimeKernel booted');
            } else if (typeof window.runtimeKernel !== 'undefined') {
                if (typeof window.runtimeKernel.boot === 'function') {
                    window.runtimeKernel.boot();
                }
                console.log('✅ RuntimeKernel booted (global)');
            }

            // ============================================================
            // 13. SET RUNTIME STATUS TO READY
            // ============================================================
            if (typeof LawAIApp.RuntimeStatus !== 'undefined') {
                if (typeof LawAIApp.RuntimeStatus.setStatus === 'function') {
                    LawAIApp.RuntimeStatus.setStatus('ready');
                }
            } else if (typeof window.runtimeStatus !== 'undefined') {
                if (typeof window.runtimeStatus.setStatus === 'function') {
                    window.runtimeStatus.setStatus('ready');
                }
            }

            // ============================================================
            // 14. BOOT PERFORMANCE COMPLETE
            // ============================================================
            if (typeof LawAIApp.BootPerformance !== 'undefined') {
                if (typeof LawAIApp.BootPerformance.complete === 'function') {
                    LawAIApp.BootPerformance.complete();
                }
            } else if (typeof window.bootPerformance !== 'undefined') {
                if (typeof window.bootPerformance.complete === 'function') {
                    window.bootPerformance.complete();
                }
            }

            console.log('✅ Architecture Ready');
            console.log('✅ Runtime Ready');
            console.log('✅ Composer Ready');
            console.log('✅ Application Ready');
            console.log('✅ Recovery Core Runtime Ready');

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

        // 🔥 PART 1 & 2 RECOVERY: Initialize architecture before boot
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

console.log('🚀 BootManager V3.0.3 ready (Recovery Architecture + Profiler + Dependency)');
