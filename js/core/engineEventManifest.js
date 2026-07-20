/**
 * Engine Event Manifest
 * 
 * Maintains all official engine events.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineEventManifest = {
    manifest: {
        version: '1.0.0',
        generatedAt: null,
        officialEvents: [],
        customEvents: []
    },
    initialized: false,

    /**
     * Initialize manifest
     */
    init: function() {
        if (this.initialized) return;
        this._buildManifest();
        this.initialized = true;
        console.log('[EngineEventManifest] Initialized with ' + this.manifest.officialEvents.length + ' official events.');
    },

    /**
     * Build event manifest
     * @private
     */
    _buildManifest: function() {
        // Official events
        this.manifest.officialEvents = [
            'ENGINE_REGISTERED',
            'ENGINE_READY',
            'ENGINE_RUNNING',
            'ENGINE_SLEEP',
            'ENGINE_WAKE',
            'ENGINE_RELOAD',
            'ENGINE_UPDATED',
            'ENGINE_WARNING',
            'ENGINE_ERROR',
            'ENGINE_DEPRECATED',
            'ENGINE_DESTROYED'
        ];

        // Scan for custom events
        var customEvents = [];
        for (var key in LawAIApp) {
            if (LawAIApp.hasOwnProperty(key)) {
                var value = LawAIApp[key];
                if (value && typeof value === 'object' && value.__meta) {
                    var events = value.__meta.events || [];
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        if (this.manifest.officialEvents.indexOf(event) === -1) {
                            if (customEvents.indexOf(event) === -1) {
                                customEvents.push(event);
                            }
                        }
                    }
                }
            }
        }

        this.manifest.customEvents = customEvents;
        this.manifest.generatedAt = Date.now();
    },

    /**
     * Get official events
     * @returns {Array} Official events
     */
    getOfficialEvents: function() {
        return this.manifest.officialEvents.slice();
    },

    /**
     * Get custom events
     * @returns {Array} Custom events
     */
    getCustomEvents: function() {
        return this.manifest.customEvents.slice();
    },

    /**
     * Get all events
     * @returns {Object} All events
     */
    getAllEvents: function() {
        return {
            official: this.manifest.officialEvents.slice(),
            custom: this.manifest.customEvents.slice()
        };
    },

    /**
     * Check if event is official
     * @param {string} eventName - Event name
     * @returns {boolean}
     */
    isOfficial: function(eventName) {
        return this.manifest.officialEvents.indexOf(eventName) !== -1;
    },

    /**
     * Check if event is custom
     * @param {string} eventName - Event name
     * @returns {boolean}
     */
    isCustom: function(eventName) {
        return this.manifest.customEvents.indexOf(eventName) !== -1;
    },

    /**
     * Check if event name is valid (starts with ENGINE_)
     * @param {string} eventName - Event name
     * @returns {boolean}
     */
    isValidEventName: function(eventName) {
        return eventName && eventName.startsWith('ENGINE_');
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        return {
            officialCount: this.manifest.officialEvents.length,
            customCount: this.manifest.customEvents.length,
            totalCount: this.manifest.officialEvents.length + this.manifest.customEvents.length,
            officialEvents: this.manifest.officialEvents.slice(),
            customEvents: this.manifest.customEvents.slice()
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
            officialEvents: this.manifest.officialEvents.slice(),
            customEvents: this.manifest.customEvents.slice()
        };
    },

    /**
     * Refresh manifest
     */
    refresh: function() {
        this._buildManifest();
        console.log('[EngineEventManifest] Refreshed.');
    }
};

// 暴露到全局
window.engineEventManifest = LawAIApp.EngineEventManifest;

console.log('📋 EngineEventManifest ready');
