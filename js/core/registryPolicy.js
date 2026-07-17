/**
 * Registry Policy
 * 
 * Contains registry rules and policies.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RegistryPolicy = {
    // ============================================================
    // REGISTRY CONSTANTS
    // ============================================================
    
    /**
     * Maximum responsibilities per registry
     */
    MAX_RESPONSIBILITIES: 3,
    
    /**
     * Maximum objects per registry
     */
    MAX_OBJECTS_PER_REGISTRY: 1000,
    
    // ============================================================
    // RESERVED NAMESPACES
    // ============================================================
    
    RESERVED_NAMESPACES: {
        architecture: 'LawAIApp.DomainRegistry',
        architectureLayer: 'LawAIApp.LayerRegistry',
        runtime: 'LawAIApp.RuntimeRegistry',
        feature: 'LawAIApp.FeatureRegistry',
        ui: 'LawAIApp.UIRegistry',
        engine: 'LawAIApp.EngineManifest'
    },
    
    // ============================================================
    // REGISTRY OWNERSHIP
    // ============================================================
    
    OWNERSHIP_MAP: {
        'DomainRegistry': { domain: 'Architecture', owner: 'Law AI Academy' },
        'LayerRegistry': { domain: 'Architecture', owner: 'Law AI Academy' },
        'RuntimeRegistry': { domain: 'Runtime', owner: 'Law AI Academy' },
        'FeatureRegistry': { domain: 'Features', owner: 'Law AI Academy' },
        'UIRegistry': { domain: 'UI Components', owner: 'Law AI Academy' },
        'EngineManifest': { domain: 'Engines', owner: 'Law AI Academy' }
    },
    
    // ============================================================
    // REGISTRATION RULES
    // ============================================================
    
    /**
     * Valid object types for each registry
     */
    VALID_OBJECT_TYPES: {
        'DomainRegistry': ['domain'],
        'LayerRegistry': ['layer'],
        'RuntimeRegistry': ['runtime_module'],
        'FeatureRegistry': ['feature'],
        'UIRegistry': ['ui_component'],
        'EngineManifest': ['engine']
    },
    
    /**
     * Get registry namespace
     * @param {string} registryName - Registry name
     * @returns {string} Namespace
     */
    getNamespace: function(registryName) {
        return this.RESERVED_NAMESPACES[registryName.toLowerCase()] || null;
    },
    
    /**
     * Get registry ownership
     * @param {string} registryName - Registry name
     * @returns {Object} Ownership info
     */
    getOwnership: function(registryName) {
        return this.OWNERSHIP_MAP[registryName] || null;
    },
    
    /**
     * Get valid object types for registry
     * @param {string} registryName - Registry name
     * @returns {Array} Valid object types
     */
    getValidObjectTypes: function(registryName) {
        return this.VALID_OBJECT_TYPES[registryName] || [];
    },
    
    /**
     * Check if object type is valid for registry
     * @param {string} registryName - Registry name
     * @param {string} objectType - Object type
     * @returns {boolean}
     */
    isValidObjectType: function(registryName, objectType) {
        var types = this.getValidObjectTypes(registryName);
        return types.indexOf(objectType) !== -1;
    },
    
    /**
     * Get all registry names
     * @returns {Array} Registry names
     */
    getRegistryNames: function() {
        return Object.keys(this.OWNERSHIP_MAP);
    },
    
    /**
     * Get all reserved namespaces
     * @returns {Object} Reserved namespaces
     */
    getReservedNamespaces: function() {
        return { ...this.RESERVED_NAMESPACES };
    }
};

// 暴露到全局
window.registryPolicy = LawAIApp.RegistryPolicy;

console.log('📋 RegistryPolicy ready');
