/**
 * Engine Event Validator
 * 
 * Validates engine events.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineEventValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineEventValidator] Initialized.');
    },

    /**
     * Validate all events
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[EngineEventValidator] Validating engine events...');
        this.violations = [];

        this._validateDuplicateEvent();
        this._validateIllegalEventName();
        this._validateReservedEvent();
        this._validateUnknownEvent();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate duplicate events
     * @private
     */
    _validateDuplicateEvent: function() {
        var manifest = LawAIApp.EngineEventManifest || window.engineEventManifest;
        if (!manifest || typeof manifest.getOfficialEvents !== 'function') {
            this.violations.push({
                type: 'manifest_unavailable',
                message: 'EngineEventManifest not available',
                severity: 'info'
            });
            return;
        }

        var official = manifest.getOfficialEvents();
        var duplicates = [];
        var seen = {};

        for (var i = 0; i < official.length; i++) {
            var event = official[i];
            if (seen[event]) {
                if (duplicates.indexOf(event) === -1) {
                    duplicates.push(event);
                }
            }
            seen[event] = true;
        }

        for (var j = 0; j < duplicates.length; j++) {
            this.violations.push({
                type: 'duplicate_event',
                message: 'Duplicate official event: "' + duplicates[j] + '"',
                severity: 'warning'
            });
        }
    },

    /**
     * Validate illegal event names
     * @private
     */
    _validateIllegalEventName: function() {
        var manifest = LawAIApp.EngineEventManifest || window.engineEventManifest;
        if (!manifest || typeof manifest.getOfficialEvents !== 'function') {
            return;
        }

        var official = manifest.getOfficialEvents();

        // Check for events with illegal characters
        var illegalRegex = /[^A-Z0-9_]/;
        for (var i = 0; i < official.length; i++) {
            var event = official[i];
            if (illegalRegex.test(event)) {
                this.violations.push({
                    type: 'illegal_event_name',
                    message: 'Event "' + event + '" contains illegal characters',
                    severity: 'warning'
                });
            }
        }
    },

    /**
     * Validate reserved event prefix
     * @private
     */
    _validateReservedEvent: function() {
        var manifest = LawAIApp.EngineEventManifest || window.engineEventManifest;
        if (!manifest || typeof manifest.getCustomEvents !== 'function') {
            return;
        }

        var custom = manifest.getCustomEvents();

        for (var i = 0; i < custom.length; i++) {
            var event = custom[i];
            if (event && event.startsWith('ENGINE_')) {
                this.violations.push({
                    type: 'reserved_event',
                    message: 'Custom event "' + event + '" uses reserved prefix "ENGINE_"',
                    severity: 'warning',
                    event: event
                });
            }
        }
    },

    /**
     * Validate unknown events
     * @private
     */
    _validateUnknownEvent: function() {
        // Check engines for events not declared in __meta
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object') {
                    // Check if engine emits events via event bus but doesn't declare them
                    if (value.__meta && !value.__meta.events) {
                        // Check if it has event-related methods
                        if (typeof value.emit === 'function' || typeof value.publish === 'function') {
                            this.violations.push({
                                type: 'unknown_event',
                                message: 'Engine "' + key + '" emits events but has no __meta.events declaration',
                                severity: 'warning',
                                engine: key
                            });
                        }
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
        console.log('   ENGINE EVENT VALIDATOR');
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
            console.log('✅ All engine events are valid.');
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
     * Check if events are valid
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
window.engineEventValidator = LawAIApp.EngineEventValidator;

console.log('📋 EngineEventValidator ready');
