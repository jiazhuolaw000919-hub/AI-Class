/**
 * Domain Validator
 * 
 * Validates engine domain assignments.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DomainValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[DomainValidator] Initialized.');
    },

    /**
     * Validate domain assignments
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[DomainValidator] Validating domains...');
        this.violations = [];

        this._validateSingleDomain();
        this._validateNoDuplicatedOwnership();
        this._validateUnknownDomains();
        this._validateUnregisteredEngines();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate each engine has exactly one domain
     * @private
     */
    _validateSingleDomain: function() {
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var domain = value.__meta.domain;
                    
                    // Check if domain is an array (multiple domains)
                    if (Array.isArray(domain)) {
                        this.violations.push({
                            engine: key,
                            rule: 'Single Domain Rule',
                            message: 'Engine "' + key + '" has multiple domains: ' + domain.join(', '),
                            severity: 'warning'
                        });
                    }
                    
                    // Check if domain is missing
                    if (!domain) {
                        this.violations.push({
                            engine: key,
                            rule: 'Single Domain Rule',
                            message: 'Engine "' + key + '" has no domain defined',
                            severity: 'warning'
                        });
                    }
                }
            }
        }
    },

    /**
     * Validate no duplicated ownership
     * @private
     */
    _validateNoDuplicatedOwnership: function() {
        var ownerMap = {};
        
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var domain = value.__meta.domain;
                    if (domain && typeof domain === 'string') {
                        if (!ownerMap[domain]) {
                            ownerMap[domain] = [];
                        }
                        ownerMap[domain].push(key);
                    }
                }
            }
        }

        // Check each domain has at least one engine
        var officialDomains = [
            'Learning', 'Knowledge', 'Career', 'Goal', 'Memory',
            'Practice', 'Mentor', 'Analytics', 'System', 'AI',
            'Runtime', 'Infrastructure'
        ];

        for (var i = 0; i < officialDomains.length; i++) {
            var domain = officialDomains[i];
            if (!ownerMap[domain] || ownerMap[domain].length === 0) {
                this.violations.push({
                    engine: domain,
                    rule: 'Domain Ownership Rule',
                    message: 'Domain "' + domain + '" has no registered engines',
                    severity: 'warning'
                });
            }
        }
    },

    /**
     * Validate unknown domains
     * @private
     */
    _validateUnknownDomains: function() {
        var officialDomains = [
            'Learning', 'Knowledge', 'Career', 'Goal', 'Memory',
            'Practice', 'Mentor', 'Analytics', 'System', 'AI',
            'Runtime', 'Infrastructure'
        ];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var domain = value.__meta.domain;
                    if (domain && typeof domain === 'string' && officialDomains.indexOf(domain) === -1) {
                        this.violations.push({
                            engine: key,
                            rule: 'Unknown Domain Rule',
                            message: 'Engine "' + key + '" has unknown domain: "' + domain + '"',
                            severity: 'warning'
                        });
                    }
                }
            }
        }
    },

    /**
     * Validate unregistered engines
     * @private
     */
    _validateUnregisteredEngines: function() {
        // Check engines that have __meta but might not be in domain manifest
        var manifest = LawAIApp.DomainManifest || window.domainManifest;
        if (!manifest || typeof manifest.getDomains !== 'function') {
            this.violations.push({
                engine: 'DomainManifest',
                rule: 'Registry Rule',
                message: 'DomainManifest not available for validation',
                severity: 'info'
            });
            return;
        }

        var domains = manifest.getDomains();
        var registeredEngines = [];
        
        for (var key in domains) {
            var domain = domains[key];
            if (domain && domain.engines) {
                for (var i = 0; i < domain.engines.length; i++) {
                    registeredEngines.push(domain.engines[i]);
                }
            }
        }

        // Find engines with __meta but not in manifest
        for (var key2 in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key2)) {
                var value = LawAIApp[key2];
                if (value && typeof value === 'object' && value.__meta) {
                    if (registeredEngines.indexOf(key2) === -1) {
                        this.violations.push({
                            engine: key2,
                            rule: 'Registration Rule',
                            message: 'Engine "' + key2 + '" not registered in DomainManifest',
                            severity: 'warning'
                        });
                    }
                }
            }
        }
    },

    /**
     * Report validation results
     * @private
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   DOMAIN VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            var grouped = {};
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                if (!grouped[v.rule]) grouped[v.rule] = [];
                grouped[v.rule].push(v);
            }

            for (var rule in grouped) {
                console.warn('  ' + rule + ':');
                for (var j = 0; j < grouped[rule].length; j++) {
                    console.warn('    ⚠️ ' + grouped[rule][j].message);
                }
            }
        } else {
            console.log('✅ All domain assignments are correct.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get violation count
     * @returns {number}
     */
    getViolationCount: function() {
        return this.violations.length;
    },

    /**
     * Get violations
     * @returns {Array}
     */
    getViolations: function() {
        return this.violations.slice();
    },

    /**
     * Check if domains are valid
     * @returns {boolean}
     */
    isValid: function() {
        return this.passed;
    },

    /**
     * Get summary
     * @returns {Object}
     */
    getSummary: function() {
        var rules = {};
        for (var i = 0; i < this.violations.length; i++) {
            var v = this.violations[i];
            if (!rules[v.rule]) rules[v.rule] = 0;
            rules[v.rule]++;
        }
        return {
            passed: this.passed,
            violationCount: this.violations.length,
            violationsByRule: rules
        };
    }
};

// 暴露到全局
window.domainValidator = LawAIApp.DomainValidator;

console.log('📋 DomainValidator ready');
