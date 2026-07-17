/**
 * Registry Validator
 * 
 * Validates registry registrations and ownership.
 * Warnings only - never stops application.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RegistryValidator = {
    initialized: false,
    violations: [],
    passed: false,

    /**
     * Initialize validator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[RegistryValidator] Initialized.');
    },

    /**
     * Validate all registries
     * @returns {Object} Validation results
     */
    validate: function() {
        console.log('[RegistryValidator] Validating registries...');
        this.violations = [];

        this._validateDuplicateRegistration();
        this._validateIllegalOwnership();
        this._validateCrossDomainRegistration();
        this._validateReservedNamespaceViolations();
        this._validateRegistryExists();

        this.passed = this.violations.length === 0;
        this._report();
        return {
            passed: this.passed,
            violations: this.violations.slice(),
            count: this.violations.length
        };
    },

    /**
     * Validate duplicate registrations
     * @private
     */
    _validateDuplicateRegistration: function() {
        var registries = this._getRegistries();
        var allObjects = {};
        
        for (var i = 0; i < registries.length; i++) {
            var registry = registries[i];
            if (!registry || typeof registry.getAll !== 'function') continue;
            
            var objects = registry.getAll();
            for (var j = 0; j < objects.length; j++) {
                var obj = objects[j];
                var key = obj.name || obj.id;
                if (key) {
                    if (allObjects[key]) {
                        this.violations.push({
                            type: 'duplicate_registration',
                            message: 'Duplicate registration: "' + key + '" in multiple registries',
                            severity: 'warning',
                            object: key
                        });
                    } else {
                        allObjects[key] = registry;
                    }
                }
            }
        }
    },

    /**
     * Validate illegal ownership
     * @private
     */
    _validateIllegalOwnership: function() {
        var policy = LawAIApp.RegistryPolicy || window.registryPolicy;
        if (!policy) return;
        
        var registryNames = policy.getRegistryNames();
        for (var i = 0; i < registryNames.length; i++) {
            var name = registryNames[i];
            var ownership = policy.getOwnership(name);
            if (!ownership) {
                this.violations.push({
                    type: 'illegal_ownership',
                    message: 'Registry "' + name + '" has no ownership defined',
                    severity: 'warning',
                    registry: name
                });
            }
        }
    },

    /**
     * Validate cross-domain registration
     * @private
     */
    _validateCrossDomainRegistration: function() {
        // Check if registries are registered in correct domains
        var registryMap = {
            'DomainRegistry': 'Architecture',
            'LayerRegistry': 'Architecture',
            'RuntimeRegistry': 'Runtime',
            'FeatureRegistry': 'Features',
            'UIRegistry': 'UI Components',
            'EngineManifest': 'Engines'
        };
        
        for (var key in registryMap) {
            var expectedDomain = registryMap[key];
            var registry = LawAIApp[key];
            if (!registry) continue;
            
            // Check if registry has domain metadata
            if (registry.__meta && registry.__meta.domain) {
                if (registry.__meta.domain !== expectedDomain) {
                    this.violations.push({
                        type: 'cross_domain_registration',
                        message: 'Registry "' + key + '" has domain "' + registry.__meta.domain + '" but expected "' + expectedDomain + '"',
                        severity: 'warning',
                        registry: key
                    });
                }
            }
        }
    },

    /**
     * Validate reserved namespace violations
     * @private
     */
    _validateReservedNamespaceViolations: function() {
        var policy = LawAIApp.RegistryPolicy || window.registryPolicy;
        if (!policy) return;
        
        var namespaces = policy.getReservedNamespaces();
        for (var key in namespaces) {
            var ns = namespaces[key];
            // Check if namespace is being used by correct registry
            var parts = ns.split('.');
            if (parts.length === 2) {
                var registryName = parts[1];
                var registry = LawAIApp[registryName];
                if (!registry) {
                    this.violations.push({
                        type: 'reserved_namespace',
                        message: 'Reserved namespace "' + ns + '" not registered',
                        severity: 'warning',
                        namespace: ns
                    });
                }
            }
        }
    },

    /**
     * Validate registry exists
     * @private
     */
    _validateRegistryExists: function() {
        var requiredRegistries = [
            'DomainRegistry',
            'LayerRegistry',
            'RuntimeRegistry',
            'FeatureRegistry',
            'UIRegistry',
            'EngineManifest'
        ];
        
        for (var i = 0; i < requiredRegistries.length; i++) {
            var name = requiredRegistries[i];
            if (!LawAIApp[name]) {
                this.violations.push({
                    type: 'missing_registry',
                    message: 'Required registry "' + name + '" not found',
                    severity: 'warning',
                    registry: name
                });
            }
        }
    },

    /**
     * Get all registries
     * @private
     */
    _getRegistries: function() {
        var registries = [];
        var registryNames = ['DomainRegistry', 'LayerRegistry', 'RuntimeRegistry', 'FeatureRegistry', 'UIRegistry', 'EngineManifest'];
        for (var i = 0; i < registryNames.length; i++) {
            var registry = LawAIApp[registryNames[i]];
            if (registry) registries.push(registry);
        }
        return registries;
    },

    /**
     * Report validation results
     * @private
     */
    _report: function() {
        console.log('═══════════════════════════════════════');
        console.log('   REGISTRY VALIDATOR');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + (this.passed ? '✅ PASSED' : '⚠️ VIOLATIONS FOUND'));
        console.log('Violations: ' + this.violations.length);
        console.log('─────────────────────────────────────');

        if (this.violations.length > 0) {
            console.warn('Violations:');
            for (var i = 0; i < this.violations.length; i++) {
                var v = this.violations[i];
                console.warn('  ⚠️ ' + v.type + ': ' + v.message);
            }
        } else {
            console.log('✅ All registry rules are satisfied.');
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
     * Check if registries are compliant
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
window.registryValidator = LawAIApp.RegistryValidator;

console.log('📋 RegistryValidator ready');
