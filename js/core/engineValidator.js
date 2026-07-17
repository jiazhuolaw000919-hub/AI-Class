/**
 * Engine Validator
 * 
 * Validates every engine for metadata compliance.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineValidator] Initialized.');
    },

    /**
     * Validate all engines in LawAIApp
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[EngineValidator] Validating engines...');
        this.violations = [];

        this._validateAllEngines();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate all engines in LawAIApp namespace
     */
    _validateAllEngines: function() {
        var engines = [];
        
        // Collect all potential engines from LawAIApp
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                // Check if it looks like an engine (has __meta)
                if (value && typeof value === 'object' && value.__meta) {
                    engines.push({
                        name: key,
                        engine: value
                    });
                }
            }
        }

        for (var i = 0; i < engines.length; i++) {
            this._validateEngine(engines[i].name, engines[i].engine);
        }
    },

    /**
     * Validate a single engine
     * @param {string} name - Engine name
     * @param {Object} engine - Engine object
     */
    _validateEngine: function(name, engine) {
        var meta = engine.__meta;

        // Check metadata exists
        if (!meta) {
            this.violations.push({
                engine: name,
                rule: 'Metadata Rule',
                message: 'Engine "' + name + '" has no __meta',
                severity: 'warning'
            });
            return;
        }

        // Check required fields
        var required = ['name', 'domain', 'layer', 'owner', 'version', 'status', 'dependencies', 'registry', 'description', 'initPolicy'];
        for (var i = 0; i < required.length; i++) {
            var field = required[i];
            if (!meta[field]) {
                this.violations.push({
                    engine: name,
                    rule: 'Metadata Rule',
                    message: 'Engine "' + name + '" missing metadata field: ' + field,
                    severity: 'warning'
                });
            }
        }

        // Validate domain
        var validDomains = ['App', 'Core', 'Feature', 'UI', 'AI', 'Content'];
        if (meta.domain && validDomains.indexOf(meta.domain) === -1) {
            this.violations.push({
                engine: name,
                rule: 'Domain Rule',
                message: 'Engine "' + name + '" has invalid domain: ' + meta.domain + '. Must be: ' + validDomains.join(', '),
                severity: 'warning'
            });
        }

        // Validate layer
        var validLayers = ['App', 'Core', 'Feature', 'Content', 'UI', 'AI'];
        if (meta.layer && validLayers.indexOf(meta.layer) === -1) {
            this.violations.push({
                engine: name,
                rule: 'Layer Rule',
                message: 'Engine "' + name + '" has invalid layer: ' + meta.layer + '. Must be: ' + validLayers.join(', '),
                severity: 'warning'
            });
        }

        // Validate status
        var validStatuses = ['active', 'beta', 'deprecated', 'archived'];
        if (meta.status && validStatuses.indexOf(meta.status) === -1) {
            this.violations.push({
                engine: name,
                rule: 'Status Rule',
                message: 'Engine "' + name + '" has invalid status: ' + meta.status + '. Must be: ' + validStatuses.join(', '),
                severity: 'warning'
            });
        }

        // Validate version format
        if (meta.version && !/^\d+\.\d+\.\d+$/.test(meta.version)) {
            this.violations.push({
                engine: name,
                rule: 'Version Rule',
                message: 'Engine "' + name + '" has invalid version format: ' + meta.version + '. Expected: x.y.z',
                severity: 'warning'
            });
        }

        // Validate initPolicy
        var validPolicies = ['auto', 'manual', 'lazy'];
        if (meta.initPolicy && validPolicies.indexOf(meta.initPolicy) === -1) {
            this.violations.push({
                engine: name,
                rule: 'InitPolicy Rule',
                message: 'Engine "' + name + '" has invalid initPolicy: ' + meta.initPolicy + '. Must be: ' + validPolicies.join(', '),
                severity: 'warning'
            });
        }

        // Validate dependencies is array
        if (meta.dependencies && !Array.isArray(meta.dependencies)) {
            this.violations.push({
                engine: name,
                rule: 'Dependencies Rule',
                message: 'Engine "' + name + '" dependencies must be an array',
                severity: 'warning'
            });
        }

        // Validate registry exists
        if (meta.registry && !LawAIApp[meta.registry]) {
            this.violations.push({
                engine: name,
                rule: 'Registry Rule',
                message: 'Engine "' + name + '" references unknown registry: ' + meta.registry,
                severity: 'warning'
            });
        }

        // Check description is non-empty
        if (meta.description && meta.description.length < 5) {
            this.violations.push({
                engine: name,
                rule: 'Description Rule',
                message: 'Engine "' + name + '" description is too short (min 5 characters)',
                severity: 'warning'
            });
        }
    },

    /**
     * Report validation results
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   ENGINE VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            console.warn('Violations:');
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                console.warn('  ⚠️ ' + v.engine + ': ' + v.rule + ' - ' + v.message);
            }
        } else {
            console.log('✅ All engines are compliant with Engine Standard.');
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
     * Check if all engines are compliant
     * @returns {boolean}
     */
    isCompliant: function() {
        return this.passed;
    },

    /**
     * Get summary
     * @returns {Object}
     */
    getSummary: function() {
        return {
            passed: this.passed,
            violationCount: this.violations.length,
            violations: this.violations.slice()
        };
    }
};

// 暴露到全局
window.engineValidator = LawAIApp.EngineValidator;

console.log('📋 EngineValidator ready');
