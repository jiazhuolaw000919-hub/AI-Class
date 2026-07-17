/**
 * Engine Audit Validator
 * 
 * Validates engine governance requirements.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineAuditValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineAuditValidator] Initialized.');
    },

    /**
     * Validate all engines
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[EngineAuditValidator] Validating engine governance...');
        this.violations = [];

        this._validateMissingMetadata();
        this._validateDuplicateEngine();
        this._validateUnknownDomain();
        this._validateBrokenDependency();
        this._validateMissingCapability();
        this._validateLifecycleConflict();

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
     * Validate duplicate engine names
     * @private
     */
    _validateDuplicateEngine: function() {
        var names = [];
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    names.push(key);
                }
            }
        }

        var duplicates = names.filter(function(name, index) {
            return names.indexOf(name) !== index;
        });

        for (var i = 0; i < duplicates.length; i++) {
            this.violations.push({
                type: 'duplicate_engine',
                message: 'Duplicate engine name: "' + duplicates[i] + '"',
                severity: 'warning',
                engine: duplicates[i]
            });
        }
    },

    /**
     * Validate unknown domains
     * @private
     */
    _validateUnknownDomain: function() {
        var validDomains = ['Learning', 'Knowledge', 'Career', 'Goal', 'Memory', 'Practice', 'Mentor', 'Analytics', 'System', 'AI', 'Runtime', 'Infrastructure'];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var domain = value.__meta.domain;
                    if (domain && validDomains.indexOf(domain) === -1) {
                        this.violations.push({
                            type: 'unknown_domain',
                            message: 'Engine "' + key + '" has unknown domain: "' + domain + '"',
                            severity: 'warning',
                            engine: key
                        });
                    }
                }
            }
        }
    },

    /**
     * Validate broken dependencies
     * @private
     */
    _validateBrokenDependency: function() {
        var manifest = LawAIApp.DependencyManifest || window.dependencyManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            this.violations.push({
                type: 'broken_dependency',
                message: 'DependencyManifest not available for dependency validation',
                severity: 'info'
            });
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (engines[i].hasCircular) {
                this.violations.push({
                    type: 'broken_dependency',
                    message: 'Engine "' + engines[i].name + '" has circular dependencies',
                    severity: 'warning',
                    engine: engines[i].name
                });
            }
        }
    },

    /**
     * Validate missing capabilities
     * @private
     */
    _validateMissingCapability: function() {
        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            this.violations.push({
                type: 'missing_capability',
                message: 'CapabilityManifest not available for capability validation',
                severity: 'info'
            });
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (engines[i].primaryCapability === 'undefined') {
                this.violations.push({
                    type: 'missing_capability',
                    message: 'Engine "' + engines[i].name + '" has no primary capability',
                    severity: 'warning',
                    engine: engines[i].name
                });
            }
        }
    },

    /**
     * Validate lifecycle conflicts
     * @private
     */
    _validateLifecycleConflict: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            this.violations.push({
                type: 'lifecycle_conflict',
                message: 'LifecycleManifest not available for lifecycle validation',
                severity: 'info'
            });
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (!engines[i].isValidState) {
                this.violations.push({
                    type: 'lifecycle_conflict',
                    message: 'Engine "' + engines[i].name + '" has invalid lifecycle state: "' + engines[i].state + '"',
                    severity: 'warning',
                    engine: engines[i].name
                });
            }
        }
    },

    /**
     * Report validation results
     * @private
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   ENGINE AUDIT VALIDATOR');
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
            console.log('✅ All engines pass governance audit.');
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
     * Check if audit passes
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
window.engineAuditValidator = LawAIApp.EngineAuditValidator;

console.log('📋 EngineAuditValidator ready');
