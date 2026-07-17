/**
 * Lifecycle Validator
 * 
 * Validates engine lifecycle states and transitions.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LifecycleValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[LifecycleValidator] Initialized.');
    },

    /**
     * Validate all lifecycle states
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[LifecycleValidator] Validating lifecycle...');
        this.violations = [];

        this._validateIllegalStateTransition();
        this._validateUnknownState();
        this._validateMissingInitialization();
        this._validateDuplicateReady();
        this._validateMissingDestroy();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate illegal state transitions
     * @private
     */
    _validateIllegalStateTransition: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            this.violations.push({
                type: 'manifest_unavailable',
                message: 'LifecycleManifest not available',
                severity: 'info'
            });
            return;
        }

        var validStates = ['created', 'registered', 'initialized', 'ready', 'running', 'sleeping', 'paused', 'reloading', 'deprecated', 'destroyed'];
        var engines = manifest.getEngines();

        for (var i = 0; i < engines.length; i++) {
            var engine = engines[i];
            if (engine.state !== 'unknown' && validStates.indexOf(engine.state) === -1) {
                this.violations.push({
                    type: 'illegal_state_transition',
                    message: 'Engine "' + engine.name + '" has illegal state: "' + engine.state + '"',
                    severity: 'warning',
                    engine: engine.name
                });
            }

            // Check if engine is in a state that doesn't make sense
            if (engine.state === 'running' && !engine.hasLifecycleDeclaration) {
                this.violations.push({
                    type: 'illegal_state_transition',
                    message: 'Engine "' + engine.name + '" is running but has no lifecycle declaration',
                    severity: 'warning',
                    engine: engine.name
                });
            }
        }
    },

    /**
     * Validate unknown states
     * @private
     */
    _validateUnknownState: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        var unknown = engines.filter(function(e) {
            return e.state === 'unknown' || !e.isValidState;
        });

        for (var i = 0; i < unknown.length; i++) {
            this.violations.push({
                type: 'unknown_state',
                message: 'Engine "' + unknown[i].name + '" has unknown state: "' + unknown[i].state + '"',
                severity: 'warning',
                engine: unknown[i].name
            });
        }
    },

    /**
     * Validate missing initialization
     * @private
     */
    _validateMissingInitialization: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            var engine = engines[i];
            if (engine.state === 'registered' && !engine.hasLifecycleDeclaration) {
                this.violations.push({
                    type: 'missing_initialization',
                    message: 'Engine "' + engine.name + '" is registered but not initialized',
                    severity: 'warning',
                    engine: engine.name
                });
            }
        }
    },

    /**
     * Validate duplicate ready
     * @private
     */
    _validateDuplicateReady: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        var readyCount = engines.filter(function(e) {
            return e.state === 'ready' || e.state === 'running';
        });

        if (readyCount.length === 0) {
            this.violations.push({
                type: 'duplicate_ready',
                message: 'No engines are in ready or running state',
                severity: 'info'
            });
        }
    },

    /**
     * Validate missing destroy
     * @private
     */
    _validateMissingDestroy: function() {
        var manifest = LawAIApp.LifecycleManifest || window.lifecycleManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        var deprecated = engines.filter(function(e) {
            return e.state === 'deprecated';
        });

        for (var i = 0; i < deprecated.length; i++) {
            if (deprecated[i].timestamps && !deprecated[i].timestamps.destroyedAt) {
                this.violations.push({
                    type: 'missing_destroy',
                    message: 'Engine "' + deprecated[i].name + '" is deprecated but not destroyed',
                    severity: 'warning',
                    engine: deprecated[i].name
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
        console.log('   LIFECYCLE VALIDATOR');
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
            console.log('✅ All lifecycle states are valid.');
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
     * Check if lifecycle is valid
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
window.lifecycleValidator = LawAIApp.LifecycleValidator;

console.log('📋 LifecycleValidator ready');
