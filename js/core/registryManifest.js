/**
 * Registry Manifest
 * 
 * Maintains registry metadata.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RegistryManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        registries: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._scanRegistries();
        this.initialized = true;
        console.log('[RegistryManifest] Initialized with ' + this.manifest.registries.length + ' registries.');
    },

    /**
     * Scan registries
     * @private
     */
    _scanRegistries: function() {
        var registries = [];
        var registryNames = ['DomainRegistry', 'LayerRegistry', 'RuntimeRegistry', 'FeatureRegistry', 'UIRegistry', 'EngineManifest'];

        for (var i = 0; i < registryNames.length; i++) {
            var name = registryNames[i];
            var registry = LawAIApp[name];
            
            var objectCount = 0;
            if (registry && typeof registry.getAll === 'function') {
                objectCount = registry.getAll().length;
            } else if (registry && typeof registry.list === 'function') {
                objectCount = registry.list().length;
            }
            
            var hasMeta = registry && !!registry.__meta;
            var domain = hasMeta ? registry.__meta.domain : 'unknown';
            var owner = hasMeta ? registry.__meta.owner : 'Law AI Academy';
            var version = hasMeta ? registry.__meta.version : '1.0.0';
            var status = hasMeta ? registry.__meta.status : 'active';
            
            registries.push({
                name: name,
                exists: !!registry,
                domain: domain,
                owner: owner,
                version: version,
                status: status,
                objectCount: objectCount,
                hasMeta: hasMeta,
                hasGetAll: registry && typeof registry.getAll === 'function',
                hasList: registry && typeof registry.list === 'function',
                hasRegister: registry && typeof registry.register === 'function',
                hasFind: registry && typeof registry.find === 'function',
                hasValidate: registry && typeof registry.validate === 'function'
            });
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.registries = registries;
    },

    /**
     * Get all registries
     * @returns {Array} Registry records
     */
    getRegistries: function() {
        return this.manifest.registries.slice();
    },

    /**
     * Get registry by name
     * @param {string} name - Registry name
     * @returns {Object|null} Registry record
     */
    getRegistry: function(name) {
        for (var i = 0; i < this.manifest.registries.length; i++) {
            if (this.manifest.registries[i].name === name) {
                return this.manifest.registries[i];
            }
        }
        return null;
    },

    /**
     * Get registries by domain
     * @param {string} domain - Domain filter
     * @returns {Array} Registries
     */
    getByDomain: function(domain) {
        return this.manifest.registries.filter(function(r) {
            return r.domain === domain;
        });
    },

    /**
     * Get registries by status
     * @param {string} status - Status filter
     * @returns {Array} Registries
     */
    getByStatus: function(status) {
        return this.manifest.registries.filter(function(r) {
            return r.status === status;
        });
    },

    /**
     * Get registry count
     * @param {Object} options - Filters
     * @returns {number}
     */
    count: function(options) {
        var registries = this.manifest.registries;
        if (options) {
            if (options.exists !== undefined) {
                registries = registries.filter(function(r) { return r.exists === options.exists; });
            }
            if (options.domain) {
                registries = registries.filter(function(r) { return r.domain === options.domain; });
            }
        }
        return registries.length;
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            registries: this.manifest.registries.slice()
        };
    },

    /**
     * Get missing registries
     * @returns {Array} Missing registries
     */
    getMissing: function() {
        return this.manifest.registries.filter(function(r) {
            return !r.exists;
        });
    },

    /**
     * Get healthy registries
     * @returns {Array} Healthy registries
     */
    getHealthy: function() {
        return this.manifest.registries.filter(function(r) {
            return r.exists && r.hasMeta;
        });
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._scanRegistries();
        console.log('[RegistryManifest] Refreshed.');
    },

    /**
     * Get health summary
     * @returns {Object} Health summary
     */
    getHealthSummary: function() {
        var registries = this.manifest.registries;
        var exists = registries.filter(function(r) { return r.exists; });
        var missing = registries.filter(function(r) { return !r.exists; });
        var hasMeta = registries.filter(function(r) { return r.hasMeta; });
        var healthy = registries.filter(function(r) { return r.exists && r.hasMeta && r.status !== 'deprecated'; });
        
        return {
            total: registries.length,
            exists: exists.length,
            missing: missing.length,
            hasMeta: hasMeta.length,
            healthy: healthy.length,
            missingNames: missing.map(function(r) { return r.name; })
        };
    }
};

// 暴露到全局
window.registryManifest = LawAIApp.RegistryManifest;

console.log('📋 RegistryManifest ready');
