/**
 * Capability Health
 * 
 * Generates capability health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CapabilityHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[CapabilityHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan capability health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[CapabilityHealth] Scanning capabilities...');

        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            console.warn('[CapabilityHealth] CapabilityManifest not available.');
            return null;
        }

        var engines = manifest.getEngines();
        var coverage = manifest.getCoverage();
        var uniqueCapabilities = manifest.getUniqueCapabilities();
        var largest = manifest.getLargestCapability();
        var summary = manifest.getSummary();

        var undefinedCount = 0;
        var duplicateCount = 0;
        var definedCount = 0;

        var capMap = {};
        for (var i = 0; i < engines.length; i++) {
            var cap = engines[i].primaryCapability;
            if (cap && cap !== 'undefined') {
                if (!capMap[cap]) capMap[cap] = 0;
                capMap[cap]++;
                definedCount++;
            } else {
                undefinedCount++;
            }
        }

        for (var key in capMap) {
            if (capMap[key] > 1) {
                duplicateCount += capMap[key] - 1;
            }
        }

        var capabilityScore = 0;
        var total = engines.length;
        if (total > 0) {
            var definedRatio = definedCount / total;
            var duplicatePenalty = Math.min(duplicateCount * 5, 30);
            capabilityScore = Math.round((definedRatio * 100) - duplicatePenalty);
            capabilityScore = Math.max(0, Math.min(100, capabilityScore));
        }

        var status = 'EXCELLENT';
        if (capabilityScore >= 80 && duplicateCount === 0) {
            status = 'EXCELLENT';
        } else if (capabilityScore >= 60) {
            status = 'GOOD';
        } else if (capabilityScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        this.healthData = {
            timestamp: Date.now(),
            capabilityScore: capabilityScore,
            capabilityStatus: status,
            totalEngines: total,
            definedCapabilities: definedCount,
            undefinedCapabilities: undefinedCount,
            duplicateCapabilities: duplicateCount,
            uniqueCapabilities: uniqueCapabilities.length,
            largestCapability: largest ? largest.capability : 'None',
            largestCount: largest ? largest.count : 0,
            coveragePercentage: coverage.coveragePercentage,
            engineDetails: engines.slice(),
            summary: summary
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
        console.log('   CAPABILITY HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Capability Score: ' + h.capabilityScore + '% (' + h.capabilityStatus + ')');
        console.log('Total Engines: ' + h.totalEngines);
        console.log('✅ Defined: ' + h.definedCapabilities);
        console.log('❌ Undefined: ' + h.undefinedCapabilities);
        console.log('🔄 Duplicate: ' + h.duplicateCapabilities);
        console.log('📊 Coverage: ' + h.coveragePercentage + '%');
        console.log('─────────────────────────────────────');
        console.log('Unique Capabilities: ' + h.uniqueCapabilities);
        console.log('Largest Capability: ' + h.largestCapability + ' (' + h.largestCount + ' engines)');
        console.log('─────────────────────────────────────');

        if (h.undefinedCapabilities > 0) {
            console.warn('Engines with undefined capabilities:');
            for (var i = 0; i < h.engineDetails.length; i++) {
                if (!h.engineDetails[i].hasCapabilityDeclaration) {
                    console.warn('  ❌ ' + h.engineDetails[i].name);
                }
            }
        }

        if (h.duplicateCapabilities > 0) {
            console.warn('Duplicate capabilities detected: ' + h.duplicateCapabilities + ' duplicates');
        }

        if (h.undefinedCapabilities === 0 && h.duplicateCapabilities === 0) {
            console.log('✅ All capabilities are defined and unique.');
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
     * Get capability score
     * @returns {number} Capability score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.capabilityScore;
    },

    /**
     * Get capability status
     * @returns {string} Capability status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.capabilityStatus;
    },

    /**
     * Check if capabilities are healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        if (!this.healthData) this.scan();
        return this.healthData.capabilityScore >= 80 && this.healthData.duplicateCapabilities === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.capabilityScore,
            status: this.healthData.capabilityStatus,
            totalEngines: this.healthData.totalEngines,
            definedCapabilities: this.healthData.definedCapabilities,
            undefinedCapabilities: this.healthData.undefinedCapabilities,
            duplicateCapabilities: this.healthData.duplicateCapabilities,
            coveragePercentage: this.healthData.coveragePercentage
        };
    }
};

// 暴露到全局
window.capabilityHealth = LawAIApp.CapabilityHealth;

console.log('📋 CapabilityHealth ready');
