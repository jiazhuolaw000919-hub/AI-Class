/**
 * Architecture Guard
 * 
 * Verifies architecture compliance with the Constitution.
 * Read-only. Warnings only. Never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ArchitectureGuard = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize Architecture Guard
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[ArchitectureGuard] Initialized.');
    },

    /**
     * Validate architecture compliance
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[ArchitectureGuard] Validating architecture...');
        this.violations = [];

        this._validateNamespace();
        this._validateRegistryOwnership();
        this._validateRuntime();
        this._validateSystemComposer();
        this._validateBootManager();
        this._validateDeveloperPanel();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    // ============================================================
    // RULE 2: Global Namespace
    // ============================================================

    _validateNamespace: function() {
        var globals = Object.keys(window);
        var allowed = ['LawAIApp', 'window', 'document', 'console', 'localStorage', 'sessionStorage', 'location', 'history', 'navigator', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch', 'alert', 'confirm', 'prompt'];
        
        var violations = [];
        for (var i = 0; i < globals.length; i++) {
            var key = globals[i];
            // Skip standard browser globals
            if (allowed.indexOf(key) !== -1) continue;
            // Skip if it's a built-in or standard
            if (key === 'undefined' || key === 'NaN' || key === 'Infinity') continue;
            if (key === 'Object' || key === 'Array' || key === 'String' || key === 'Number') continue;
            if (key === 'Function' || key === 'Boolean' || key === 'Symbol') continue;
            if (key === 'Error' || key === 'TypeError' || key === 'ReferenceError') continue;
            if (key === 'Promise' || key === 'Map' || key === 'Set') continue;
            if (key === 'RegExp' || key === 'Date' || key === 'Math') continue;
            if (key === 'JSON' || key === 'parseInt' || key === 'parseFloat') continue;
            if (key === 'isNaN' || key === 'isFinite' || key === 'encodeURI') continue;
            if (key === 'decodeURI' || key === 'encodeURIComponent') continue;
            if (key === 'decodeURIComponent' || key === 'escape' || key === 'unescape') continue;
            // Skip if it's a LawAIApp property (already in LawAIApp)
            if (key === 'LawAIApp') continue;
            // Skip if it's an EventBus property (Legacy)
            if (key === 'EventBus') continue;
            
            // Check if this global is actually from LawAIApp
            var value = window[key];
            if (value && typeof value === 'object' && value !== null) {
                // Check if it's already inside LawAIApp
                if (LawAIApp[key] === value) continue;
            }
            
            violations.push({
                rule: 'Global Namespace Rule',
                violation: 'Global "' + key + '" is not inside window.LawAIApp',
                severity: 'warning'
            });
        }

        // Also check if there are any additional namespaces
        for (var key2 in window) {
            if (key2 === 'LawAIApp') continue;
            if (allowed.indexOf(key2) !== -1) continue;
            if (key2 === 'eventBus' || key2 === 'EventBus') continue; // Legacy
            if (key2 === 'domainRegistry' || key2 === 'layerRegistry') continue; // Legacy from recovery
            if (key2 === 'featureRegistry' || key2 === 'uiRegistry') continue;
            if (key2 === 'runtimeStatus' || key2 === 'runtimeKernel') continue;
            if (key2 === 'runtimeHealth' || key2 === 'runtimeInspector') continue;
            if (key2 === 'architectureValidator' || key2 === 'architectureAudit') continue;
            if (key2 === 'dependencyAudit' || key2 === 'moduleAudit') continue;
            if (key2 === 'recoveryReport' || key2 === 'architectureConstants') continue;
            if (key2 === 'auditConstants' || key2 === 'uiConstants' || key2 === 'featureConstants') continue;
            if (key2 === 'featureHealth' || key2 === 'uiHealth' || key2 === 'featureValidator' || key2 === 'uiValidator') continue;
            if (key2 === 'bootPerformance' || key2 === 'runtimeLifecycle') continue;
            if (key2 === 'featureManifest' || key2 === 'uiManifest') continue;
            
            // Skip if it's inside LawAIApp already
            if (LawAIApp[key2]) continue;
            
            // Skip if it's a function or built-in
            if (typeof window[key2] === 'function') continue;
            
            violations.push({
                rule: 'Global Namespace Rule',
                violation: 'Global "' + key2 + '" is not inside window.LawAIApp',
                severity: 'warning'
            });
        }

        this.violations = this.violations.concat(violations);
    },

    // ============================================================
    // RULE 6: Registry Ownership
    // ============================================================

    _validateRegistryOwnership: function() {
        // Check DomainRegistry
        if (LawAIApp.DomainRegistry) {
            // Ensure DomainRegistry only tracks domains
            if (LawAIApp.DomainRegistry.features) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'DomainRegistry should not track features',
                    severity: 'warning'
                });
            }
            if (LawAIApp.DomainRegistry.components) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'DomainRegistry should not track UI components',
                    severity: 'warning'
                });
            }
        }

        // Check FeatureRegistry
        if (LawAIApp.FeatureRegistry) {
            if (LawAIApp.FeatureRegistry.domains) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'FeatureRegistry should not track domains',
                    severity: 'warning'
                });
            }
            if (LawAIApp.FeatureRegistry.components) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'FeatureRegistry should not track UI components',
                    severity: 'warning'
                });
            }
        }

        // Check UIRegistry
        if (LawAIApp.UIRegistry) {
            if (LawAIApp.UIRegistry.features) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'UIRegistry should not track features',
                    severity: 'warning'
                });
            }
            if (LawAIApp.UIRegistry.domains) {
                this.violations.push({
                    rule: 'Registry Ownership Rule',
                    violation: 'UIRegistry should not track domains',
                    severity: 'warning'
                });
            }
        }
    },

    // ============================================================
    // RULE 4: Runtime Rule
    // ============================================================

    _validateRuntime: function() {
        if (LawAIApp.RuntimeKernel) {
            // Check for business logic indicators
            if (typeof LawAIApp.RuntimeKernel.processData === 'function') {
                this.violations.push({
                    rule: 'Runtime Rule',
                    violation: 'RuntimeKernel should not own business logic (processData)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.RuntimeKernel.renderUI === 'function') {
                this.violations.push({
                    rule: 'Runtime Rule',
                    violation: 'RuntimeKernel should not contain UI rendering (renderUI)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.RuntimeKernel.saveUserData === 'function') {
                this.violations.push({
                    rule: 'Runtime Rule',
                    violation: 'RuntimeKernel should not store user data (saveUserData)',
                    severity: 'warning'
                });
            }
        }
    },

    // ============================================================
    // RULE 5: SystemComposer Rule
    // ============================================================

    _validateSystemComposer: function() {
        if (LawAIApp.SystemComposer) {
            if (typeof LawAIApp.SystemComposer.processBusinessLogic === 'function') {
                this.violations.push({
                    rule: 'SystemComposer Rule',
                    violation: 'SystemComposer should not own business logic (processBusinessLogic)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.SystemComposer.saveToStorage === 'function') {
                this.violations.push({
                    rule: 'SystemComposer Rule',
                    violation: 'SystemComposer should not own storage (saveToStorage)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.SystemComposer.handleRoute === 'function') {
                this.violations.push({
                    rule: 'SystemComposer Rule',
                    violation: 'SystemComposer should not own routing (handleRoute)',
                    severity: 'warning'
                });
            }
        }
    },

    // ============================================================
    // RULE 7: Boot Rule
    // ============================================================

    _validateBootManager: function() {
        if (LawAIApp.BootManager) {
            if (typeof LawAIApp.BootManager.processData === 'function') {
                this.violations.push({
                    rule: 'Boot Rule',
                    violation: 'BootManager should not process business logic (processData)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.BootManager.renderUI === 'function') {
                this.violations.push({
                    rule: 'Boot Rule',
                    violation: 'BootManager should not render UI (renderUI)',
                    severity: 'warning'
                });
            }
            if (typeof LawAIApp.BootManager.saveData === 'function') {
                this.violations.push({
                    rule: 'Boot Rule',
                    violation: 'BootManager should not store data (saveData)',
                    severity: 'warning'
                });
            }
        }
    },

    // ============================================================
    // RULE 8: Developer Rule
    // ============================================================

    _validateDeveloperPanel: function() {
        if (LawAIApp.Debug && LawAIApp.Debug.DevPanel) {
            // Check for mutation methods
            var methods = ['reset', 'clear', 'delete', 'edit', 'modify', 'write', 'save', 'set'];
            var panel = LawAIApp.Debug.DevPanel;
            for (var key in panel) {
                if (typeof panel[key] === 'function') {
                    var lower = key.toLowerCase();
                    for (var i = 0; i < methods.length; i++) {
                        if (lower.indexOf(methods[i]) !== -1 && key !== 'toggle' && key !== 'show' && key !== 'hide') {
                            this.violations.push({
                                rule: 'Developer Rule',
                                violation: 'DevPanel should not mutate state (' + key + ')',
                                severity: 'warning'
                            });
                            break;
                        }
                    }
                }
            }
        }
    },

    // ============================================================
    // Reporting
    // ============================================================

    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   ARCHITECTURE GUARD');
        console.log('═══════════════════════════════════════');
        console.log('Constitution: Architecture Constitution v1.0');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            console.warn('Violations:');
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                console.warn('  ⚠️ ' + v.rule + ': ' + v.violation);
            }
        } else {
            console.log('✅ All architecture rules are satisfied.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get violation count
     * @returns {number} Number of violations
     */
    getViolationCount: function() {
        return this.violations.length;
    },

    /**
     * Get violations
     * @returns {Array} Violations list
     */
    getViolations: function() {
        return this.violations.slice();
    },

    /**
     * Check if architecture is compliant
     * @returns {boolean}
     */
    isCompliant: function() {
        return this.passed;
    },

    /**
     * Get summary
     * @returns {Object} Summary
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
window.architectureGuard = LawAIApp.ArchitectureGuard;

console.log('🛡️ ArchitectureGuard ready');
