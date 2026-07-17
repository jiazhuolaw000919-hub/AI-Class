/**
 * Dependency Manifest
 * 
 * Maintains all engine dependencies.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DependencyManifest = {
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
        this._buildManifest();
        this.initialized = true;
        console.log('[DependencyManifest] Initialized with ' + this.manifest.engines.length + ' engines.');
    },

    /**
     * Build dependency manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        var engines = [];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var dependencies = value.__meta.dependencies || [];
                    var usedBy = this._findUsedBy(key);
                    
                    engines.push({
                        name: key,
                        dependsOn: dependencies.slice(),
                        usedBy: usedBy,
                        dependencyCount: dependencies.length,
                        usedByCount: usedBy.length,
                        hasCircular: false,
                        status: 'active'
                    });
                }
            }
        }

        // Detect circular dependencies
        for (var i = 0; i < engines.length; i++) {
            if (this._hasCircular(engines[i].name, engines)) {
                engines[i].hasCircular = true;
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.engines = engines;
    },

    /**
     * Find engines that depend on a given engine
     * @private
     */
    _findUsedBy: function(engineName) {
        var usedBy = [];
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var deps = value.__meta.dependencies || [];
                    if (deps.indexOf(engineName) !== -1) {
                        usedBy.push(key);
                    }
                }
            }
        }
        return usedBy;
    },

    /**
     * Check for circular dependencies
     * @private
     */
    _hasCircular: function(engineName, engines, visited) {
        visited = visited || [];
        if (visited.indexOf(engineName) !== -1) return true;
        visited.push(engineName);

        var engine = this.getEngine(engineName);
        if (!engine) return false;

        for (var i = 0; i < engine.dependsOn.length; i++) {
            if (this._hasCircular(engine.dependsOn[i], engines, visited.slice())) {
                return true;
            }
        }
        return false;
    },

    /**
     * Get all engines
     * @returns {Array} Engine records
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
     * Get engines with circular dependencies
     * @returns {Array} Engines with circular dependencies
     */
    getCircular: function() {
        return this.manifest.engines.filter(function(e) {
            return e.hasCircular;
        });
    },

    /**
     * Get engines with no dependencies
     * @returns {Array} Independent engines
     */
    getIndependent: function() {
        return this.manifest.engines.filter(function(e) {
            return e.dependencyCount === 0;
        });
    },

    /**
     * Get most connected engine (most dependencies)
     * @returns {Object|null} Most connected engine
     */
    getMostConnected: function() {
        var most = null;
        var max = 0;
        for (var i = 0; i < this.manifest.engines.length; i++) {
            var e = this.manifest.engines[i];
            var total = e.dependencyCount + e.usedByCount;
            if (total > max) {
                max = total;
                most = e;
            }
        }
        return most;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        var engines = this.manifest.engines;
        var circular = this.getCircular();
        var independent = this.getIndependent();
        var mostConnected = this.getMostConnected();
        var totalDependencies = 0;
        var totalUsedBy = 0;

        for (var i = 0; i < engines.length; i++) {
            totalDependencies += engines[i].dependencyCount;
            totalUsedBy += engines[i].usedByCount;
        }

        return {
            totalEngines: engines.length,
            circularCount: circular.length,
            independentCount: independent.length,
            totalDependencies: totalDependencies,
            totalUsedBy: totalUsedBy,
            mostConnected: mostConnected ? mostConnected.name : 'None',
            mostConnectedCount: mostConnected ? (mostConnected.dependencyCount + mostConnected.usedByCount) : 0
        };
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
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[DependencyManifest] Refreshed.');
    }
};

// 暴露到全局
window.dependencyManifest = LawAIApp.DependencyManifest;

console.log('📋 DependencyManifest ready');
