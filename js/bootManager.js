// ================================================================
// bootManager.js – V4.0.0 - Runtime Excellence Era
// BootManager is now a Coordinator only.
// Delegates execution to bootPipeline.
// Integrated with Runtime Observation (Part 40) and Runtime Metrics (Part 41)
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

        // 🆕 Initialize Runtime Observation (Part 40)
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

        // 🆕 Initialize Runtime Metrics (Part 41)
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

        // 🆕 Collect BOOT_STARTED observation
        if (LawAIApp.RuntimeObservationCollector && typeof LawAIApp.RuntimeObservationCollector.collect === 'function') {
            LawAIApp.RuntimeObservationCollector.collect('BOOT_STARTED', 'BootManager', null, { version: 'V4.0.0' });
        }

        var bootStartTime = Date.now();

        // 🆕 初始化 Pipeline
        if (window.bootPipeline && typeof window.bootPipeline.init === 'function') {
            window.bootPipeline.init();
        }

        // 🆕 运行 Pipeline（Stage Handlers 在 bootPipeline 中定义）
        if (window.bootPipeline && typeof window.bootPipeline.runPipeline === 'function') {
            var success = window.bootPipeline.runPipeline(LawAIApp.BootStageHandlers || {});
            if (!success) {
                console.error('🚀 BootManager: Pipeline failed');
                return Promise.reject({ status: 'failed' });
            }
        }

        var bootEndTime = Date.now();
        var bootDuration = bootEndTime - bootStartTime;

        // 🆕 Record BOOT_TIME metric (Part 41)
        if (LawAIApp.RuntimeMetricsCollector && typeof LawAIApp.RuntimeMetricsCollector.setMetric === 'function') {
            LawAIApp.RuntimeMetricsCollector.setMetric('BOOT_TIME', bootDuration);
        }

        this._booted = true;
        this.markStage('critical');
        this.markStage('ux');
        this.markStage('intelligence');
        this.markStage('background');

        // 🆕 Collect RUNTIME_READY observation
        if (LawAIApp.RuntimeObservationCollector && typeof LawAIApp.RuntimeObservationCollector.collect === 'function') {
            LawAIApp.RuntimeObservationCollector.collect('RUNTIME_READY', 'BootManager', null, { booted: true, duration: bootDuration });
        }

        try {
            LawAIApp.EventBus?.emit?.('BootStarted');
        } catch (e) { /* 静默 */ }

        // 🆕 记录诊断信息
        if (window.bootDiagnostics && typeof window.bootDiagnostics.recordBootSnapshot === 'function') {
            window.bootDiagnostics.recordBootSnapshot();
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
    // ORIGINAL METHODS (保留但简化)
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

console.log('🚀 BootManager V4.0.0 ready (Runtime Excellence Era)');
console.log('   🏗️ Boot Architecture Refactored - Coordinator Mode');
console.log('   👁 Runtime Observation Integrated');
console.log('   📈 Runtime Metrics Integrated');
console.log('   ✅ Season 4 - Runtime Excellence Era Started');
