/**
 * Domain Manifest
 * 
 * Maintains all domains and their registered engines.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DomainManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        domains: {}
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._buildManifest();
        this.initialized = true;
        console.log('[DomainManifest] Initialized with ' + Object.keys(this.manifest.domains).length + ' domains.');
    },

    /**
     * Build domain manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        // Define official domains
        var domainNames = [
            'Learning',
            'Knowledge',
            'Career',
            'Goal',
            'Memory',
            'Practice',
            'Mentor',
            'Analytics',
            'System',
            'AI',
            'Runtime',
            'Infrastructure'
        ];

        // Initialize domains
        var domains = {};
        for (var i = 0; i < domainNames.length; i++) {
            domains[domainNames[i]] = {
                name: domainNames[i],
                owner: 'Law AI Academy',
                version: '1.0.0',
                status: 'active',
                engines: [],
                engineCount: 0
            };
        }

        // Scan LawAIApp for engines
        var engines = this._findEngines();

        // Assign engines to domains
        for (var j = 0; j < engines.length; j++) {
            var engine = engines[j];
            var domain = engine.domain || 'unknown';
            
            // If domain exists in manifest, add engine
            if (domains[domain]) {
                domains[domain].engines.push(engine.name);
                domains[domain].engineCount++;
            } else if (domain === 'unknown') {
                // Create unknown domain
                if (!domains['unknown']) {
                    domains['unknown'] = {
                        name: 'unknown',
                        owner: 'Unassigned',
                        version: '0.0.0',
                        status: 'unassigned',
                        engines: [],
                        engineCount: 0
                    };
                }
                domains['unknown'].engines.push(engine.name);
                domains['unknown'].engineCount++;
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.domains = domains;
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
                if (value && typeof value === 'object' && value.__meta) {
                    engines.push({
                        name: key,
                        domain: value.__meta.domain || 'unknown',
                        version: value.__meta.version || '0.0.0',
                        status: value.__meta.status || 'active'
                    });
                }
            }
        }

        return engines;
    },

    /**
     * Get all domains
     * @returns {Object} Domains map
     */
    getDomains: function() {
        return this.manifest.domains;
    },

    /**
     * Get domain by name
     * @param {string} name - Domain name
     * @returns {Object|null} Domain data
     */
    getDomain: function(name) {
        return this.manifest.domains[name] || null;
    },

    /**
     * Get engines in a domain
     * @param {string} name - Domain name
     * @returns {Array} Engines in domain
     */
    getDomainEngines: function(name) {
        var domain = this.getDomain(name);
        return domain ? domain.engines.slice() : [];
    },

    /**
     * Get domain count
     * @returns {number} Number of domains
     */
    getDomainCount: function() {
        return Object.keys(this.manifest.domains).length;
    },

    /**
     * Get populated domains
     * @returns {Array} Domains with engines
     */
    getPopulatedDomains: function() {
        var result = [];
        for (var key in this.manifest.domains) {
            if (this.manifest.domains[key].engineCount > 0) {
                result.push(this.manifest.domains[key]);
            }
        }
        return result;
    },

    /**
     * Get empty domains
     * @returns {Array} Domains without engines
     */
    getEmptyDomains: function() {
        var result = [];
        for (var key in this.manifest.domains) {
            if (this.manifest.domains[key].engineCount === 0 && key !== 'unknown') {
                result.push(this.manifest.domains[key]);
            }
        }
        return result;
    },

    /**
     * Get largest domain
     * @returns {Object|null} Largest domain
     */
    getLargestDomain: function() {
        var largest = null;
        var maxCount = 0;
        for (var key in this.manifest.domains) {
            var domain = this.manifest.domains[key];
            if (domain.engineCount > maxCount && key !== 'unknown') {
                maxCount = domain.engineCount;
                largest = domain;
            }
        }
        return largest;
    },

    /**
     * Get smallest domain (excluding unknown)
     * @returns {Object|null} Smallest domain
     */
    getSmallestDomain: function() {
        var smallest = null;
        var minCount = Infinity;
        for (var key in this.manifest.domains) {
            var domain = this.manifest.domains[key];
            if (domain.engineCount > 0 && domain.engineCount < minCount && key !== 'unknown') {
                minCount = domain.engineCount;
                smallest = domain;
            }
        }
        return smallest;
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            domains: this.manifest.domains
        };
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        var domains = this.manifest.domains;
        var populated = this.getPopulatedDomains();
        var empty = this.getEmptyDomains();
        var largest = this.getLargestDomain();
        var smallest = this.getSmallestDomain();

        return {
            totalDomains: Object.keys(domains).length,
            populatedDomains: populated.length,
            emptyDomains: empty.length,
            totalEngines: this._getTotalEngines(),
            largestDomain: largest ? largest.name : 'None',
            largestCount: largest ? largest.engineCount : 0,
            smallestDomain: smallest ? smallest.name : 'None',
            smallestCount: smallest ? smallest.engineCount : 0,
            emptyDomainNames: empty.map(function(d) { return d.name; })
        };
    },

    /**
     * Get total engines across all domains
     * @private
     */
    _getTotalEngines: function() {
        var total = 0;
        for (var key in this.manifest.domains) {
            total += this.manifest.domains[key].engineCount;
        }
        return total;
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[DomainManifest] Refreshed.');
    }
};

// 暴露到全局
window.domainManifest = LawAIApp.DomainManifest;

console.log('📋 DomainManifest ready');
