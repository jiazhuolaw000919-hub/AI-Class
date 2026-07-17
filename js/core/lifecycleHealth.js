/**
 * Lifecycle Health
 * 
 * Generates lifecycle health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LifecycleHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[LifecycleHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan lifecycle health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[LifecycleHealth] Scanning lifecycle...');

        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            console.warn('[LifecycleHealth] LifecycleManifest not available.');
            return null;
        }

        var engines = manifest.getEngines();
        var stateSummary = manifest.getStateSummary();
        var healthSummary = manifest.getHealthSummary();
        var running = manifest.getRunning();
        var sleeping = manifest.getSleeping();
        var paused = manifest.getPaused();
        var deprecated = manifest.getDeprecated();
        var destroyed = manifest.getDestroyed();

        var totalEngines = engines.length;
        var runningCount = running.length;
        var sleepingCount = sleeping.length;
        var pausedCount = paused.length;
        var deprecatedCount = deprecated.length;
        var destroyedCount = destroyed.length;
        var invalidCount = healthSummary.invalid;

        var healthyEngines = engines.filter(function(e) {
            return e.isValidState && e.state !== 'deprecated' && e.state !== 'destroyed' && e.state !== 'unknown';
        }).length;

        var lifecycleScore = 0;
        if (totalEngines > 0) {
            var runningRatio = runningCount / totalEngines;
            var invalidPenalty = Math.min(invalidCount * 10, 50);
            lifecycleScore = Math.round((healthyEngines / totalEngines) * 100 - invalidPenalty);
            lifecycleScore = Math.max(0, Math.min(100, lifecycleScore));
        }

        var status = 'EXCELLENT';
        if (lifecycleScore >= 80 && invalidCount === 0) {
            status = 'EXCELLENT';
        } else if (lifecycleScore >= 60) {
            status = 'GOOD';
        } else if (lifecycleScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        // Build state distribution
        var stateDistribution = [];
        var states = ['created', 'registered', 'initialized', 'ready', 'running', 'sleeping', 'paused', 'reloading', 'deprecated', 'destroyed'];
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            var count = stateSummary[state] || 0;
            if (count > 0) {
                stateDistribution.push({ state: state, count: count });
            }
        }

        this.healthData = {
            timestamp: Date.now(),
            lifecycleScore: lifecycleScore,
            lifecycleStatus: status,
            totalEngines: totalEngines,
            runningCount: runningCount,
            sleepingCount: sleepingCount,
            pausedCount: pausedCount,
            deprecatedCount: deprecatedCount,
            destroyedCount: destroyedCount,
            invalidCount: invalidCount,
            healthyEngines: healthyEngines,
            stateDistribution: stateDistribution,
            engineDetails: engines.slice()
        };

        this._display();
        return this.healthData;
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   LIFECYCLE HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Lifecycle Score: ' + h.lifecycleScore + '% (' + h.lifecycleStatus + ')');
        console.log('Total Engines: ' + h.totalEngines);
        console.log('✅ Running: ' + h.runningCount);
        console.log('💤 Sleeping: ' + h.sleepingCount);
        console.log('⏸️ Paused: ' + h.pausedCount);
        console.log('⚠️ Deprecated: ' + h.deprecatedCount);
        console.log('💀 Destroyed: ' + h.destroyedCount);
        console.log('❌ Invalid: ' + h.invalidCount);
        console.log('─────────────────────────────────────');
        console.log('State Distribution:');
        for (var i = 0; i < h.stateDistribution.length; i++) {
            var s = h.stateDistribution[i];
            console.log('  ' + s.state + ': ' + s.count);
        }
        console.log('─────────────────────────────────────');

        if (h.invalidCount > 0) {
            console.warn('Invalid engine states detected.');
        }

        if (h.deprecatedCount > 0) {
            console.warn('Deprecated engines found:');
            for (var j = 0; j < h.engineDetails.length; j++) {
                if (h.engineDetails[j].state === 'deprecated') {
                    console.warn('  ⚠️ ' + h.engineDetails[j].name);
                }
            }
        }

        if (h.invalidCount === 0 && h.deprecatedCount === 0) {
            console.log('✅ All lifecycle states are healthy.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        if (!this.healthData) this.scan();
        return this.healthData;
    },

    /**
     * Get lifecycle score
     * @returns {number} Lifecycle score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.lifecycleScore;
    },

    /**
     * Get lifecycle status
     * @returns {string} Lifecycle status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.lifecycleStatus;
    },

    /**
     * Check if lifecycle is healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        if (!this.healthData) this.scan();
        return this.healthData.lifecycleScore >= 80 && this.healthData.invalidCount === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.lifecycleScore,
            status: this.healthData.lifecycleStatus,
            totalEngines: this.healthData.totalEngines,
            running: this.healthData.runningCount,
            sleeping: this.healthData.sleepingCount,
            paused: this.healthData.pausedCount,
            deprecated: this.healthData.deprecatedCount,
            destroyed: this.healthData.destroyedCount,
            invalid: this.healthData.invalidCount
        };
    }
};

// 暴露到全局
window.lifecycleHealth = LawAIApp.LifecycleHealth;

console.log('📋 LifecycleHealth ready');
