// ================================================================
// bootManager.js – V4.4.3 - Runtime Excellence Era
// BootManager is now a Coordinator only.
// Delegates execution to bootPipeline.
// Integrated with:
//   - Runtime Observation (Part 40)
//   - Runtime Metrics (Part 41)
//   - Runtime Tracing (Part 42)
//   - Performance Framework (Part 43.1 - 43.12)
//   - Event Intelligence (Part 44.1 - 44.3)
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
    // 🔥 COORDINATOR METHODS
    // ============================================================

    start: function() {
        if (this._booted) {
            return Promise.resolve({ status: 'already_booted' });
        }

        console.log('🚀 BootManager (Coordinator): Starting boot sequence...');

        // ============================================================
        // 🔥 PART 40: RUNTIME OBSERVATION INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeObservationManifest && typeof LawAIApp.RuntimeObservationManifest.init === 'function') {
            LawAIApp.RuntimeObservationManifest.init();
        }
        if (LawAIApp.RuntimeObservationCollector && typeof LawAIApp.RuntimeObservationCollector.init === 'function') {
            LawAIApp.RuntimeObservationCollector.init();
        }
        if (LawAIApp.RuntimeObservationValidator && typeof LawAIApp.RuntimeObservationValidator.init === 'function') {
            LawAIApp.RuntimeObservationValidator.init();
        }
        if (LawAIApp.RuntimeObservationHealth && typeof LawAIApp.RuntimeObservationHealth.init === 'function') {
            LawAIApp.RuntimeObservationHealth.init();
        }

        // ============================================================
        // 🔥 PART 41: RUNTIME METRICS INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeMetricsManifest && typeof LawAIApp.RuntimeMetricsManifest.init === 'function') {
            LawAIApp.RuntimeMetricsManifest.init();
        }
        if (LawAIApp.RuntimeMetricsCollector && typeof LawAIApp.RuntimeMetricsCollector.init === 'function') {
            LawAIApp.RuntimeMetricsCollector.init();
        }
        if (LawAIApp.RuntimeMetricsValidator && typeof LawAIApp.RuntimeMetricsValidator.init === 'function') {
            LawAIApp.RuntimeMetricsValidator.init();
        }
        if (LawAIApp.RuntimeMetricsHealth && typeof LawAIApp.RuntimeMetricsHealth.init === 'function') {
            LawAIApp.RuntimeMetricsHealth.init();
        }

        // ============================================================
        // 🔥 PART 42: RUNTIME TRACING INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeTraceManifest && typeof LawAIApp.RuntimeTraceManifest.init === 'function') {
            LawAIApp.RuntimeTraceManifest.init();
        }
        if (LawAIApp.RuntimeTraceCollector && typeof LawAIApp.RuntimeTraceCollector.init === 'function') {
            LawAIApp.RuntimeTraceCollector.init();
        }
        if (LawAIApp.RuntimeTraceValidator && typeof LawAIApp.RuntimeTraceValidator.init === 'function') {
            LawAIApp.RuntimeTraceValidator.init();
        }
        if (LawAIApp.RuntimeTraceHealth && typeof LawAIApp.RuntimeTraceHealth.init === 'function') {
            LawAIApp.RuntimeTraceHealth.init();
        }

        // ============================================================
        // 🔥 PART 44.2: EVENT REGISTRY INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventRegistry && typeof LawAIApp.RuntimeEventRegistry.init === 'function') {
            LawAIApp.RuntimeEventRegistry.init();
        }

        // ============================================================
        // 🔥 PART 44.3: EVENT COLLECTOR INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventCollector && typeof LawAIApp.RuntimeEventCollector.init === 'function') {
            LawAIApp.RuntimeEventCollector.init();
        }
        
        // ============================================================
        // 🔥 PART 44.4: EVENT STORE INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventStore && typeof LawAIApp.RuntimeEventStore.init === 'function') {
            LawAIApp.RuntimeEventStore.init();
        }

        // ============================================================
        // 🔥 PART 44.5: EVENT ANALYZER INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventAnalyzer && typeof LawAIApp.RuntimeEventAnalyzer.init === 'function') {
            LawAIApp.RuntimeEventAnalyzer.init();
        }

        // ============================================================
        // 🔥 PART 44.6: EVENT INTELLIGENCE INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventIntelligence && typeof LawAIApp.RuntimeEventIntelligence.init === 'function') {
            LawAIApp.RuntimeEventIntelligence.init();
        }

        // ============================================================
        // 🔥 PART 44.7: EVENT TIMELINE INITIALIZATION
        // ============================================================
        if (LawAIApp.RuntimeEventTimeline && typeof LawAIApp.RuntimeEventTimeline.init === 'function') {
            LawAIApp.RuntimeEventTimeline.init();
        }

        // ============================================================
        // 🔥 PART 44.8: EVENT API INITIALIZATION  ← 🆕 加在这里！
        // ============================================================
        if (LawAIApp.Events && typeof LawAIApp.Events.init === 'function') {
            LawAIApp.Events.init();
        }

        // ============================================================
        // 🔥 PART 45.1: STATE SYNC MANIFEST INITIALIZATION
        // ============================================================
        if (LawAIApp.StateSyncManifest && typeof LawAIApp.StateSyncManifest.init === 'function') {
            LawAIApp.StateSyncManifest.init();
        }

        // ============================================================
        // 🔥 PART 45.2: STATE SCHEMA & REGISTRY INITIALIZATION
        // ============================================================
        if (LawAIApp.StateSchema && typeof LawAIApp.StateSchema.init === 'function') {
            LawAIApp.StateSchema.init();
        }
        if (LawAIApp.StateRegistry && typeof LawAIApp.StateRegistry.init === 'function') {
            LawAIApp.StateRegistry.init();
        }

        // ============================================================
        // 🔥 PART 45.3: STATE SYNC ENGINE INITIALIZATION
        // ============================================================
        if (LawAIApp.StateSyncEngine && typeof LawAIApp.StateSyncEngine.init === 'function') {
            LawAIApp.StateSyncEngine.init();
        }

        // ============================================================
        // 🔥 PART 45.4: STATE CONFLICT RESOLVER INITIALIZATION
        // ============================================================
        if (LawAIApp.StateConflictResolver && typeof LawAIApp.StateConflictResolver.init === 'function') {
            LawAIApp.StateConflictResolver.init();
        }

        // ============================================================
        // 🔥 PART 45.5: STATE PERSISTENCE INITIALIZATION
        // ============================================================
        if (LawAIApp.StatePersistence && typeof LawAIApp.StatePersistence.init === 'function') {
            LawAIApp.StatePersistence.init();
        }

        // ============================================================
        // 🔥 PART 45.6: STATE INTELLIGENCE INITIALIZATION  ← 🆕
        // ============================================================
        if (LawAIApp.StateIntelligence && typeof LawAIApp.StateIntelligence.init === 'function') {
            LawAIApp.StateIntelligence.init();
        }

        // ============================================================
        // 🔥 PART 45.7: RUNTIME STATE INTEGRATION INITIALIZATION  ← 🆕
        // ============================================================
        if (LawAIApp.RuntimeStateIntegration && typeof LawAIApp.RuntimeStateIntegration.init === 'function') {
            LawAIApp.RuntimeStateIntegration.init();
        }

        // ============================================================
        // 🔥 PART 40: COLLECT BOOT_STARTED OBSERVATION
        // ============================================================
        if (LawAIApp.RuntimeObservationCollector && typeof LawAIApp.RuntimeObservationCollector.collect === 'function') {
            LawAIApp.RuntimeObservationCollector.collect('BOOT_STARTED', 'BootManager', null, { version: 'V4.4.3' });
        }

        // ============================================================
        // 🔥 PART 44.3: EMIT BOOT_START EVENT
        // ============================================================
        if (LawAIApp.RuntimeEventCollector && typeof LawAIApp.RuntimeEventCollector.emitBootStart === 'function') {
            LawAIApp.RuntimeEventCollector.emitBootStart({ version: 'V4.4.3' });
        }

        // ============================================================
        // 🔥 PART 43.3 - 43.9: PERFORMANCE FRAMEWORK INITIALIZATION
        // ============================================================

        // 43.3 - Manifest & Registry
        if (LawAIApp.RuntimePerformanceManifest && typeof LawAIApp.RuntimePerformanceManifest.init === 'function') {
            LawAIApp.RuntimePerformanceManifest.init();
        }
        if (LawAIApp.RuntimeMetricRegistry && typeof LawAIApp.RuntimeMetricRegistry.init === 'function') {
            LawAIApp.RuntimeMetricRegistry.init();
        }

        // 43.4 - Collector
        if (LawAIApp.RuntimePerformanceCollector && typeof LawAIApp.RuntimePerformanceCollector.init === 'function') {
            LawAIApp.RuntimePerformanceCollector.init();
        }

        // 43.5 - Store
        if (LawAIApp.RuntimePerformanceStore && typeof LawAIApp.RuntimePerformanceStore.init === 'function') {
            LawAIApp.RuntimePerformanceStore.init();
        }

        // 43.6 - Analyzer
        if (LawAIApp.RuntimePerformanceAnalyzer && typeof LawAIApp.RuntimePerformanceAnalyzer.init === 'function') {
            LawAIApp.RuntimePerformanceAnalyzer.init();
        }

        // 43.7 - Health
        if (LawAIApp.RuntimePerformanceHealth && typeof LawAIApp.RuntimePerformanceHealth.init === 'function') {
            LawAIApp.RuntimePerformanceHealth.init();
        }

        // 43.8 - Report
        if (LawAIApp.RuntimePerformanceReport && typeof LawAIApp.RuntimePerformanceReport.init === 'function') {
            LawAIApp.RuntimePerformanceReport.init();
        }

        // 43.9 - API (LawAIApp.Performance)
        if (LawAIApp.Performance && typeof LawAIApp.Performance.init === 'function') {
            LawAIApp.Performance.init();
        }

        // 43.12 - Dashboard
        if (LawAIApp.RuntimePerformanceDashboard && typeof LawAIApp.RuntimePerformanceDashboard.init === 'function') {
            LawAIApp.RuntimePerformanceDashboard.init();
        }

        // ============================================================
        // 🔥 PART 43.10: START BOOT PERFORMANCE TRACKING
        // ============================================================
        if (LawAIApp.Performance && typeof LawAIApp.Performance.startBoot === 'function') {
            LawAIApp.Performance.startBoot({ version: 'V4.4.3' });
        }

        var bootStartTime = Date.now();

        // ============================================================
        // 🔥 INITIALIZE AND RUN PIPELINE
        // ============================================================
        if (window.bootPipeline && typeof window.bootPipeline.init === 'function') {
            window.bootPipeline.init();
        }

        if (window.bootPipeline && typeof window.bootPipeline.runPipeline === 'function') {
            var success = window.bootPipeline.runPipeline(LawAIApp.BootStageHandlers || {});
            if (!success) {
                console.error('🚀 BootManager: Pipeline failed');
                // Still finish boot tracking even on failure
                if (LawAIApp.Performance && typeof LawAIApp.Performance.finishBoot === 'function') {
                    LawAIApp.Performance.finishBoot({ success: false, error: 'Pipeline failed' });
                }
                return Promise.reject({ status: 'failed' });
            }
        }

        var bootEndTime = Date.now();
        var bootDuration = bootEndTime - bootStartTime;

        // ============================================================
        // 🔥 PART 41: RECORD BOOT_TIME METRIC
        // ============================================================
        if (LawAIApp.RuntimeMetricsCollector && typeof LawAIApp.RuntimeMetricsCollector.setMetric === 'function') {
            LawAIApp.RuntimeMetricsCollector.setMetric('BOOT_TIME', bootDuration);
        }

        this._booted = true;
        this.markStage('critical');
        this.markStage('ux');
        this.markStage('intelligence');
        this.markStage('background');

        // ============================================================
        // 🔥 PART 43.10: FINISH BOOT PERFORMANCE TRACKING
        // ============================================================
        if (LawAIApp.Performance && typeof LawAIApp.Performance.finishBoot === 'function') {
            LawAIApp.Performance.finishBoot({
                duration: bootDuration,
                success: true,
                stages: Object.keys(this._stages)
            });
        }

        // ============================================================
        // 🔥 PART 44.3: EMIT BOOT_COMPLETE EVENT  ← ✅ 正确位置！
        // ============================================================
        if (LawAIApp.RuntimeEventCollector && typeof LawAIApp.RuntimeEventCollector.emitBootComplete === 'function') {
            LawAIApp.RuntimeEventCollector.emitBootComplete({
                duration: bootDuration,
                stages: Object.keys(this._stages),
                success: true
            });
        }

        // ============================================================
        // 🔥 PART 40: COLLECT RUNTIME_READY OBSERVATION
        // ============================================================
        if (LawAIApp.RuntimeObservationCollector && typeof LawAIApp.RuntimeObservationCollector.collect === 'function') {
            LawAIApp.RuntimeObservationCollector.collect('RUNTIME_READY', 'BootManager', null, {
                booted: true,
                duration: bootDuration
            });
        }

        try {
            LawAIApp.EventBus?.emit?.('BootStarted');
        } catch (e) { /* 静默 */ }

        // ============================================================
        // 🔥 RECORD DIAGNOSTICS
        // ============================================================
        if (window.bootDiagnostics && typeof window.bootDiagnostics.recordBootSnapshot === 'function') {
            window.bootDiagnostics.recordBootSnapshot();
        }

        // ============================================================
        // 🔥 PART 43.10: GENERATE INITIAL PERFORMANCE REPORT
        // ============================================================
        if (LawAIApp.Performance && typeof LawAIApp.Performance.report === 'function') {
            try {
                var initialReport = LawAIApp.Performance.report();
                if (initialReport && initialReport.health) {
                    console.log('📊 Initial Performance Score:', initialReport.health.score + '%');
                    console.log('📊 Performance Status:', initialReport.health.label);
                }
            } catch (e) { /* 静默 */ }
        }

        console.log('🚀 BootManager: Startup complete in', bootDuration + 'ms');
        return Promise.resolve({ status: 'started' });
    },

    // ============================================================
    // 🆕 COORDINATOR LIFECYCLE METHODS
    // ============================================================

    stop: function() {
        console.log('🚀 BootManager: Stopping...');
        this._booted = false;
        return Promise.resolve({ status: 'stopped' });
    },

    restart: function() {
        console.log('🚀 BootManager: Restarting...');
        this._booted = false;
        return this.start();
    },

    // ============================================================
    // ORIGINAL METHODS
    // ============================================================

    markStage: function(stage) {
        if (this._stages[stage] !== undefined) {
            this._stages[stage] = true;
        }
    },

    getStatus: function() {
        var pipelineStatus = { status: 'unknown', completed: 0, total: 0 };
        if (window.bootDiagnostics && typeof window.bootDiagnostics.getBootStatus === 'function') {
            pipelineStatus = window.bootDiagnostics.getBootStatus();
        }

        return {
            booted: this._booted,
            stages: this._stages,
            allComplete: Object.values(this._stages).every(function(v) { return v; }),
            pipeline: pipelineStatus
        };
    },

    getStages: function() {
        return this._stages;
    },

    isBooted: function() {
        return this._booted;
    }
};

console.log('🚀 BootManager V4.5.7 ready (Runtime Excellence Era)');
console.log('   🏗️ Boot Architecture Refactored - Coordinator Mode');
console.log('   👁 Runtime Observation Integrated');
console.log('   📈 Runtime Metrics Integrated');
console.log('   🛰 Runtime Tracing Integrated');
console.log('   ⚡ Runtime Performance Framework Integrated');
console.log('   🧠 Runtime Event Intelligence Integrated');
console.log('   🔄 State Synchronization Framework Integrated');
console.log('   ✅ Season 4 - Runtime Excellence Era Continued');
