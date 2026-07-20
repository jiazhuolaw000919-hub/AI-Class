/**
 * Engine Event Health
 * 
 * Generates engine event health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineEventHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineEventHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan event health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[EngineEventHealth] Scanning event health...');

        var manifest = LawAIApp.EngineEventManifest || window.engineEventManifest;
        if (!manifest || typeof manifest.getOfficialEvents !== 'function') {
            console.warn('[EngineEventHealth] EngineEventManifest not available.');
            return null;
        }

        var validator = LawAIApp.EngineEventValidator || window.engineEventValidator;
        var validatorSummary = validator ? validator.getSummary() : null;

        var official = manifest.getOfficialEvents();
        var custom = manifest.getCustomEvents();
        var allEvents = manifest.getAllEvents();

        var officialCount = official.length;
        var customCount = custom.length;
        var totalCount = officialCount + customCount;

        // Check coverage: how many events are actually used
        var usedEvents = [];
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var events = value.__meta.events || [];
                    for (var i = 0; i < events.length; i++) {
                        if (usedEvents.indexOf(events[i]) === -1) {
                            usedEvents.push(events[i]);
                        }
                    }
                }
            }
        }

        var usedOfficial = usedEvents.filter(function(e) {
            return official.indexOf(e) !== -1;
        });

        var coveragePercentage = officialCount > 0 ? Math.round((usedOfficial.length / officialCount) * 100) : 0;

        var healthScore = 0;
        if (officialCount > 0) {
            var usedRatio = usedOfficial.length / officialCount;
            var customPenalty = Math.min(customCount * 5, 30);
            healthScore = Math.round((usedRatio * 100) - customPenalty);
            healthScore = Math.max(0, Math.min(100, healthScore));
        }

        var status = 'EXCELLENT';
        if (healthScore >= 80 && customCount === 0) {
            status = 'EXCELLENT';
        } else if (healthScore >= 60) {
            status = 'GOOD';
        } else if (healthScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        this.healthData = {
            timestamp: Date.now(),
            healthScore: healthScore,
            healthStatus: status,
            officialCount: officialCount,
            customCount: customCount,
            totalCount: totalCount,
            usedOfficialCount: usedOfficial.length,
            coveragePercentage: coveragePercentage,
            officialEvents: official.slice(),
            customEvents: custom.slice(),
            usedEvents: usedEvents,
            violations: validatorSummary ? validatorSummary.violationCount : 0
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
        console.log('   ENGINE EVENT HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Event Health: ' + h.healthScore + '% (' + h.healthStatus + ')');
        console.log('Official Events: ' + h.officialCount);
        console.log('Custom Events: ' + h.customCount);
        console.log('Total Events: ' + h.totalCount);
        console.log('Used Official Events: ' + h.usedOfficialCount);
        console.log('Coverage: ' + h.coveragePercentage + '%');
        console.log('Violations: ' + h.violations);
        console.log('─────────────────────────────────────');

        if (h.customCount > 0) {
            console.warn('Custom Events:');
            for (var i = 0; i < h.customEvents.length; i++) {
                console.warn('  ⚠️ ' + h.customEvents[i]);
            }
        }

        if (h.coveragePercentage < 80) {
            console.warn('Low coverage: ' + h.coveragePercentage + '% of official events are used.');
        }

        if (h.customCount === 0 && h.coveragePercentage >= 80) {
            console.log('✅ All engine events are healthy.');
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
     * Get event health score
     * @returns {number} Event health score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.healthScore;
    },

    /**
     * Get event health status
     * @returns {string} Event health status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.healthStatus;
    },

    /**
     * Check if events are healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        if (!this.healthData) this.scan();
        return this.healthData.healthScore >= 80 && this.healthData.customCount === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.healthScore,
            status: this.healthData.healthStatus,
            officialCount: this.healthData.officialCount,
            customCount: this.healthData.customCount,
            coverage: this.healthData.coveragePercentage
        };
    }
};

// 暴露到全局
window.engineEventHealth = LawAIApp.EngineEventHealth;

console.log('📋 EngineEventHealth ready');
