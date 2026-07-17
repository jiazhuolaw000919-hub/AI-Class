/**
 * Lifecycle Manifest
 * 
 * Maintains all engine lifecycle states.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LifecycleManifest = {
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
        console.log('[LifecycleManifest] Initialized with ' + this.manifest.engines.length + ' engines.');
    },

    /**
     * Build lifecycle manifest from LawAIApp
     * @private
     */
    _buildManifest: function() {
        var engines = [];
        var validStates = ['created', 'registered', 'initialized', 'ready', 'running', 'sleeping', 'paused', 'reloading', 'deprecated', 'destroyed'];

        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object') {
                    var state = 'unknown';
                    var timestamps = {};

                    if (value.__meta && value.__meta.lifecycle) {
                        state = value.__meta.lifecycle.state || 'unknown';
                        timestamps = {
                            createdAt: value.__meta.lifecycle.createdAt || null,
                            registeredAt: value.__meta.lifecycle.registeredAt || null,
                            initializedAt: value.__meta.lifecycle.initializedAt || null,
                            readyAt: value.__meta.lifecycle.readyAt || null
                        };
                    } else if (value._state && value._state.initialized !== undefined) {
                        state = value._state.initialized ? 'ready' : 'created';
                    }

                    engines.push({
                        name: key,
                        state: state,
                        isValidState: validStates.indexOf(state) !== -1,
                        timestamps: timestamps,
                        hasLifecycleDeclaration: !!(value.__meta && value.__meta.lifecycle),
                        version: value.__meta ? value.__meta.version : '0.0.0',
                        status: value.__meta ? value.__meta.status : 'unknown'
                    });
                }
            }
        }

        this.manifest.generatedAt = Date.now();
        this.manifest.engines = engines;
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
     * Get engines by state
     * @param {string} state - State filter
     * @returns {Array} Engines in state
     */
    getByState: function(state) {
        return this.manifest.engines.filter(function(e) {
            return e.state === state;
        });
    },

    /**
     * Get running engines
     * @returns {Array} Running engines
     */
    getRunning: function() {
        return this.getByState('running');
    },

    /**
     * Get sleeping engines
     * @returns {Array} Sleeping engines
     */
    getSleeping: function() {
        return this.getByState('sleeping');
    },

    /**
     * Get paused engines
     * @returns {Array} Paused engines
     */
    getPaused: function() {
        return this.getByState('paused');
    },

    /**
     * Get deprecated engines
     * @returns {Array} Deprecated engines
     */
    getDeprecated: function() {
        return this.getByState('deprecated');
    },

    /**
     * Get destroyed engines
     * @returns {Array} Destroyed engines
     */
    getDestroyed: function() {
        return this.getByState('destroyed');
    },

    /**
     * Get state summary
     * @returns {Object} State summary
     */
    getStateSummary: function() {
        var states = {};
        var validStates = ['created', 'registered', 'initialized', 'ready', 'running', 'sleeping', 'paused', 'reloading', 'deprecated', 'destroyed'];

        for (var i = 0; i < validStates.length; i++) {
            states[validStates[i]] = 0;
        }
        states['unknown'] = 0;

        for (var j = 0; j < this.manifest.engines.length; j++) {
            var state = this.manifest.engines[j].state;
            if (states[state] !== undefined) {
                states[state]++;
            } else {
                states['unknown']++;
            }
        }

        return states;
    },

    /**
     * Get health summary
     * @returns {Object} Health summary
     */
    getHealthSummary: function() {
        var engines = this.manifest.engines;
        var running = engines.filter(function(e) { return e.state === 'running'; });
        var sleeping = engines.filter(function(e) { return e.state === 'sleeping'; });
        var paused = engines.filter(function(e) { return e.state === 'paused'; });
        var deprecated = engines.filter(function(e) { return e.state === 'deprecated'; });
        var destroyed = engines.filter(function(e) { return e.state === 'destroyed'; });
        var invalid = engines.filter(function(e) { return !e.isValidState; });

        return {
            totalEngines: engines.length,
            running: running.length,
            sleeping: sleeping.length,
            paused: paused.length,
            deprecated: deprecated.length,
            destroyed: destroyed.length,
            invalid: invalid.length,
            invalidNames: invalid.map(function(e) { return e.name; })
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
        console.log('[LifecycleManifest] Refreshed.');
    }
};

// 暴露到全局
window.lifecycleManifest = LawAIApp.LifecycleManifest;

console.log('📋 LifecycleManifest ready');
