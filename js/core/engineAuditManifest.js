/**
 * Engine Audit Manifest
 * 
 * Maintains audit records for every engine.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineAuditManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        auditRecords: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._buildManifest();
        this.initialized = true;
        console.log('[EngineAuditManifest] Initialized with ' + this.manifest.auditRecords.length + ' records.');
    },

    /**
     * Build audit manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        var records = [];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var meta = value.__meta;
                    var record = {
                        name: key,
                        identity: {
                            hasName: !!meta.name,
                            validNamespace: key === meta.name || !meta.name
                        },
                        domain: {
                            declared: !!meta.domain,
                            valid: this._isValidDomain(meta.domain)
                        },
                        dependency: {
                            declared: !!meta.dependencies,
                            count: meta.dependencies ? meta.dependencies.length : 0
                        },
                        capability: {
                            declared: !!meta.primaryCapability,
                            hasSecondary: !!(meta.secondaryCapabilities && meta.secondaryCapabilities.length > 0)
                        },
                        lifecycle: {
                            declared: !!meta.lifecycle,
                            state: meta.lifecycle ? meta.lifecycle.state : 'unknown'
                        },
                        version: {
                            declared: !!meta.version,
                            valid: this._isValidVersion(meta.version)
                        },
                        health: {
                            status: meta.status || 'unknown'
                        },
                        owner: {
                            declared: !!meta.owner || !!meta.capabilityOwner
                        },
                        status: {
                            declared: !!meta.status,
                            valid: this._isValidStatus(meta.status)
                        }
                    };
                    records.push(record);
                }
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.auditRecords = records;
    },

    /**
     * Check if domain is valid
     * @private
     */
    _isValidDomain: function(domain) {
        var validDomains = ['Learning', 'Knowledge', 'Career', 'Goal', 'Memory', 'Practice', 'Mentor', 'Analytics', 'System', 'AI', 'Runtime', 'Infrastructure'];
        return domain && validDomains.indexOf(domain) !== -1;
    },

    /**
     * Check if version is valid
     * @private
     */
    _isValidVersion: function(version) {
        return version && /^\d+\.\d+\.\d+$/.test(version);
    },

    /**
     * Check if status is valid
     * @private
     */
    _isValidStatus: function(status) {
        var validStatuses = ['active', 'beta', 'deprecated', 'archived'];
        return status && validStatuses.indexOf(status) !== -1;
    },

    /**
     * Get all audit records
     * @returns {Array} Audit records
     */
    getRecords: function() {
        return this.manifest.auditRecords.slice();
    },

    /**
     * Get record by engine name
     * @param {string} name - Engine name
     * @returns {Object|null} Audit record
     */
    getRecord: function(name) {
        for (var i = 0; i < this.manifest.auditRecords.length; i++) {
            if (this.manifest.auditRecords[i].name === name) {
                return this.manifest.auditRecords[i];
            }
        }
        return null;
    },

    /**
     * Get engines with issues
     * @param {number} threshold - Minimum issues to include
     * @returns {Array} Engines with issues
     */
    getEnginesWithIssues: function(threshold) {
        var issues = [];
        for (var i = 0; i < this.manifest.auditRecords.length; i++) {
            var r = this.manifest.auditRecords[i];
            var issueCount = this._countIssues(r);
            if (issueCount >= (threshold || 1)) {
                issues.push({
                    name: r.name,
                    issueCount: issueCount,
                    record: r
                });
            }
        }
        return issues;
    },

    /**
     * Count issues in a record
     * @private
     */
    _countIssues: function(record) {
        var count = 0;
        if (!record.identity.hasName) count++;
        if (!record.domain.declared) count++;
        if (!record.capability.declared) count++;
        if (!record.version.declared) count++;
        if (!record.owner.declared) count++;
        if (!record.status.declared) count++;
        return count;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        var records = this.manifest.auditRecords;
        var total = records.length;
        var passing = 0;

        for (var i = 0; i < records.length; i++) {
            if (this._countIssues(records[i]) === 0) {
                passing++;
            }
        }

        var issues = this.getEnginesWithIssues(1);

        return {
            totalEngines: total,
            passingEngines: passing,
            failingEngines: total - passing,
            issuesFound: issues.length,
            issueDetails: issues
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
            auditRecords: this.manifest.auditRecords.slice()
        };
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[EngineAuditManifest] Refreshed.');
    }
};

// 暴露到全局
window.engineAuditManifest = LawAIApp.EngineAuditManifest;

console.log('📋 EngineAuditManifest ready');
