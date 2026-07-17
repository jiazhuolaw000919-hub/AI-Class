/**
 * Engine Manifest
 * 
 * Maintains a registry describing every engine.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        engines: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._scanEngines();
        this.initialized = true;
        console.log('[EngineManifest] Initialized with ' + this.manifest.engines.length + ' engines.');
    },

    /**
     * Scan all engines in LawAIApp
     */
    _scanEngines: function() {
        var engines = [];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    engines.push({
                        name: key,
                        meta: value.__meta,
                        hasInit: typeof value.init === 'function',
                        hasValidate: typeof value.validate === 'function',
                        hasGetStatus: typeof value.getStatus === 'function',
                        hasRegister: typeof value.register === 'function'
                    });
                }
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.engines = engines;
    },

    /**
     * Get all engines
     * @returns {Array} Array of engine records
     */
    getEngines: function() {
        return this.manifest.engines.slice();
    },

    /**
     * Get engine by name
     * @param {string} name - Engine name
     * @returns {Object|null} Engine record
     */
    getEngine: function(name) {
        for (var i = 0; i < this.manifest.engines.length; i++) {
            if (this.manifest.engines[i].name === name) {
                return this.manifest.engines[i];
            }
        }
        return null;
    },

    /**
     * Get engines by domain
     * @param {string} domain - Domain name
     * @returns {Array} Engines in domain
     */
    getByDomain: function(domain) {
        return this.manifest.engines.filter(function(e) {
            return e.meta && e.meta.domain === domain;
        });
    },

    /**
     * Get engines by layer
     * @param {string} layer - Layer name
     * @returns {Array} Engines in layer
     */
    getByLayer: function(layer) {
        return this.manifest.engines.filter(function(e) {
            return e.meta && e.meta.layer === layer;
        });
    },

    /**
     * Get engines by status
     * @param {string} status - Status
     * @returns {Array} Engines with status
     */
    getByStatus: function(status) {
        return this.manifest.engines.filter(function(e) {
            return e.meta && e.meta.status === status;
        });
    },

    /**
     * Get all domains
     * @returns {Array} Unique domains
     */
    getDomains: function() {
        var domains = [];
        for (var i = 0; i < this.manifest.engines.length; i++) {
            var domain = this.manifest.engines[i].meta?.domain;
            if (domain && domains.indexOf(domain) === -1) {
                domains.push(domain);
            }
        }
        return domains;
    },

    /**
     * Get all layers
     * @returns {Array} Unique layers
     */
    getLayers: function() {
        var layers = [];
        for (var i = 0; i < this.manifest.engines.length; i++) {
            var layer = this.manifest.engines[i].meta?.layer;
            if (layer && layers.indexOf(layer) === -1) {
                layers.push(layer);
            }
        }
        return layers;
    },

    /**
     * Get engine count
     * @param {Object} options - Filters
     * @returns {number}
     */
    count: function(options) {
        var engines = this.manifest.engines;
        if (options) {
            if (options.domain) {
                engines = engines.filter(function(e) { return e.meta && e.meta.domain === options.domain; });
            }
            if (options.layer) {
                engines = engines.filter(function(e) { return e.meta && e.meta.layer === options.layer; });
            }
            if (options.status) {
                engines = engines.filter(function(e) { return e.meta && e.meta.status === options.status; });
            }
        }
        return engines.length;
    },

    /**
     * Get manifest as object
     * @returns {Object} Manifest
     */
    getManifest: function() {
        return {
            version: this.manifest.version,
            generatedAt: this.manifest.generatedAt,
            engines: this.manifest.engines.slice()
        };
    },

    /**
     * Export manifest as JSON
     * @returns {string} JSON string
     */
    export: function() {
        return JSON.stringify(this.manifest, null, 2);
    },

    /**
     * Refresh manifest (rescan engines)
     */
    refresh: function() {
        this._scanEngines();
        console.log('[EngineManifest] Refreshed. Found ' + this.manifest.engines.length + ' engines.');
    }
};

// 暴露到全局
window.engineManifest = LawAIApp.EngineManifest;

console.log('📋 EngineManifest ready');
