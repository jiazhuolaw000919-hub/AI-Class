/**
 * Governance Manifest
 * 
 * Maintains one governance record for every engine.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GovernanceManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        records: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._buildManifest();
        this.initialized = true;
        console.log('[GovernanceManifest] Initialized with ' + this.manifest.records.length + ' records.');
    },

    /**
     * Build governance manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        var records = [];
        var validDomains = ['Learning', 'Knowledge', 'Career', 'Goal', 'Memory', 'Practice', 'Mentor', 'Analytics', 'System', 'AI', 'Runtime', 'Infrastructure'];
        var validStatuses = ['active', 'beta', 'deprecated', 'archived'];
        var validMaturity = ['Core', 'Business', 'Support', 'Experimental', 'Deprecated'];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var meta = value.__meta;
                    
                    // Determine maturity level based on metadata
                    var maturity = this._determineMaturity(meta);
                    
                    var record = {
                        name: key,
                        identity: {
                            hasName: !!meta.name,
                            valid: meta.name === key || !meta.name
                        },
                        owner: {
                            declared: !!meta.owner || !!meta.capabilityOwner,
                            value: meta.owner || meta.capabilityOwner || 'unknown'
                        },
                        domain: {
                            declared: !!meta.domain,
                            value: meta.domain || 'unknown',
                            valid: meta.domain && validDomains.indexOf(meta.domain) !== -1
                        },
                        capability: {
                            declared: !!meta.primaryCapability,
                            value: meta.primaryCapability || 'undefined',
                            hasSecondary: !!(meta.secondaryCapabilities && meta.secondaryCapabilities.length > 0)
                        },
                        dependencies: {
                            declared: !!meta.dependencies,
                            count: meta.dependencies ? meta.dependencies.length : 0,
                            list: meta.dependencies || []
                        },
                        lifecycle: {
                            declared: !!meta.lifecycle,
                            state: meta.lifecycle ? meta.lifecycle.state : 'unknown',
                            valid: meta.lifecycle && ['created', 'registered', 'initialized', 'ready', 'running', 'sleeping', 'paused', 'reloading', 'deprecated', 'destroyed'].indexOf(meta.lifecycle.state) !== -1
                        },
                        version: {
                            declared: !!meta.version,
                            value: meta.version || '0.0.0',
                            valid: meta.version && /^\d+\.\d+\.\d+$/.test(meta.version)
                        },
                        health: {
                            status: meta.status || 'unknown',
                            valid: meta.status && validStatuses.indexOf(meta.status) !== -1
                        },
                        auditStatus: {
                            passed: false // Will be set by validator
                        },
                        maturity: {
                            level: maturity,
                            valid: validMaturity.indexOf(maturity) !== -1
                        }
                    };
                    records.push(record);
                }
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.records = records;
    },

    /**
     * Determine maturity level
     * @private
     */
    _determineMaturity: function(meta) {
        if (meta.classification === 'Core' || meta.domain === 'Runtime' || meta.domain === 'System') {
            return 'Core';
        }
        if (meta.classification === 'Business') {
            return 'Business';
        }
        if (meta.classification === 'Support') {
            return 'Support';
        }
        if (meta.status === 'deprecated' || meta.classification === 'Deprecated') {
            return 'Deprecated';
        }
        if (meta.status === 'beta' || meta.classification === 'Experimental') {
            return 'Experimental';
        }
        return 'Support';
    },

    /**
     * Get all governance records
     * @returns {Array} Records
     */
    getRecords: function() {
        return this.manifest.records.slice();
    },

    /**
     * Get record by engine name
     * @param {string} name - Engine name
     * @returns {Object|null} Record
     */
    getRecord: function(name) {
        for (var i = 0; i < this.manifest.records.length; i++) {
            if (this.manifest.records[i].name === name) {
                return this.manifest.records[i];
            }
        }
        return null;
    },

    /**
     * Get records by maturity level
     * @param {string} level - Maturity level
     * @returns {Array} Records
     */
    getByMaturity: function(level) {
        return this.manifest.records.filter(function(r) {
            return r.maturity.level === level;
        });
    },

    /**
     * Get records by domain
     * @param {string} domain - Domain name
     * @returns {Array} Records
     */
    getByDomain: function(domain) {
        return this.manifest.records.filter(function(r) {
            return r.domain.value === domain;
        });
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        var records = this.manifest.records;
        var total = records.length;
        var core = this.getByMaturity('Core').length;
        var business = this.getByMaturity('Business').length;
        var support = this.getByMaturity('Support').length;
        var experimental = this.getByMaturity('Experimental').length;
        var deprecated = this.getByMaturity('Deprecated').length;

        return {
            totalEngines: total,
            core: core,
            business: business,
            support: support,
            experimental: experimental,
            deprecated: deprecated,
            domains: this._getDomainList()
        };
    },

    /**
     * Get domain list
     * @private
     */
    _getDomainList: function() {
        var domains = {};
        var records = this.manifest.records;
        for (var i = 0; i < records.length; i++) {
            var domain = records[i].domain.value;
            if (domain !== 'unknown') {
                if (!domains[domain]) domains[domain] = 0;
                domains[domain]++;
            }
        }
        return domains;
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            records: this.manifest.records.slice()
        };
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[GovernanceManifest] Refreshed.');
    }
};

// 暴露到全局
window.governanceManifest = LawAIApp.GovernanceManifest;

console.log('📋 GovernanceManifest ready');
