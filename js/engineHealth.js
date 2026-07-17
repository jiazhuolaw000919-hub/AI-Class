/**
 * Engine Health
 * 
 * Tracks engine loading status and generates health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineHealth = {
    // ============================================================
    // STATE (保留现有功能)
    // ============================================================
    state: {
        loaded: [],
        missing: [],
        failed: []
    },

    // ============================================================
    // HEALTH DATA (新增完整扫描)
    // ============================================================
    healthData: {
        lastCheck: null,
        totalEngines: 0,
        healthyEngines: 0,
        deprecatedEngines: 0,
        incompleteEngines: 0,
        unknownEngines: 0,
        healthScore: 100,
        engineDetails: []
    },

    initialized: false,

    // ============================================================
    // EXISTING METHODS (保留)
    // ============================================================

    markLoaded: function(name) {
        if (this.state.loaded.indexOf(name) === -1) {
            this.state.loaded.push(name);
        }
    },

    markMissing: function(name) {
        if (this.state.missing.indexOf(name) === -1) {
            this.state.missing.push(name);
        }
    },

    markFailed: function(name) {
        if (this.state.failed.indexOf(name) === -1) {
            this.state.failed.push(name);
        }
    },

    report: function() {
        return {
            loaded: this.state.loaded.slice(),
            missing: this.state.missing.slice(),
            failed: this.state.failed.slice(),
            total: this.state.loaded.length + this.state.missing.length + this.state.failed.length
        };
    },

    // ============================================================
    // NEW: INITIALIZATION
    // ============================================================

    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineHealth] Initialized.');
    },

    // ============================================================
    // NEW: FULL HEALTH SCAN
    // ============================================================

    scan: function() {
        console.log('[EngineHealth] Scanning engines...');

        // Reset health data
        this.healthData.lastCheck = Date.now();
        this.healthData.healthyEngines = 0;
        this.healthData.deprecatedEngines = 0;
        this.healthData.incompleteEngines = 0;
        this.healthData.unknownEngines = 0;
        this.healthData.engineDetails = [];

        // Scan LawAIApp for engines
        var engines = this._findEngines();
        this.healthData.totalEngines = engines.length;

        for (var i = 0; i < engines.length; i++) {
            var e = engines[i];
            var status = this._assessEngine(e);

            if (status === 'healthy') {
                this.healthData.healthyEngines++;
            } else if (status === 'deprecated') {
                this.healthData.deprecatedEngines++;
            } else if (status === 'incomplete') {
                this.healthData.incompleteEngines++;
            } else {
                this.healthData.unknownEngines++;
            }

            this.healthData.engineDetails.push({
                name: e.name,
                domain: e.meta?.domain || 'unknown',
                layer: e.meta?.layer || 'unknown',
                version: e.meta?.version || 'unknown',
                status: e.meta?.status || 'unknown',
                health: status,
                hasInit: !!e.hasInit,
                hasValidate: !!e.hasValidate,
                hasGetStatus: !!e.hasGetStatus,
                hasRegister: !!e.hasRegister,
                loaded: this.state.loaded.indexOf(e.name) !== -1,
                missing: this.state.missing.indexOf(e.name) !== -1,
                failed: this.state.failed.indexOf(e.name) !== -1
            });
        }

        // Calculate health score
        var total = this.healthData.totalEngines;
        var healthy = this.healthData.healthyEngines;
        if (total > 0) {
            this.healthData.healthScore = Math.round((healthy / total) * 100);
        } else {
            this.healthData.healthScore = 0;
        }

        this._display();
    },

    /**
     * Find all engines in LawAIApp
     * @private
     */
    _findEngines: function() {
        var engines = [];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                // Check if it looks like an engine (has __meta or has init)
                if (value && typeof value === 'object') {
                    var hasMeta = !!value.__meta;
                    var hasInit = typeof value.init === 'function';
                    var hasGetStatus = typeof value.getStatus === 'function';

                    // Skip if it's clearly not an engine
                    if (key === 'Debug' || key === 'DevTools' || key === 'BootManager') continue;
                    if (key === 'SystemComposer' || key === 'EventBus') continue;
                    if (key === 'EngineHealth' || key === 'EngineManifest' || key === 'EngineValidator') continue;

                    // If it has metadata or init, consider it an engine
                    if (hasMeta || hasInit) {
                        engines.push({
                            name: key,
                            meta: value.__meta || null,
                            hasInit: hasInit,
                            hasValidate: typeof value.validate === 'function',
                            hasGetStatus: hasGetStatus,
                            hasRegister: typeof value.register === 'function'
                        });
                    }
                }
            }
        }

        return engines;
    },

    /**
     * Assess an engine's health
     * @private
     */
    _assessEngine: function(engine) {
        var meta = engine.meta;

        // Check if engine has required methods
        var hasRequired = engine.hasInit && engine.hasGetStatus;
        if (!hasRequired) {
            return 'incomplete';
        }

        // Check status
        if (meta && meta.status === 'deprecated') {
            return 'deprecated';
        }

        if (meta && meta.status === 'archived') {
            return 'deprecated';
        }

        // Check if version exists
        if (!meta || !meta.version) {
            return 'incomplete';
        }

        // Check if it was marked as failed
        if (this.state.failed.indexOf(engine.name) !== -1) {
            return 'incomplete';
        }

        return 'healthy';
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   ENGINE HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Total Engines:     ' + h.totalEngines);
        console.log('✅ Healthy:        ' + h.healthyEngines);
        console.log('⚠️ Deprecated:     ' + h.deprecatedEngines);
        console.log('❌ Incomplete:     ' + h.incompleteEngines);
        console.log('❓ Unknown:        ' + h.unknownEngines);
        console.log('📊 Health Score:   ' + h.healthScore + '%');
        console.log('─────────────────────────────────────');

        // Show loaded/missing/failed from existing state
        var r = this.report();
        if (r.loaded.length > 0) {
            console.log('Loaded: ' + r.loaded.join(', '));
        }
        if (r.missing.length > 0) {
            console.warn('Missing: ' + r.missing.join(', '));
        }
        if (r.failed.length > 0) {
            console.warn('Failed: ' + r.failed.join(', '));
        }
        console.log('─────────────────────────────────────');

        // List incomplete engines
        var incomplete = h.engineDetails.filter(function(e) { return e.health === 'incomplete'; });
        if (incomplete.length > 0) {
            console.warn('Incomplete Engines:');
            for (var i = 0; i < incomplete.length; i++) {
                console.warn('  ' + incomplete[i].name + ' (missing methods or metadata)');
            }
        }

        // List deprecated engines
        var deprecated = h.engineDetails.filter(function(e) { return e.health === 'deprecated'; });
        if (deprecated.length > 0) {
            console.warn('Deprecated Engines:');
            for (var j = 0; j < deprecated.length; j++) {
                console.warn('  ' + deprecated[j].name + ' (status: deprecated)');
            }
        }

        if (incomplete.length === 0 && deprecated.length === 0) {
            console.log('✅ All engines are healthy.');
        }
        console.log('═══════════════════════════════════════');
    },

    // ============================================================
    // NEW: HEALTH DATA ACCESSORS
    // ============================================================

    /**
     * Get full health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        return {
            totalEngines: this.healthData.totalEngines,
            healthyEngines: this.healthData.healthyEngines,
            deprecatedEngines: this.healthData.deprecatedEngines,
            incompleteEngines: this.healthData.incompleteEngines,
            unknownEngines: this.healthData.unknownEngines,
            healthScore: this.healthData.healthScore,
            lastCheck: this.healthData.lastCheck,
            engineDetails: this.healthData.engineDetails.slice(),
            loaded: this.state.loaded.slice(),
            missing: this.state.missing.slice(),
            failed: this.state.failed.slice()
        };
    },

    /**
     * Get health score
     * @returns {number} Health score
     */
    getScore: function() {
        return this.healthData.healthScore;
    },

    /**
     * Check if all engines are healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        return this.healthData.healthScore === 100 && this.healthData.incompleteEngines === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        return {
            timestamp: this.healthData.lastCheck,
            totalEngines: this.healthData.totalEngines,
            healthScore: this.healthData.healthScore,
            healthy: this.healthData.healthyEngines,
            deprecated: this.healthData.deprecatedEngines,
            incomplete: this.healthData.incompleteEngines,
            loaded: this.state.loaded.length,
            missing: this.state.missing.length,
            failed: this.state.failed.length
        };
    },

    /**
     * Get engine details by name
     * @param {string} name - Engine name
     * @returns {Object|null} Engine details
     */
    getEngine: function(name) {
        for (var i = 0; i < this.healthData.engineDetails.length; i++) {
            if (this.healthData.engineDetails[i].name === name) {
                return this.healthData.engineDetails[i];
            }
        }
        return null;
    },

    /**
     * Get engines by health status
     * @param {string} status - healthy | deprecated | incomplete | unknown
     * @returns {Array} Engines with that status
     */
    getByHealth: function(status) {
        return this.healthData.engineDetails.filter(function(e) {
            return e.health === status;
        });
    },

    /**
     * Refresh health scan
     */
    refresh: function() {
        this.scan();
    },

    /**
     * Reset state
     */
    reset: function() {
        this.state.loaded = [];
        this.state.missing = [];
        this.state.failed = [];
        this.healthData = {
            lastCheck: null,
            totalEngines: 0,
            healthyEngines: 0,
            deprecatedEngines: 0,
            incompleteEngines: 0,
            unknownEngines: 0,
            healthScore: 100,
            engineDetails: []
        };
        console.log('[EngineHealth] Reset.');
    }
};

// 暴露到全局
window.engineHealth = LawAIApp.EngineHealth;

console.log('📋 EngineHealth ready');
