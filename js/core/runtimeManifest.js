/**
 * Runtime Manifest
 * 
 * Contains runtime module metadata.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        modules: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._scanRuntimeModules();
        this.initialized = true;
        console.log('[RuntimeManifest] Initialized with ' + this.manifest.modules.length + ' modules.');
    },

    /**
     * Scan runtime modules
     * @private
     */
    _scanRuntimeModules: function() {
        var modules = [];

        // Define expected runtime modules
        var runtimeModules = [
            { name: 'RuntimeKernel', path: 'LawAIApp.RuntimeKernel' },
            { name: 'RuntimeStatus', path: 'LawAIApp.RuntimeStatus' },
            { name: 'RuntimeRegistry', path: 'LawAIApp.RuntimeRegistry' },
            { name: 'RuntimeLifecycle', path: 'LawAIApp.RuntimeLifecycle' },
            { name: 'RuntimeHealth', path: 'LawAIApp.RuntimeHealth' },
            { name: 'RuntimeInspector', path: 'LawAIApp.RuntimeInspector' },
            { name: 'BootManager', path: 'LawAIApp.BootManager' },
            { name: 'BootPerformance', path: 'LawAIApp.BootPerformance' }
        ];

        for (var i = 0; i < runtimeModules.length; i++) {
            var rm = runtimeModules[i];
            var module = LawAIApp[rm.name];
            
            modules.push({
                name: rm.name,
                path: rm.path,
                exists: !!module,
                hasMeta: module && !!module.__meta,
                hasInit: module && typeof module.init === 'function',
                hasGetStatus: module && typeof module.getStatus === 'function',
                hasValidate: module && typeof module.validate === 'function',
                version: module && module.__meta ? module.__meta.version : 'unknown',
                status: module && module.__meta ? module.__meta.status : 'unknown',
                domain: module && module.__meta ? module.__meta.domain : 'unknown',
                layer: module && module.__meta ? module.__meta.layer : 'unknown',
                dependencies: module && module.__meta ? module.__meta.dependencies || [] : []
            });
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.modules = modules;
    },

    /**
     * Get all runtime modules
     * @returns {Array} Module records
     */
    getModules: function() {
        return this.manifest.modules.slice();
    },

    /**
     * Get module by name
     * @param {string} name - Module name
     * @returns {Object|null} Module record
     */
    getModule: function(name) {
        for (var i = 0; i < this.manifest.modules.length; i++) {
            if (this.manifest.modules[i].name === name) {
                return this.manifest.modules[i];
            }
        }
        return null;
    },

    /**
     * Get modules by status
     * @param {string} status - Status filter
     * @returns {Array} Modules
     */
    getByStatus: function(status) {
        return this.manifest.modules.filter(function(m) {
            return m.status === status;
        });
    },

    /**
     * Get modules by domain
     * @param {string} domain - Domain filter
     * @returns {Array} Modules
     */
    getByDomain: function(domain) {
        return this.manifest.modules.filter(function(m) {
            return m.domain === domain;
        });
    },

    /**
     * Get module count
     * @param {Object} options - Filters
     * @returns {number}
     */
    count: function(options) {
        var modules = this.manifest.modules;
        if (options) {
            if (options.exists !== undefined) {
                modules = modules.filter(function(m) { return m.exists === options.exists; });
            }
            if (options.status) {
                modules = modules.filter(function(m) { return m.status === options.status; });
            }
        }
        return modules.length;
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            modules: this.manifest.modules.slice()
        };
    },

    /**
     * Get missing modules
     * @returns {Array} Missing modules
     */
    getMissing: function() {
        return this.manifest.modules.filter(function(m) {
            return !m.exists;
        });
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._scanRuntimeModules();
        console.log('[RuntimeManifest] Refreshed. Found ' + this.manifest.modules.length + ' modules.');
    },

    /**
     * Get health summary
     * @returns {Object} Health summary
     */
    getHealthSummary: function() {
        var modules = this.manifest.modules;
        var exists = modules.filter(function(m) { return m.exists; });
        var missing = modules.filter(function(m) { return !m.exists; });
        var hasMeta = modules.filter(function(m) { return m.hasMeta; });
        
        return {
            total: modules.length,
            exists: exists.length,
            missing: missing.length,
            hasMeta: hasMeta.length,
            missingNames: missing.map(function(m) { return m.name; })
        };
    }
};

// 暴露到全局
window.runtimeManifest = LawAIApp.RuntimeManifest;

console.log('📋 RuntimeManifest ready');
