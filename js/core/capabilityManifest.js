/**
 * Capability Manifest
 * 
 * Maintains all engine capabilities.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CapabilityManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        engines: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._buildManifest();
        this.initialized = true;
        console.log('[CapabilityManifest] Initialized with ' + this.manifest.engines.length + ' engines.');
    },

    /**
     * Build capability manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        var engines = [];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var meta = value.__meta;
                    engines.push({
                        name: key,
                        primaryCapability: meta.primaryCapability || 'undefined',
                        secondaryCapabilities: meta.secondaryCapabilities || [],
                        inputs: meta.inputs || [],
                        outputs: meta.outputs || [],
                        events: meta.events || [],
                        capabilityOwner: meta.capabilityOwner || 'Law AI Academy',
                        capabilityVersion: meta.capabilityVersion || '0.0.0',
                        capabilityStatus: meta.capabilityStatus || 'active',
                        hasCapabilityDeclaration: !!meta.primaryCapability
                    });
                }
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.engines = engines;
    },

    /**
     * Get all engines
     * @returns {Array} Engine records
     */
    getEngines: function() {
        return this.manifest.engines.slice();
    },

    /**
     * Get engine by name
     * @param {string} name - Engine name
     * @returns {Object|null} Engine record
     */
    getEngine: function(name) {
        for (var i = 0; i < this.manifest.engines.length; i++) {
            if (this.manifest.engines[i].name === name) {
                return this.manifest.engines[i];
            }
        }
        return null;
    },

    /**
     * Get engines by primary capability
     * @param {string} capability - Primary capability
     * @returns {Array} Engines
     */
    getByPrimaryCapability: function(capability) {
        return this.manifest.engines.filter(function(e) {
            return e.primaryCapability === capability;
        });
    },

    /**
     * Get engines with undefined capabilities
     * @returns {Array} Engines with undefined capabilities
     */
    getUndefinedCapabilities: function() {
        return this.manifest.engines.filter(function(e) {
            return e.primaryCapability === 'undefined';
        });
    },

    /**
     * Get capability coverage
     * @returns {Object} Coverage data
     */
    getCoverage: function() {
        var engines = this.manifest.engines;
        var total = engines.length;
        var defined = engines.filter(function(e) { return e.hasCapabilityDeclaration; }).length;
        var undefined = total - defined;

        return {
            totalEngines: total,
            definedCapabilities: defined,
            undefinedCapabilities: undefined,
            coveragePercentage: total > 0 ? Math.round((defined / total) * 100) : 0
        };
    },

    /**
     * Get all unique primary capabilities
     * @returns {Array} Unique capabilities
     */
    getUniqueCapabilities: function() {
        var capabilities = [];
        for (var i = 0; i < this.manifest.engines.length; i++) {
            var cap = this.manifest.engines[i].primaryCapability;
            if (cap && cap !== 'undefined' && capabilities.indexOf(cap) === -1) {
                capabilities.push(cap);
            }
        }
        return capabilities;
    },

    /**
     * Get largest capability (most engines using it)
     * @returns {Object|null} Largest capability
     */
    getLargestCapability: function() {
        var capCount = {};
        for (var i = 0; i < this.manifest.engines.length; i++) {
            var cap = this.manifest.engines[i].primaryCapability;
            if (cap && cap !== 'undefined') {
                if (!capCount[cap]) capCount[cap] = 0;
                capCount[cap]++;
            }
        }

        var largest = null;
        var maxCount = 0;
        for (var key in capCount) {
            if (capCount[key] > maxCount) {
                maxCount = capCount[key];
                largest = { capability: key, count: maxCount };
            }
        }
        return largest;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        var coverage = this.getCoverage();
        var uniqueCapabilities = this.getUniqueCapabilities();
        var largest = this.getLargestCapability();

        return {
            totalEngines: coverage.totalEngines,
            definedCapabilities: coverage.definedCapabilities,
            undefinedCapabilities: coverage.undefinedCapabilities,
            coveragePercentage: coverage.coveragePercentage,
            uniqueCapabilities: uniqueCapabilities.length,
            largestCapability: largest ? largest.capability : 'None',
            largestCount: largest ? largest.count : 0
        };
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            engines: this.manifest.engines.slice()
        };
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[CapabilityManifest] Refreshed.');
    }
};

// 暴露到全局
window.capabilityManifest = LawAIApp.CapabilityManifest;

console.log('📋 CapabilityManifest ready');
