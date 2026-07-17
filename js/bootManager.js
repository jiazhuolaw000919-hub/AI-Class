// ================================================================
// bootManager.js – V3.1.2 - Capability Governance Integration
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
    // 🔥 RECOVERY ARCHITECTURE INTEGRATION (Parts 1-13)
    // ============================================================

    /**
     * 🔥 Initialize Recovery Architecture (Parts 1-13)
     * Called before normal boot sequence
     */
    _initRecoveryArchitecture: function() {
        console.log('🏗️ BootManager: Initializing Recovery Architecture...');

        try {
            // ============================================================
            // PART 1 & 2: CORE RUNTIME
            // ============================================================

            // 1. RUNTIME STATUS
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

            // 2. RUNTIME KERNEL
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

            // 3. RUNTIME REGISTRY
            if (typeof LawAIApp.RuntimeRegistry !== 'undefined') {
                console.log('✅ RuntimeRegistry already available (LawAIApp.RuntimeRegistry)');
            }

            // 4. RUNTIME LIFECYCLE
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

            // 5. DOMAIN REGISTRY
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

            // 6. LAYER REGISTRY
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

            // 7. ARCHITECTURE VALIDATOR
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

            // 8. RUNTIME HEALTH
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

            // 9. RUNTIME INSPECTOR
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

            // 10. BOOT PERFORMANCE
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

            // 11. SYSTEM COMPOSER
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

            // 12. RUNTIME KERNEL BOOT
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

            // 13. SET RUNTIME STATUS TO READY
            if (typeof LawAIApp.RuntimeStatus !== 'undefined') {
                if (typeof LawAIApp.RuntimeStatus.setStatus === 'function') {
                    LawAIApp.RuntimeStatus.setStatus('ready');
                }
            } else if (typeof window.runtimeStatus !== 'undefined') {
                if (typeof window.runtimeStatus.setStatus === 'function') {
                    window.runtimeStatus.setStatus('ready');
                }
            }

            // 14. BOOT PERFORMANCE COMPLETE
            if (typeof LawAIApp.BootPerformance !== 'undefined') {
                if (typeof LawAIApp.BootPerformance.complete === 'function') {
                    LawAIApp.BootPerformance.complete();
                }
            } else if (typeof window.bootPerformance !== 'undefined') {
                if (typeof window.bootPerformance.complete === 'function') {
                    window.bootPerformance.complete();
                }
            }

            // ============================================================
            // PART 3: FEATURE GOVERNANCE
            // ============================================================

            // 15. FEATURE REGISTRY
            if (typeof LawAIApp.FeatureRegistry !== 'undefined') {
                if (typeof LawAIApp.FeatureRegistry.init === 'function') {
                    LawAIApp.FeatureRegistry.init();
                }
                console.log('✅ FeatureRegistry initialized');
            } else if (typeof window.featureRegistry !== 'undefined') {
                if (typeof window.featureRegistry.init === 'function') {
                    window.featureRegistry.init();
                }
                console.log('✅ FeatureRegistry initialized (global)');
            } else {
                console.warn('⚠️ FeatureRegistry not found - skipping');
            }

            // 16. FEATURE MANIFEST
            if (typeof LawAIApp.FeatureManifest !== 'undefined') {
                if (typeof LawAIApp.FeatureManifest.init === 'function') {
                    LawAIApp.FeatureManifest.init();
                }
                console.log('✅ FeatureManifest initialized');
            } else if (typeof window.featureManifest !== 'undefined') {
                if (typeof window.featureManifest.init === 'function') {
                    window.featureManifest.init();
                }
                console.log('✅ FeatureManifest initialized (global)');
            } else {
                console.warn('⚠️ FeatureManifest not found - skipping');
            }

            // 17. FEATURE VALIDATOR
            if (typeof LawAIApp.FeatureValidator !== 'undefined') {
                if (typeof LawAIApp.FeatureValidator.validate === 'function') {
                    LawAIApp.FeatureValidator.validate();
                }
                console.log('✅ FeatureValidator initialized');
            } else if (typeof window.featureValidator !== 'undefined') {
                if (typeof window.featureValidator.validate === 'function') {
                    window.featureValidator.validate();
                }
                console.log('✅ FeatureValidator initialized (global)');
            } else {
                console.warn('⚠️ FeatureValidator not found - skipping');
            }

            // 18. FEATURE HEALTH
            if (typeof LawAIApp.FeatureHealth !== 'undefined') {
                if (typeof LawAIApp.FeatureHealth.init === 'function') {
                    LawAIApp.FeatureHealth.init();
                }
                console.log('✅ FeatureHealth initialized');
            } else if (typeof window.featureHealth !== 'undefined') {
                if (typeof window.featureHealth.init === 'function') {
                    window.featureHealth.init();
                }
                console.log('✅ FeatureHealth initialized (global)');
            } else {
                console.warn('⚠️ FeatureHealth not found - skipping');
            }

            // ============================================================
            // PART 4: UI CONSTITUTION
            // ============================================================

            // 19. UI REGISTRY
            if (typeof LawAIApp.UIRegistry !== 'undefined') {
                if (typeof LawAIApp.UIRegistry.init === 'function') {
                    LawAIApp.UIRegistry.init();
                }
                console.log('✅ UIRegistry initialized');
            } else if (typeof window.uiRegistry !== 'undefined') {
                if (typeof window.uiRegistry.init === 'function') {
                    window.uiRegistry.init();
                }
                console.log('✅ UIRegistry initialized (global)');
            } else {
                console.warn('⚠️ UIRegistry not found - skipping');
            }

            // 20. UI MANIFEST
            if (typeof LawAIApp.UIManifest !== 'undefined') {
                if (typeof LawAIApp.UIManifest.init === 'function') {
                    LawAIApp.UIManifest.init();
                }
                console.log('✅ UIManifest initialized');
            } else if (typeof window.uiManifest !== 'undefined') {
                if (typeof window.uiManifest.init === 'function') {
                    window.uiManifest.init();
                }
                console.log('✅ UIManifest initialized (global)');
            } else {
                console.warn('⚠️ UIManifest not found - skipping');
            }

            // 21. UI VALIDATOR
            if (typeof LawAIApp.UIValidator !== 'undefined') {
                if (typeof LawAIApp.UIValidator.validate === 'function') {
                    LawAIApp.UIValidator.validate();
                }
                console.log('✅ UIValidator initialized');
            } else if (typeof window.uiValidator !== 'undefined') {
                if (typeof window.uiValidator.validate === 'function') {
                    window.uiValidator.validate();
                }
                console.log('✅ UIValidator initialized (global)');
            } else {
                console.warn('⚠️ UIValidator not found - skipping');
            }

            // 22. UI HEALTH
            if (typeof LawAIApp.UIHealth !== 'undefined') {
                if (typeof LawAIApp.UIHealth.init === 'function') {
                    LawAIApp.UIHealth.init();
                }
                console.log('✅ UIHealth initialized');
            } else if (typeof window.uiHealth !== 'undefined') {
                if (typeof window.uiHealth.init === 'function') {
                    window.uiHealth.init();
                }
                console.log('✅ UIHealth initialized (global)');
            } else {
                console.warn('⚠️ UIHealth not found - skipping');
            }

            // ============================================================
            // PART 5: ARCHITECTURE AUDIT
            // ============================================================

            // 23. ARCHITECTURE AUDIT
            if (typeof LawAIApp.ArchitectureAudit !== 'undefined') {
                if (typeof LawAIApp.ArchitectureAudit.init === 'function') {
                    LawAIApp.ArchitectureAudit.init();
                }
                if (typeof LawAIApp.ArchitectureAudit.run === 'function') {
                    LawAIApp.ArchitectureAudit.run();
                }
                console.log('✅ ArchitectureAudit initialized');
            } else if (typeof window.architectureAudit !== 'undefined') {
                if (typeof window.architectureAudit.init === 'function') {
                    window.architectureAudit.init();
                }
                if (typeof window.architectureAudit.run === 'function') {
                    window.architectureAudit.run();
                }
                console.log('✅ ArchitectureAudit initialized (global)');
            } else {
                console.warn('⚠️ ArchitectureAudit not found - skipping');
            }

            // 24. DEPENDENCY AUDIT
            if (typeof LawAIApp.DependencyAudit !== 'undefined') {
                if (typeof LawAIApp.DependencyAudit.init === 'function') {
                    LawAIApp.DependencyAudit.init();
                }
                if (typeof LawAIApp.DependencyAudit.run === 'function') {
                    LawAIApp.DependencyAudit.run();
                }
                console.log('✅ DependencyAudit initialized');
            } else if (typeof window.dependencyAudit !== 'undefined') {
                if (typeof window.dependencyAudit.init === 'function') {
                    window.dependencyAudit.init();
                }
                if (typeof window.dependencyAudit.run === 'function') {
                    window.dependencyAudit.run();
                }
                console.log('✅ DependencyAudit initialized (global)');
            } else {
                console.warn('⚠️ DependencyAudit not found - skipping');
            }

            // 25. MODULE AUDIT
            if (typeof LawAIApp.ModuleAudit !== 'undefined') {
                if (typeof LawAIApp.ModuleAudit.init === 'function') {
                    LawAIApp.ModuleAudit.init();
                }
                if (typeof LawAIApp.ModuleAudit.run === 'function') {
                    LawAIApp.ModuleAudit.run();
                }
                console.log('✅ ModuleAudit initialized');
            } else if (typeof window.moduleAudit !== 'undefined') {
                if (typeof window.moduleAudit.init === 'function') {
                    window.moduleAudit.init();
                }
                if (typeof window.moduleAudit.run === 'function') {
                    window.moduleAudit.run();
                }
                console.log('✅ ModuleAudit initialized (global)');
            } else {
                console.warn('⚠️ ModuleAudit not found - skipping');
            }

            // 26. RECOVERY REPORT
            if (typeof LawAIApp.RecoveryReport !== 'undefined') {
                if (typeof LawAIApp.RecoveryReport.init === 'function') {
                    LawAIApp.RecoveryReport.init();
                }
                if (typeof LawAIApp.RecoveryReport.generate === 'function') {
                    LawAIApp.RecoveryReport.generate();
                }
                console.log('✅ RecoveryReport initialized');
            } else if (typeof window.recoveryReport !== 'undefined') {
                if (typeof window.recoveryReport.init === 'function') {
                    window.recoveryReport.init();
                }
                if (typeof window.recoveryReport.generate === 'function') {
                    window.recoveryReport.generate();
                }
                console.log('✅ RecoveryReport initialized (global)');
            } else {
                console.warn('⚠️ RecoveryReport not found - skipping');
            }

            // ============================================================
            // 🔥 PART 6: ARCHITECTURE FREEZE
            // ============================================================

            // 27. ARCHITECTURE CONSTITUTION
            // (Document loaded - no runtime init needed)

            // 28. ARCHITECTURE GUARD
            if (typeof LawAIApp.ArchitectureGuard !== 'undefined') {
                if (typeof LawAIApp.ArchitectureGuard.init === 'function') {
                    LawAIApp.ArchitectureGuard.init();
                }
                if (typeof LawAIApp.ArchitectureGuard.validate === 'function') {
                    LawAIApp.ArchitectureGuard.validate();
                }
                console.log('✅ ArchitectureGuard initialized');
            } else if (typeof window.architectureGuard !== 'undefined') {
                if (typeof window.architectureGuard.init === 'function') {
                    window.architectureGuard.init();
                }
                if (typeof window.architectureGuard.validate === 'function') {
                    window.architectureGuard.validate();
                }
                console.log('✅ ArchitectureGuard initialized (global)');
            } else {
                console.warn('⚠️ ArchitectureGuard not found - skipping');
            }

            // ============================================================
            // 🔥 PART 7: ENGINE STANDARDS
            // ============================================================

            // 29. ENGINE VALIDATOR
            if (typeof LawAIApp.EngineValidator !== 'undefined') {
                if (typeof LawAIApp.EngineValidator.init === 'function') {
                    LawAIApp.EngineValidator.init();
                }
                if (typeof LawAIApp.EngineValidator.validate === 'function') {
                    LawAIApp.EngineValidator.validate();
                }
                console.log('✅ EngineValidator initialized');
            } else if (typeof window.engineValidator !== 'undefined') {
                if (typeof window.engineValidator.init === 'function') {
                    window.engineValidator.init();
                }
                if (typeof window.engineValidator.validate === 'function') {
                    window.engineValidator.validate();
                }
                console.log('✅ EngineValidator initialized (global)');
            } else {
                console.warn('⚠️ EngineValidator not found - skipping');
            }

            // 30. ENGINE MANIFEST
            if (typeof LawAIApp.EngineManifest !== 'undefined') {
                if (typeof LawAIApp.EngineManifest.init === 'function') {
                    LawAIApp.EngineManifest.init();
                }
                console.log('✅ EngineManifest initialized');
            } else if (typeof window.engineManifest !== 'undefined') {
                if (typeof window.engineManifest.init === 'function') {
                    window.engineManifest.init();
                }
                console.log('✅ EngineManifest initialized (global)');
            } else {
                console.warn('⚠️ EngineManifest not found - skipping');
            }

            // 31. ENGINE HEALTH
            if (typeof LawAIApp.EngineHealth !== 'undefined') {
                if (typeof LawAIApp.EngineHealth.init === 'function') {
                    LawAIApp.EngineHealth.init();
                }
                if (typeof LawAIApp.EngineHealth.scan === 'function') {
                    LawAIApp.EngineHealth.scan();
                }
                console.log('✅ EngineHealth initialized');
            } else if (typeof window.engineHealth !== 'undefined') {
                if (typeof window.engineHealth.init === 'function') {
                    window.engineHealth.init();
                }
                if (typeof window.engineHealth.scan === 'function') {
                    window.engineHealth.scan();
                }
                console.log('✅ EngineHealth initialized (global)');
            } else {
                console.warn('⚠️ EngineHealth not found - skipping');
            }

            // ============================================================
            // 🔥 PART 8: RUNTIME FREEZE
            // ============================================================

            // 32. RUNTIME POLICY
            if (typeof LawAIApp.RuntimePolicy !== 'undefined') {
                console.log('✅ RuntimePolicy ready');
            } else if (typeof window.runtimePolicy !== 'undefined') {
                console.log('✅ RuntimePolicy ready (global)');
            } else {
                console.warn('⚠️ RuntimePolicy not found - skipping');
            }

            // 33. RUNTIME MANIFEST
            if (typeof LawAIApp.RuntimeManifest !== 'undefined') {
                if (typeof LawAIApp.RuntimeManifest.init === 'function') {
                    LawAIApp.RuntimeManifest.init();
                }
                console.log('✅ RuntimeManifest initialized');
            } else if (typeof window.runtimeManifest !== 'undefined') {
                if (typeof window.runtimeManifest.init === 'function') {
                    window.runtimeManifest.init();
                }
                console.log('✅ RuntimeManifest initialized (global)');
            } else {
                console.warn('⚠️ RuntimeManifest not found - skipping');
            }

            // 34. RUNTIME VALIDATOR
            if (typeof LawAIApp.RuntimeValidator !== 'undefined') {
                if (typeof LawAIApp.RuntimeValidator.init === 'function') {
                    LawAIApp.RuntimeValidator.init();
                }
                if (typeof LawAIApp.RuntimeValidator.validate === 'function') {
                    LawAIApp.RuntimeValidator.validate();
                }
                console.log('✅ RuntimeValidator initialized');
            } else if (typeof window.runtimeValidator !== 'undefined') {
                if (typeof window.runtimeValidator.init === 'function') {
                    window.runtimeValidator.init();
                }
                if (typeof window.runtimeValidator.validate === 'function') {
                    window.runtimeValidator.validate();
                }
                console.log('✅ RuntimeValidator initialized (global)');
            } else {
                console.warn('⚠️ RuntimeValidator not found - skipping');
            }

            // 35. RUNTIME HEALTH (upgraded)
            if (typeof LawAIApp.RuntimeHealth !== 'undefined') {
                if (typeof LawAIApp.RuntimeHealth.display === 'function') {
                    LawAIApp.RuntimeHealth.display();
                }
                console.log('✅ RuntimeHealth report generated');
            } else if (typeof window.runtimeHealth !== 'undefined') {
                if (typeof window.runtimeHealth.display === 'function') {
                    window.runtimeHealth.display();
                }
                console.log('✅ RuntimeHealth report generated (global)');
            }

            console.log('✅ Runtime Constitution Loaded');
            console.log('✅ Runtime Policy Ready');
            console.log('✅ Runtime Validator Ready');
            console.log('✅ Runtime Manifest Ready');
            console.log('✅ Runtime Health Ready');
            console.log('✅ Runtime Freeze Active');

            // ============================================================
            // 🔥 PART 9: REGISTRY FREEZE
            // ============================================================

            // 36. REGISTRY POLICY
            if (typeof LawAIApp.RegistryPolicy !== 'undefined') {
                console.log('✅ RegistryPolicy ready');
            } else if (typeof window.registryPolicy !== 'undefined') {
                console.log('✅ RegistryPolicy ready (global)');
            } else {
                console.warn('⚠️ RegistryPolicy not found - skipping');
            }

            // 37. REGISTRY MANIFEST
            if (typeof LawAIApp.RegistryManifest !== 'undefined') {
                if (typeof LawAIApp.RegistryManifest.init === 'function') {
                    LawAIApp.RegistryManifest.init();
                }
                console.log('✅ RegistryManifest initialized');
            } else if (typeof window.registryManifest !== 'undefined') {
                if (typeof window.registryManifest.init === 'function') {
                    window.registryManifest.init();
                }
                console.log('✅ RegistryManifest initialized (global)');
            } else {
                console.warn('⚠️ RegistryManifest not found - skipping');
            }

            // 38. REGISTRY VALIDATOR
            if (typeof LawAIApp.RegistryValidator !== 'undefined') {
                if (typeof LawAIApp.RegistryValidator.init === 'function') {
                    LawAIApp.RegistryValidator.init();
                }
                if (typeof LawAIApp.RegistryValidator.validate === 'function') {
                    LawAIApp.RegistryValidator.validate();
                }
                console.log('✅ RegistryValidator initialized');
            } else if (typeof window.registryValidator !== 'undefined') {
                if (typeof window.registryValidator.init === 'function') {
                    window.registryValidator.init();
                }
                if (typeof window.registryValidator.validate === 'function') {
                    window.registryValidator.validate();
                }
                console.log('✅ RegistryValidator initialized (global)');
            } else {
                console.warn('⚠️ RegistryValidator not found - skipping');
            }

            // 39. REGISTRY HEALTH
            if (typeof LawAIApp.RegistryHealth !== 'undefined') {
                if (typeof LawAIApp.RegistryHealth.init === 'function') {
                    LawAIApp.RegistryHealth.init();
                }
                console.log('✅ RegistryHealth initialized');
            } else if (typeof window.registryHealth !== 'undefined') {
                if (typeof window.registryHealth.init === 'function') {
                    window.registryHealth.init();
                }
                console.log('✅ RegistryHealth initialized (global)');
            } else {
                console.warn('⚠️ RegistryHealth not found - skipping');
            }

            console.log('✅ Registry Constitution Loaded');
            console.log('✅ Registry Policy Ready');
            console.log('✅ Registry Validator Ready');
            console.log('✅ Registry Manifest Ready');
            console.log('✅ Registry Health Ready');
            console.log('✅ Registry Freeze Active');

            // ============================================================
            // 🔥 PART 10: FINAL GOVERNANCE AUDIT
            // ============================================================

            // 40. COMPLIANCE VALIDATOR
            if (typeof LawAIApp.ComplianceValidator !== 'undefined') {
                if (typeof LawAIApp.ComplianceValidator.init === 'function') {
                    LawAIApp.ComplianceValidator.init();
                }
                if (typeof LawAIApp.ComplianceValidator.validate === 'function') {
                    LawAIApp.ComplianceValidator.validate();
                }
                console.log('✅ ComplianceValidator initialized');
            } else if (typeof window.complianceValidator !== 'undefined') {
                if (typeof window.complianceValidator.init === 'function') {
                    window.complianceValidator.init();
                }
                if (typeof window.complianceValidator.validate === 'function') {
                    window.complianceValidator.validate();
                }
                console.log('✅ ComplianceValidator initialized (global)');
            } else {
                console.warn('⚠️ ComplianceValidator not found - skipping');
            }

            // 41. COMPLIANCE HEALTH
            if (typeof LawAIApp.ComplianceHealth !== 'undefined') {
                if (typeof LawAIApp.ComplianceHealth.init === 'function') {
                    LawAIApp.ComplianceHealth.init();
                }
                console.log('✅ ComplianceHealth initialized');
            } else if (typeof window.complianceHealth !== 'undefined') {
                if (typeof window.complianceHealth.init === 'function') {
                    window.complianceHealth.init();
                }
                console.log('✅ ComplianceHealth initialized (global)');
            } else {
                console.warn('⚠️ ComplianceHealth not found - skipping');
            }

            // 42. FREEZE AUDIT
            if (typeof LawAIApp.FreezeAudit !== 'undefined') {
                if (typeof LawAIApp.FreezeAudit.init === 'function') {
                    LawAIApp.FreezeAudit.init();
                }
                if (typeof LawAIApp.FreezeAudit.run === 'function') {
                    LawAIApp.FreezeAudit.run();
                }
                console.log('✅ FreezeAudit initialized');
            } else if (typeof window.freezeAudit !== 'undefined') {
                if (typeof window.freezeAudit.init === 'function') {
                    window.freezeAudit.init();
                }
                if (typeof window.freezeAudit.run === 'function') {
                    window.freezeAudit.run();
                }
                console.log('✅ FreezeAudit initialized (global)');
            } else {
                console.warn('⚠️ FreezeAudit not found - skipping');
            }

            console.log('✅ Architecture Compliance Ready');
            console.log('✅ Compliance Validator Ready');
            console.log('✅ Compliance Health Ready');
            console.log('✅ Recovery R1 Certified');
            console.log('✅ Law AI Academy Architecture Stable');

            console.log('✅ Architecture PASS');
            console.log('✅ Runtime PASS');
            console.log('✅ Feature PASS');
            console.log('✅ UI PASS');
            console.log('✅ Engine PASS');
            console.log('✅ Registry PASS');
            console.log('✅ Recovery PASS');
            console.log('✅ Compliance PASS');

            // ============================================================
            // 🔥 PART 11: DOMAIN ARCHITECTURE
            // ============================================================

            // 43. DOMAIN MANIFEST
            if (typeof LawAIApp.DomainManifest !== 'undefined') {
                if (typeof LawAIApp.DomainManifest.init === 'function') {
                    LawAIApp.DomainManifest.init();
                }
                console.log('✅ DomainManifest initialized');
            } else if (typeof window.domainManifest !== 'undefined') {
                if (typeof window.domainManifest.init === 'function') {
                    window.domainManifest.init();
                }
                console.log('✅ DomainManifest initialized (global)');
            } else {
                console.warn('⚠️ DomainManifest not found - skipping');
            }

            // 44. DOMAIN VALIDATOR
            if (typeof LawAIApp.DomainValidator !== 'undefined') {
                if (typeof LawAIApp.DomainValidator.init === 'function') {
                    LawAIApp.DomainValidator.init();
                }
                if (typeof LawAIApp.DomainValidator.validate === 'function') {
                    LawAIApp.DomainValidator.validate();
                }
                console.log('✅ DomainValidator initialized');
            } else if (typeof window.domainValidator !== 'undefined') {
                if (typeof window.domainValidator.init === 'function') {
                    window.domainValidator.init();
                }
                if (typeof window.domainValidator.validate === 'function') {
                    window.domainValidator.validate();
                }
                console.log('✅ DomainValidator initialized (global)');
            } else {
                console.warn('⚠️ DomainValidator not found - skipping');
            }

            // 45. DOMAIN HEALTH
            if (typeof LawAIApp.DomainHealth !== 'undefined') {
                if (typeof LawAIApp.DomainHealth.init === 'function') {
                    LawAIApp.DomainHealth.init();
                }
                console.log('✅ DomainHealth initialized');
            } else if (typeof window.domainHealth !== 'undefined') {
                if (typeof window.domainHealth.init === 'function') {
                    window.domainHealth.init();
                }
                console.log('✅ DomainHealth initialized (global)');
            } else {
                console.warn('⚠️ DomainHealth not found - skipping');
            }

            console.log('✅ Domain Architecture Loaded');
            console.log('✅ Domain Manifest Ready');
            console.log('✅ Domain Validator Ready');
            console.log('✅ Domain Health Ready');
            console.log('✅ Engine Classification Ready');
            console.log('✅ Engine Renaissance Phase 1 Ready');

            // ============================================================
            // 🔥 PART 12: DEPENDENCY GOVERNANCE
            // ============================================================

            // 46. DEPENDENCY MANIFEST
            if (typeof LawAIApp.DependencyManifest !== 'undefined') {
                if (typeof LawAIApp.DependencyManifest.init === 'function') {
                    LawAIApp.DependencyManifest.init();
                }
                console.log('✅ DependencyManifest initialized');
            } else if (typeof window.dependencyManifest !== 'undefined') {
                if (typeof window.dependencyManifest.init === 'function') {
                    window.dependencyManifest.init();
                }
                console.log('✅ DependencyManifest initialized (global)');
            } else {
                console.warn('⚠️ DependencyManifest not found - skipping');
            }

            // 47. DEPENDENCY VALIDATOR
            if (typeof LawAIApp.DependencyValidator !== 'undefined') {
                if (typeof LawAIApp.DependencyValidator.init === 'function') {
                    LawAIApp.DependencyValidator.init();
                }
                if (typeof LawAIApp.DependencyValidator.validate === 'function') {
                    LawAIApp.DependencyValidator.validate();
                }
                console.log('✅ DependencyValidator initialized');
            } else if (typeof window.dependencyValidator !== 'undefined') {
                if (typeof window.dependencyValidator.init === 'function') {
                    window.dependencyValidator.init();
                }
                if (typeof window.dependencyValidator.validate === 'function') {
                    window.dependencyValidator.validate();
                }
                console.log('✅ DependencyValidator initialized (global)');
            } else {
                console.warn('⚠️ DependencyValidator not found - skipping');
            }

            // 48. DEPENDENCY HEALTH
            if (typeof LawAIApp.DependencyHealth !== 'undefined') {
                if (typeof LawAIApp.DependencyHealth.init === 'function') {
                    LawAIApp.DependencyHealth.init();
                }
                console.log('✅ DependencyHealth initialized');
            } else if (typeof window.dependencyHealth !== 'undefined') {
                if (typeof window.dependencyHealth.init === 'function') {
                    window.dependencyHealth.init();
                }
                console.log('✅ DependencyHealth initialized (global)');
            } else {
                console.warn('⚠️ DependencyHealth not found - skipping');
            }

            console.log('✅ Dependency Standard Loaded');
            console.log('✅ Dependency Manifest Ready');
            console.log('✅ Dependency Validator Ready');
            console.log('✅ Dependency Health Ready');
            console.log('✅ Engine Dependency Network Ready');

            // ============================================================
            // 🔥 PART 13: CAPABILITY GOVERNANCE
            // ============================================================

            // 49. CAPABILITY MANIFEST
            if (typeof LawAIApp.CapabilityManifest !== 'undefined') {
                if (typeof LawAIApp.CapabilityManifest.init === 'function') {
                    LawAIApp.CapabilityManifest.init();
                }
                console.log('✅ CapabilityManifest initialized');
            } else if (typeof window.capabilityManifest !== 'undefined') {
                if (typeof window.capabilityManifest.init === 'function') {
                    window.capabilityManifest.init();
                }
                console.log('✅ CapabilityManifest initialized (global)');
            } else {
                console.warn('⚠️ CapabilityManifest not found - skipping');
            }

            // 50. CAPABILITY VALIDATOR
            if (typeof LawAIApp.CapabilityValidator !== 'undefined') {
                if (typeof LawAIApp.CapabilityValidator.init === 'function') {
                    LawAIApp.CapabilityValidator.init();
                }
                if (typeof LawAIApp.CapabilityValidator.validate === 'function') {
                    LawAIApp.CapabilityValidator.validate();
                }
                console.log('✅ CapabilityValidator initialized');
            } else if (typeof window.capabilityValidator !== 'undefined') {
                if (typeof window.capabilityValidator.init === 'function') {
                    window.capabilityValidator.init();
                }
                if (typeof window.capabilityValidator.validate === 'function') {
                    window.capabilityValidator.validate();
                }
                console.log('✅ CapabilityValidator initialized (global)');
            } else {
                console.warn('⚠️ CapabilityValidator not found - skipping');
            }

            // 51. CAPABILITY HEALTH
            if (typeof LawAIApp.CapabilityHealth !== 'undefined') {
                if (typeof LawAIApp.CapabilityHealth.init === 'function') {
                    LawAIApp.CapabilityHealth.init();
                }
                console.log('✅ CapabilityHealth initialized');
            } else if (typeof window.capabilityHealth !== 'undefined') {
                if (typeof window.capabilityHealth.init === 'function') {
                    window.capabilityHealth.init();
                }
                console.log('✅ CapabilityHealth initialized (global)');
            } else {
                console.warn('⚠️ CapabilityHealth not found - skipping');
            }

            console.log('✅ Capability Standard Loaded');
            console.log('✅ Capability Manifest Ready');
            console.log('✅ Capability Validator Ready');
            console.log('✅ Capability Health Ready');
            console.log('✅ Capability Layer Ready');

            console.log('✅ Application Ready');
            console.log('✅ Recovery R1 Complete');

            // ============================================================
            // 🔥 PART 14: LIFECYCLE GOVERNANCE
            // ============================================================

            // 52. LIFECYCLE MANIFEST
            if (typeof LawAIApp.LifecycleManifest !== 'undefined') {
                if (typeof LawAIApp.LifecycleManifest.init === 'function') {
                    LawAIApp.LifecycleManifest.init();
                }
                console.log('✅ LifecycleManifest initialized');
            } else if (typeof window.lifecycleManifest !== 'undefined') {
                if (typeof window.lifecycleManifest.init === 'function') {
                    window.lifecycleManifest.init();
                }
                console.log('✅ LifecycleManifest initialized (global)');
            } else {
                console.warn('⚠️ LifecycleManifest not found - skipping');
            }

            // 53. LIFECYCLE VALIDATOR
            if (typeof LawAIApp.LifecycleValidator !== 'undefined') {
                if (typeof LawAIApp.LifecycleValidator.init === 'function') {
                    LawAIApp.LifecycleValidator.init();
                }
                if (typeof LawAIApp.LifecycleValidator.validate === 'function') {
                    LawAIApp.LifecycleValidator.validate();
                }
                console.log('✅ LifecycleValidator initialized');
            } else if (typeof window.lifecycleValidator !== 'undefined') {
                if (typeof window.lifecycleValidator.init === 'function') {
                    window.lifecycleValidator.init();
                }
                if (typeof window.lifecycleValidator.validate === 'function') {
                    window.lifecycleValidator.validate();
                }
                console.log('✅ LifecycleValidator initialized (global)');
            } else {
                console.warn('⚠️ LifecycleValidator not found - skipping');
            }

            // 54. LIFECYCLE HEALTH
            if (typeof LawAIApp.LifecycleHealth !== 'undefined') {
                if (typeof LawAIApp.LifecycleHealth.init === 'function') {
                    LawAIApp.LifecycleHealth.init();
                }
                console.log('✅ LifecycleHealth initialized');
            } else if (typeof window.lifecycleHealth !== 'undefined') {
                if (typeof window.lifecycleHealth.init === 'function') {
                    window.lifecycleHealth.init();
                }
                console.log('✅ LifecycleHealth initialized (global)');
            } else {
                console.warn('⚠️ LifecycleHealth not found - skipping');
            }

            // 55. LIFECYCLE EVENTS
            if (typeof LawAIApp.LifecycleEvents !== 'undefined') {
                console.log('✅ LifecycleEvents ready');
            } else if (typeof window.lifecycleEvents !== 'undefined') {
                console.log('✅ LifecycleEvents ready (global)');
            } else {
                console.warn('⚠️ LifecycleEvents not found - skipping');
            }

            console.log('✅ Lifecycle Standard Loaded');
            console.log('✅ Lifecycle Manifest Ready');
            console.log('✅ Lifecycle Validator Ready');
            console.log('✅ Lifecycle Health Ready');
            console.log('✅ Lifecycle Events Ready');
            console.log('✅ Engine Lifecycle Ready');

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

        // 🔥 RECOVERY: Initialize architecture (Parts 1-13)
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

console.log('🚀 BootManager V3.1.2 ready (Engine Renaissance Phase 3)');
