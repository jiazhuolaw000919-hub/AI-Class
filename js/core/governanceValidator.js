/**
 * Governance Validator
 * 
 * Validates engine governance requirements.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GovernanceValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[GovernanceValidator] Initialized.');
    },

    /**
     * Validate all governance requirements
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[GovernanceValidator] Validating governance...');
        this.violations = [];

        this._validateMissingMetadata();
        this._validateMissingOwner();
        this._validateMissingDomain();
        this._validateMissingCapability();
        this._validateMissingLifecycle();
        this._validateMissingVersion();
        this._validateBrokenDependencies();
        this._validateDuplicateRegistration();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate missing metadata
     * @private
     */
    _validateMissingMetadata: function() {
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && !value.__meta) {
                    this.violations.push({
                        type: 'missing_metadata',
                        message: 'Engine "' + key + '" has no __meta',
                        severity: 'warning',
                        engine: key
                    });
                }
            }
        }
    },

    /**
     * Validate missing owner
     * @private
     */
    _validateMissingOwner: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            this.violations.push({
                type: 'missing_owner',
                message: 'GovernanceManifest not available',
                severity: 'info'
            });
            return;
        }

        var records = manifest.getRecords();
        for (var i = 0; i < records.length; i++) {
            if (!records[i].owner.declared) {
                this.violations.push({
                    type: 'missing_owner',
                    message: 'Engine "' + records[i].name + '" has no owner',
                    severity: 'warning',
                    engine: records[i].name
                });
            }
        }
    },

    /**
     * Validate missing domain
     * @private
     */
    _validateMissingDomain: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        for (var i = 0; i < records.length; i++) {
            if (!records[i].domain.declared || !records[i].domain.valid) {
                this.violations.push({
                    type: 'missing_domain',
                    message: 'Engine "' + records[i].name + '" has missing or invalid domain: "' + records[i].domain.value + '"',
                    severity: 'warning',
                    engine: records[i].name
                });
            }
        }
    },

    /**
     * Validate missing capability
     * @private
     */
    _validateMissingCapability: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        for (var i = 0; i < records.length; i++) {
            if (!records[i].capability.declared || records[i].capability.value === 'undefined') {
                this.violations.push({
                    type: 'missing_capability',
                    message: 'Engine "' + records[i].name + '" has no primary capability',
                    severity: 'warning',
                    engine: records[i].name
                });
            }
        }
    },

    /**
     * Validate missing lifecycle
     * @private
     */
    _validateMissingLifecycle: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        for (var i = 0; i < records.length; i++) {
            if (!records[i].lifecycle.declared || !records[i].lifecycle.valid) {
                this.violations.push({
                    type: 'missing_lifecycle',
                    message: 'Engine "' + records[i].name + '" has missing or invalid lifecycle state: "' + records[i].lifecycle.state + '"',
                    severity: 'warning',
                    engine: records[i].name
                });
            }
        }
    },

    /**
     * Validate missing version
     * @private
     */
    _validateMissingVersion: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        for (var i = 0; i < records.length; i++) {
            if (!records[i].version.declared || !records[i].version.valid) {
                this.violations.push({
                    type: 'missing_version',
                    message: 'Engine "' + records[i].name + '" has missing or invalid version: "' + records[i].version.value + '"',
                    severity: 'warning',
                    engine: records[i].name
                });
            }
        }
    },

    /**
     * Validate broken dependencies
     * @private
     */
    _validateBrokenDependencies: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        var depManifest = LawAIApp.DependencyManifest || window.dependencyManifest;
        if (!depManifest) {
            this.violations.push({
                type: 'broken_dependencies',
                message: 'DependencyManifest not available',
                severity: 'info'
            });
            return;
        }

        var depEngines = depManifest.getEngines ? depManifest.getEngines() : [];
        var depMap = {};
        for (var i = 0; i < depEngines.length; i++) {
            depMap[depEngines[i].name] = depEngines[i];
        }

        for (var j = 0; j < records.length; j++) {
            var deps = records[j].dependencies.list || [];
            for (var k = 0; k < deps.length; k++) {
                if (!depMap[deps[k]]) {
                    this.violations.push({
                        type: 'broken_dependencies',
                        message: 'Engine "' + records[j].name + '" depends on missing engine "' + deps[k] + '"',
                        severity: 'warning',
                        engine: records[j].name
                    });
                }
            }
        }
    },

    /**
     * Validate duplicate registration
     * @private
     */
    _validateDuplicateRegistration: function() {
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return;
        }

        var records = manifest.getRecords();
        var names = {};
        for (var i = 0; i < records.length; i++) {
            var name = records[i].name;
            if (names[name]) {
                this.violations.push({
                    type: 'duplicate_registration',
                    message: 'Duplicate engine registration: "' + name + '"',
                    severity: 'warning',
                    engine: name
                });
            }
            names[name] = true;
        }
    },

    /**
     * Report validation results
     * @private
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   GOVERNANCE VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            var grouped = {};
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                if (!grouped[v.type]) grouped[v.type] = [];
                grouped[v.type].push(v);
            }

            for (var type in grouped) {
                console.warn('  ' + type.toUpperCase() + ':');
                for (var j = 0; j < grouped[type].length; j++) {
                    console.warn('    ⚠️ ' + grouped[type][j].message);
                }
            }
        } else {
            console.log('✅ All engines pass governance requirements.');
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
     * Check if governance passes
     * @returns {boolean}
     */
    isPassing: function() {
        return this.passed;
    },

    /**
     * Get summary
     * @returns {Object}
     */
    getSummary: function() {
        var types = {};
        for (var i = 0; i < this.violations.length; i++) {
            var v = this.violations[i];
            if (!types[v.type]) types[v.type] = 0;
            types[v.type]++;
        }
        return {
            passed: this.passed,
            violationCount: this.violations.length,
            violationsByType: types
        };
    }
};

// 暴露到全局
window.governanceValidator = LawAIApp.GovernanceValidator;

console.log('📋 GovernanceValidator ready');
