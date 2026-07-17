/**
 * Runtime Validator
 * 
 * Validates runtime modules against the Runtime Constitution.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[RuntimeValidator] Initialized.');
    },

    /**
     * Validate all runtime modules
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[RuntimeValidator] Validating runtime...');
        this.violations = [];

        this._validateRuntimeModules();
        this._validateNoBusinessLogic();
        this._validateNoStorage();
        this._validateNoRouting();
        this._validateNoUI();
        this._validateNoUserData();
        this._validateRuntimeConstitution();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate runtime modules exist and are in correct namespace
     * @private
     */
    _validateRuntimeModules: function() {
        var requiredModules = [
            'RuntimeKernel',
            'RuntimeStatus',
            'RuntimeRegistry',
            'RuntimeLifecycle',
            'RuntimeHealth',
            'RuntimeInspector',
            'BootManager'
        ];

        for (var i = 0; i < requiredModules.length; i++) {
            var name = requiredModules[i];
            var module = LawAIApp[name];
            if (!module) {
                this.violations.push({
                    module: name,
                    rule: 'Runtime Module Rule',
                    message: 'Missing required runtime module: ' + name,
                    severity: 'warning'
                });
            }
        }
    },

    /**
     * Validate runtime contains no business logic
     * @private
     */
    _validateNoBusinessLogic: function() {
        var forbiddenMethods = ['processData', 'calculate', 'compute', 'transform', 'validateBusiness', 'applyRules'];
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) continue;

            for (var key in module) {
                if (typeof module[key] === 'function') {
                    var lower = key.toLowerCase();
                    for (var j = 0; j < forbiddenMethods.length; j++) {
                        if (lower.indexOf(forbiddenMethods[j]) !== -1) {
                            this.violations.push({
                                module: name,
                                rule: 'No Business Logic Rule',
                                message: 'Runtime module "' + name + '" has business logic method: ' + key,
                                severity: 'warning'
                            });
                            break;
                        }
                    }
                }
            }
        }
    },

    /**
     * Validate runtime contains no storage
     * @private
     */
    _validateNoStorage: function() {
        var forbiddenMethods = ['save', 'load', 'store', 'getItem', 'setItem', 'removeItem', 'clear', 'localStorage', 'sessionStorage'];
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) continue;

            // Check for method names
            for (var key in module) {
                if (typeof module[key] === 'function') {
                    var lower = key.toLowerCase();
                    for (var j = 0; j < forbiddenMethods.length; j++) {
                        if (lower.indexOf(forbiddenMethods[j]) !== -1) {
                            this.violations.push({
                                module: name,
                                rule: 'No Storage Rule',
                                message: 'Runtime module "' + name + '" has storage method: ' + key,
                                severity: 'warning'
                            });
                            break;
                        }
                    }
                }
            }

            // Check for storage property access
            var str = JSON.stringify(module);
            if (str.indexOf('localStorage') !== -1 || str.indexOf('sessionStorage') !== -1) {
                this.violations.push({
                    module: name,
                    rule: 'No Storage Rule',
                    message: 'Runtime module "' + name + '" references localStorage or sessionStorage',
                    severity: 'warning'
                });
            }
        }
    },

    /**
     * Validate runtime contains no routing
     * @private
     */
    _validateNoRouting: function() {
        var forbiddenMethods = ['navigate', 'router', 'route', 'pushState', 'replaceState', 'go', 'back', 'forward', 'location'];
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) continue;

            for (var key in module) {
                if (typeof module[key] === 'function') {
                    var lower = key.toLowerCase();
                    for (var j = 0; j < forbiddenMethods.length; j++) {
                        if (lower.indexOf(forbiddenMethods[j]) !== -1) {
                            this.violations.push({
                                module: name,
                                rule: 'No Routing Rule',
                                message: 'Runtime module "' + name + '" has routing method: ' + key,
                                severity: 'warning'
                            });
                            break;
                        }
                    }
                }
            }
        }
    },

    /**
     * Validate runtime contains no UI
     * @private
     */
    _validateNoUI: function() {
        var forbiddenMethods = ['render', 'draw', 'createElement', 'appendChild', 'innerHTML', 'querySelector', 'getElementById', 'style', 'classList', 'addEventListener'];
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) continue;

            var str = JSON.stringify(module);
            for (var j = 0; j < forbiddenMethods.length; j++) {
                if (str.indexOf(forbiddenMethods[j]) !== -1) {
                    this.violations.push({
                        module: name,
                        rule: 'No UI Rule',
                        message: 'Runtime module "' + name + '" references UI API: ' + forbiddenMethods[j],
                        severity: 'warning'
                    });
                    break;
                }
            }
        }
    },

    /**
     * Validate runtime contains no user data
     * @private
     */
    _validateNoUserData: function() {
        var forbiddenMethods = ['user', 'profile', 'preferences', 'settings', 'userData'];
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) continue;

            var str = JSON.stringify(module);
            for (var j = 0; j < forbiddenMethods.length; j++) {
                if (str.indexOf(forbiddenMethods[j]) !== -1) {
                    this.violations.push({
                        module: name,
                        rule: 'No User Data Rule',
                        message: 'Runtime module "' + name + '" references user data: ' + forbiddenMethods[j],
                        severity: 'warning'
                    });
                    break;
                }
            }
        }
    },

    /**
     * Validate runtime follows constitution
     * @private
     */
    _validateRuntimeConstitution: function() {
        var modules = ['RuntimeKernel', 'RuntimeStatus', 'RuntimeRegistry', 'RuntimeLifecycle', 'RuntimeHealth', 'RuntimeInspector', 'BootManager'];

        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = LawAIApp[name];
            if (!module) {
                this.violations.push({
                    module: name,
                    rule: 'Constitution Rule',
                    message: 'Runtime module "' + name + '" not found',
                    severity: 'warning'
                });
                continue;
            }

            // Check for __meta
            if (!module.__meta) {
                this.violations.push({
                    module: name,
                    rule: 'Constitution Rule',
                    message: 'Runtime module "' + name + '" missing __meta',
                    severity: 'warning'
                });
            } else {
                var meta = module.__meta;
                if (!meta.domain || meta.domain !== 'Core') {
                    this.violations.push({
                        module: name,
                        rule: 'Constitution Rule',
                        message: 'Runtime module "' + name + '" should have domain "Core"',
                        severity: 'warning'
                    });
                }
                if (!meta.layer || meta.layer !== 'Core') {
                    this.violations.push({
                        module: name,
                        rule: 'Constitution Rule',
                        message: 'Runtime module "' + name + '" should have layer "Core"',
                        severity: 'warning'
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
        console.log('   RUNTIME VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Constitution: Runtime Standard v1.0');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            console.warn('Violations:');
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                console.warn('  ⚠️ ' + v.module + ': ' + v.rule + ' - ' + v.message);
            }
        } else {
            console.log('✅ All runtime modules comply with Runtime Constitution.');
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
     * Check if runtime is compliant
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
window.runtimeValidator = LawAIApp.RuntimeValidator;

console.log('📋 RuntimeValidator ready');
