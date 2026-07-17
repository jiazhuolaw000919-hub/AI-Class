/**
 * Dependency Validator
 * 
 * Validates engine dependencies.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DependencyValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[DependencyValidator] Initialized.');
    },

    /**
     * Validate all dependencies
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[DependencyValidator] Validating dependencies...');
        this.violations = [];

        this._detectCircular();
        this._detectMissingEngines();
        this._detectUnknownEngines();
        this._detectDuplicateDependencies();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Detect circular dependencies
     * @private
     */
    _detectCircular: function() {
        var manifest = LawAIApp.DependencyManifest || window.dependencyManifest;
        if (!manifest || typeof manifest.getCircular !== 'function') {
            this.violations.push({
                type: 'manifest_unavailable',
                message: 'DependencyManifest not available for circular detection',
                severity: 'info'
            });
            return;
        }

        var circular = manifest.getCircular();
        for (var i = 0; i < circular.length; i++) {
            this.violations.push({
                type: 'circular_dependency',
                message: 'Circular dependency detected in engine "' + circular[i].name + '"',
                severity: 'warning',
                engine: circular[i].name
            });
        }
    },

    /**
     * Detect missing engines
     * @private
     */
    _detectMissingEngines: function() {
        var manifest = LawAIApp.DependencyManifest || window.dependencyManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            return;
        }

        var engines = manifest.getEngines();
        for (var i = 0; i < engines.length; i++) {
            var engine = engines[i];
            for (var j = 0; j < engine.dependsOn.length; j++) {
                var dep = engine.dependsOn[j];
                // Check if dependency exists
                var found = false;
                for (var k = 0; k < engines.length; k++) {
                    if (engines[k].name === dep) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.violations.push({
                        type: 'missing_engine',
                        message: 'Engine "' + engine.name + '" depends on missing engine "' + dep + '"',
                        severity: 'warning',
                        engine: engine.name,
                        dependency: dep
                    });
                }
            }
        }
    },

    /**
     * Detect unknown engines
     * @private
     */
    _detectUnknownEngines: function() {
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var deps = value.__meta.dependencies || [];
                    for (var i = 0; i < deps.length; i++) {
                        var dep = deps[i];
                        // Check if dependency is a valid engine
                        var found = false;
                        for (var key2 in LawAIApp) {
                            if (key2 === dep) {
                                found = true;
                                break;
                            }
                        }
                        if (!found && dep !== 'core' && dep !== 'runtime') {
                            this.violations.push({
                                type: 'unknown_engine',
                                message: 'Engine "' + key + '" depends on unknown engine "' + dep + '"',
                                severity: 'warning',
                                engine: key,
                                dependency: dep
                            });
                        }
                    }
                }
            }
        }
    },

    /**
     * Detect duplicate dependencies
     * @private
     */
    _detectDuplicateDependencies: function() {
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var deps = value.__meta.dependencies || [];
                    var unique = [];
                    var duplicates = [];
                    for (var i = 0; i < deps.length; i++) {
                        if (unique.indexOf(deps[i]) === -1) {
                            unique.push(deps[i]);
                        } else {
                            duplicates.push(deps[i]);
                        }
                    }
                    if (duplicates.length > 0) {
                        this.violations.push({
                            type: 'duplicate_dependency',
                            message: 'Engine "' + key + '" has duplicate dependencies: ' + duplicates.join(', '),
                            severity: 'warning',
                            engine: key,
                            duplicates: duplicates
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
        console.log('   DEPENDENCY VALIDATOR');
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
            console.log('✅ All dependencies are valid.');
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
     * Check if dependencies are valid
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
window.dependencyValidator = LawAIApp.DependencyValidator;

console.log('📋 DependencyValidator ready');
