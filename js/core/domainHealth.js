/**
 * Domain Health
 * 
 * Generates domain health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DomainHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[DomainHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan domain health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[DomainHealth] Scanning domains...');

        var manifest = LawAIApp.DomainManifest || window.domainManifest;
        if (!manifest || typeof manifest.getDomains !== 'function') {
            console.warn('[DomainHealth] DomainManifest not available.');
            return null;
        }

        var domains = manifest.getDomains();
        var populated = manifest.getPopulatedDomains();
        var empty = manifest.getEmptyDomains();
        var largest = manifest.getLargestDomain();
        var smallest = manifest.getSmallestDomain();
        var totalEngines = manifest.getSummary ? manifest.getSummary().totalEngines : 0;

        var domainList = [];
        for (var key in domains) {
            var domain = domains[key];
            domainList.push({
                name: domain.name,
                engineCount: domain.engineCount,
                status: domain.status || 'active',
                engines: domain.engines.slice()
            });
        }

        // Sort by engine count (descending)
        domainList.sort(function(a, b) {
            return b.engineCount - a.engineCount;
        });

        var domainScore = 0;
        var totalDomains = Object.keys(domains).length;
        var populatedCount = populated.length;
        if (totalDomains > 0) {
            domainScore = Math.round((populatedCount / totalDomains) * 100);
        }

        var status = 'EXCELLENT';
        if (domainScore >= 80) {
            status = 'EXCELLENT';
        } else if (domainScore >= 60) {
            status = 'GOOD';
        } else if (domainScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        this.healthData = {
            timestamp: Date.now(),
            domainScore: domainScore,
            domainStatus: status,
            totalDomains: totalDomains,
            populatedDomains: populatedCount,
            emptyDomains: empty.length,
            totalEngines: totalEngines,
            largestDomain: largest ? largest.name : 'None',
            largestCount: largest ? largest.engineCount : 0,
            smallestDomain: smallest ? smallest.name : 'None',
            smallestCount: smallest ? smallest.engineCount : 0,
            domainList: domainList,
            emptyDomainNames: empty.map(function(d) { return d.name; })
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
        console.log('   DOMAIN HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Domain Score: ' + h.domainScore + '% (' + h.domainStatus + ')');
        console.log('Total Domains: ' + h.totalDomains);
        console.log('Populated Domains: ' + h.populatedDomains);
        console.log('Empty Domains: ' + h.emptyDomains);
        console.log('Total Engines: ' + h.totalEngines);
        console.log('─────────────────────────────────────');
        console.log('Largest Domain: ' + h.largestDomain + ' (' + h.largestCount + ' engines)');
        console.log('Smallest Domain: ' + h.smallestDomain + ' (' + h.smallestCount + ' engines)');
        console.log('─────────────────────────────────────');

        if (h.emptyDomains > 0) {
            console.warn('Empty Domains: ' + h.emptyDomainNames.join(', '));
        }

        // Show domain breakdown
        console.log('Domain Breakdown:');
        for (var i = 0; i < h.domainList.length; i++) {
            var d = h.domainList[i];
            var icon = d.engineCount > 0 ? '✅' : '⬜';
            console.log('  ' + icon + ' ' + d.name + ': ' + d.engineCount + ' engines');
        }

        console.log('─────────────────────────────────────');
        if (h.domainScore >= 80) {
            console.log('✅ Domain architecture is healthy.');
        } else if (h.domainScore >= 60) {
            console.warn('⚠️ Domain architecture is degraded.');
        } else {
            console.warn('❌ Domain architecture needs attention.');
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
     * Get domain score
     * @returns {number} Domain score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.domainScore;
    },

    /**
     * Get domain status
     * @returns {string} Domain status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.domainStatus;
    },

    /**
     * Check if domain architecture is healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        if (!this.healthData) this.scan();
        return this.healthData.domainScore >= 80;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.domainScore,
            status: this.healthData.domainStatus,
            totalDomains: this.healthData.totalDomains,
            populatedDomains: this.healthData.populatedDomains,
            emptyDomains: this.healthData.emptyDomains,
            totalEngines: this.healthData.totalEngines
        };
    }
};

// 暴露到全局
window.domainHealth = LawAIApp.DomainHealth;

console.log('📋 DomainHealth ready');
