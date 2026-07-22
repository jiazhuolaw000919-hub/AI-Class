// ================================================================
// bootManager.js – V4.0.0 - Runtime Excellence Era
// BootManager is now a Coordinator only.
// Delegates execution to bootPipeline.
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

        this._booted = true;
        this.markStage('critical');
        this.markStage('ux');
        this.markStage('intelligence');
        this.markStage('background');

        try {
            LawAIApp.EventBus?.emit?.('BootStarted');
        } catch (e) { /* 静默 */ }

        // 🆕 记录诊断信息
        if (window.bootDiagnostics && typeof window.bootDiagnostics.recordBootSnapshot === 'function') {
            window.bootDiagnostics.recordBootSnapshot();
        }

        console.log('🚀 BootManager: Startup complete');
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
console.log('   ✅ Season 4 - Runtime Excellence Era Started');
