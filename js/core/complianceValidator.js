/**
 * Compliance Validator
 * 
 * Validates all architecture compliance standards.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ComplianceValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[ComplianceValidator] Initialized.');
    },

    /**
     * Validate all compliance standards
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[ComplianceValidator] Validating compliance...');
        this.violations = [];

        this._validateArchitectureStandards();
        this._validateRuntimeStandards();
        this._validateEngineStandards();
        this._validateRegistryStandards();
        this._validateFeatureStandards();
        this._validateUIStandards();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate Architecture Standards
     * @private
     */
    _validateArchitectureStandards: function() {
        var hasGuard = !!LawAIApp.ArchitectureGuard;
        var hasValidator = !!LawAIApp.ArchitectureValidator;
        var hasConstants = !!LawAIApp.ArchitectureConstants;

        if (!hasGuard) {
            this.violations.push({
                domain: 'Architecture',
                rule: 'Architecture Guard',
                message: 'ArchitectureGuard not found',
                severity: 'warning'
            });
        }

        if (!hasValidator) {
            this.violations.push({
                domain: 'Architecture',
                rule: 'Architecture Validator',
                message: 'ArchitectureValidator not found',
                severity: 'warning'
            });
        }

        if (!hasConstants) {
            this.violations.push({
                domain: 'Architecture',
                rule: 'Architecture Constants',
                message: 'ArchitectureConstants not found',
                severity: 'warning'
            });
        }
    },

    /**
     * Validate Runtime Standards
     * @private
     */
    _validateRuntimeStandards: function() {
        var hasPolicy = !!LawAIApp.RuntimePolicy;
        var hasValidator = !!LawAIApp.RuntimeValidator;
        var hasManifest = !!LawAIApp.RuntimeManifest;
        var hasHealth = !!LawAIApp.RuntimeHealth;

        if (!hasPolicy) {
            this.violations.push({
                domain: 'Runtime',
                rule: 'Runtime Policy',
                message: 'RuntimePolicy not found',
                severity: 'warning'
            });
        }

        if (!hasValidator) {
            this.violations.push({
                domain: 'Runtime',
                rule: 'Runtime Validator',
                message: 'RuntimeValidator not found',
                severity: 'warning'
            });
        }

        if (!hasManifest) {
            this.violations.push({
                domain: 'Runtime',
                rule: 'Runtime Manifest',
                message: 'RuntimeManifest not found',
                severity: 'warning'
            });
        }

        if (!hasHealth) {
            this.violations.push({
                domain: 'Runtime',
                rule: 'Runtime Health',
                message: 'RuntimeHealth not found',
                severity: 'warning'
            });
        }
    },

    /**
     * Validate Engine Standards
     * @private
     */
    _validateEngineStandards: function() {
        var hasValidator = !!LawAIApp.EngineValidator;
        var hasManifest = !!LawAIApp.EngineManifest;
        var hasHealth = !!LawAIApp.EngineHealth;
        var hasTemplate = !!LawAIApp.EngineTemplate;

        if (!hasValidator) {
            this.violations.push({
                domain: 'Engine',
                rule: 'Engine Validator',
                message: 'EngineValidator not found',
                severity: 'warning'
            });
        }

        if (!hasManifest) {
            this.violations.push({
                domain: 'Engine',
                rule: 'Engine Manifest',
                message: 'EngineManifest not found',
                severity: 'warning'
            });
        }

        if (!hasHealth) {
            this.violations.push({
                domain: 'Engine',
                rule: 'Engine Health',
                message: 'EngineHealth not found',
                severity: 'warning'
            });
        }

        if (!hasTemplate) {
            this.violations.push({
                domain: 'Engine',
                rule: 'Engine Template',
                message: 'EngineTemplate not found (optional)',
                severity: 'info'
            });
        }
    },

    /**
     * Validate Registry Standards
     * @private
     */
    _validateRegistryStandards: function() {
        var hasPolicy = !!LawAIApp.RegistryPolicy;
        var hasValidator = !!LawAIApp.RegistryValidator;
        var hasManifest = !!LawAIApp.RegistryManifest;
        var hasHealth = !!LawAIApp.RegistryHealth;

        if (!hasPolicy) {
            this.violations.push({
                domain: 'Registry',
                rule: 'Registry Policy',
                message: 'RegistryPolicy not found',
                severity: 'warning'
            });
        }

        if (!hasValidator) {
            this.violations.push({
                domain: 'Registry',
                rule: 'Registry Validator',
                message: 'RegistryValidator not found',
                severity: 'warning'
            });
        }

        if (!hasManifest) {
            this.violations.push({
                domain: 'Registry',
                rule: 'Registry Manifest',
                message: 'RegistryManifest not found',
                severity: 'warning'
            });
        }

        if (!hasHealth) {
            this.violations.push({
                domain: 'Registry',
                rule: 'Registry Health',
                message: 'RegistryHealth not found',
                severity: 'warning'
            });
        }
    },

    /**
     * Validate Feature Standards
     * @private
     */
    _validateFeatureStandards: function() {
        var hasRegistry = !!LawAIApp.FeatureRegistry;
        var hasValidator = !!LawAIApp.FeatureValidator;
        var hasManifest = !!LawAIApp.FeatureManifest;
        var hasHealth = !!LawAIApp.FeatureHealth;

        if (!hasRegistry) {
            this.violations.push({
                domain: 'Feature',
                rule: 'Feature Registry',
                message: 'FeatureRegistry not found',
                severity: 'warning'
            });
        }

        if (!hasValidator) {
            this.violations.push({
                domain: 'Feature',
                rule: 'Feature Validator',
                message: 'FeatureValidator not found',
                severity: 'warning'
            });
        }

        if (!hasManifest) {
            this.violations.push({
                domain: 'Feature',
                rule: 'Feature Manifest',
                message: 'FeatureManifest not found',
                severity: 'warning'
            });
        }

        if (!hasHealth) {
            this.violations.push({
                domain: 'Feature',
                rule: 'Feature Health',
                message: 'FeatureHealth not found',
                severity: 'warning'
            });
        }
    },

    /**
     * Validate UI Standards
     * @private
     */
    _validateUIStandards: function() {
        var hasRegistry = !!LawAIApp.UIRegistry;
        var hasValidator = !!LawAIApp.UIValidator;
        var hasManifest = !!LawAIApp.UIManifest;
        var hasHealth = !!LawAIApp.UIHealth;

        if (!hasRegistry) {
            this.violations.push({
                domain: 'UI',
                rule: 'UI Registry',
                message: 'UIRegistry not found',
                severity: 'warning'
            });
        }

        if (!hasValidator) {
            this.violations.push({
                domain: 'UI',
                rule: 'UI Validator',
                message: 'UIValidator not found',
                severity: 'warning'
            });
        }

        if (!hasManifest) {
            this.violations.push({
                domain: 'UI',
                rule: 'UI Manifest',
                message: 'UIManifest not found',
                severity: 'warning'
            });
        }

        if (!hasHealth) {
            this.violations.push({
                domain: 'UI',
                rule: 'UI Health',
                message: 'UIHealth not found',
                severity: 'warning'
            });
        }
    },

    /**
     * Report validation results
     * @private
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   COMPLIANCE VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            var grouped = {};
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                if (!grouped[v.domain]) grouped[v.domain] = [];
                grouped[v.domain].push(v);
            }

            for (var domain in grouped) {
                console.warn('  ' + domain + ':');
                for (var j = 0; j < grouped[domain].length; j++) {
                    console.warn('    ⚠️ ' + grouped[domain][j].rule + ' - ' + grouped[domain][j].message);
                }
            }
        } else {
            console.log('✅ All compliance standards are satisfied.');
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
     * Check if compliant
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
        var domains = {};
        for (var i = 0; i < this.violations.length; i++) {
            var v = this.violations[i];
            if (!domains[v.domain]) domains[v.domain] = 0;
            domains[v.domain]++;
        }
        return {
            passed: this.passed,
            violationCount: this.violations.length,
            violationsByDomain: domains
        };
    }
};

// 暴露到全局
window.complianceValidator = LawAIApp.ComplianceValidator;

console.log('📋 ComplianceValidator ready');
