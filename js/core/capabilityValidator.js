/**
 * Capability Validator
 * 
 * Validates engine capabilities.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CapabilityValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[CapabilityValidator] Initialized.');
    },

    /**
     * Validate all capabilities
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[CapabilityValidator] Validating capabilities...');
        this.violations = [];

        this._validateMissingCapability();
        this._validateDuplicateCapability();
        this._validateUnknownCapability();
        this._validateMissingOwner();
        this._validateMissingVersion();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate missing capabilities
     * @private
     */
    _validateMissingCapability: function() {
        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            this.violations.push({
                type: 'manifest_unavailable',
                message: 'CapabilityManifest not available',
                severity: 'info'
            });
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (!engines[i].hasCapabilityDeclaration) {
                this.violations.push({
                    type: 'missing_capability',
                    message: 'Engine "' + engines[i].name + '" has no capability declaration',
                    severity: 'warning',
                    engine: engines[i].name
                });
            }
        }
    },

    /**
     * Validate duplicate capabilities
     * @private
     */
    _validateDuplicateCapability: function() {
        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        var capMap = {};

        for (var i = 0; i < engines.length; i++) {
            var cap = engines[i].primaryCapability;
            if (cap && cap !== 'undefined') {
                if (!capMap[cap]) capMap[cap] = [];
                capMap[cap].push(engines[i].name);
            }
        }

        for (var key in capMap) {
            if (capMap[key].length > 1) {
                this.violations.push({
                    type: 'duplicate_capability',
                    message: 'Capability "' + key + '" used by multiple engines: ' + capMap[key].join(', '),
                    severity: 'warning',
                    capability: key,
                    engines: capMap[key]
                });
            }
        }
    },

    /**
     * Validate unknown capabilities
     * @private
     */
    _validateUnknownCapability: function() {
        var validCapabilities = [
            'lesson_management', 'course_management', 'progress_tracking',
            'knowledge_retrieval', 'mentor_guidance', 'memory_management',
            'goal_tracking', 'skill_assessment', 'data_filtering',
            'data_retrieval', 'event_emission', 'state_management',
            'validation', 'undefined'
        ];

        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            var cap = engines[i].primaryCapability;
            if (cap && cap !== 'undefined' && validCapabilities.indexOf(cap) === -1) {
                this.violations.push({
                    type: 'unknown_capability',
                    message: 'Engine "' + engines[i].name + '" has unknown capability "' + cap + '"',
                    severity: 'warning',
                    engine: engines[i].name,
                    capability: cap
                });
            }
        }
    },

    /**
     * Validate missing owner
     * @private
     */
    _validateMissingOwner: function() {
        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (engines[i].hasCapabilityDeclaration) {
                if (!engines[i].capabilityOwner || engines[i].capabilityOwner === '') {
                    this.violations.push({
                        type: 'missing_owner',
                        message: 'Engine "' + engines[i].name + '" has no capability owner',
                        severity: 'warning',
                        engine: engines[i].name
                    });
                }
            }
        }
    },

    /**
     * Validate missing version
     * @private
     */
    _validateMissingVersion: function() {
        var manifest = LawAIApp.CapabilityManifest || window.capabilityManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            if (engines[i].hasCapabilityDeclaration) {
                var version = engines[i].capabilityVersion;
                if (!version || version === '0.0.0' || !/^\d+\.\d+\.\d+$/.test(version)) {
                    this.violations.push({
                        type: 'missing_version',
                        message: 'Engine "' + engines[i].name + '" has invalid capability version: "' + version + '"',
                        severity: 'warning',
                        engine: engines[i].name
                    });
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
        console.log('   CAPABILITY VALIDATOR');
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
            console.log('✅ All capabilities are valid.');
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
     * Check if capabilities are valid
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
window.capabilityValidator = LawAIApp.CapabilityValidator;

console.log('📋 CapabilityValidator ready');
