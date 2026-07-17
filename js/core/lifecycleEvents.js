/**
 * Lifecycle Events
 * 
 * Defines all engine lifecycle events.
 * Events only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LifecycleEvents = {
    // ============================================================
    // ENGINE LIFECYCLE EVENTS
    // ============================================================

    ENGINE_CREATED: 'ENGINE_CREATED',
    ENGINE_REGISTERED: 'ENGINE_REGISTERED',
    ENGINE_INITIALIZED: 'ENGINE_INITIALIZED',
    ENGINE_READY: 'ENGINE_READY',
    ENGINE_RUNNING: 'ENGINE_RUNNING',
    ENGINE_SLEEP: 'ENGINE_SLEEP',
    ENGINE_WAKE: 'ENGINE_WAKE',
    ENGINE_RELOAD: 'ENGINE_RELOAD',
    ENGINE_DEPRECATED: 'ENGINE_DEPRECATED',
    ENGINE_DESTROYED: 'ENGINE_DESTROYED',

    // ============================================================
    // STATE MAPPING
    // ============================================================

    STATE_TO_EVENT: {
        'created': 'ENGINE_CREATED',
        'registered': 'ENGINE_REGISTERED',
        'initialized': 'ENGINE_INITIALIZED',
        'ready': 'ENGINE_READY',
        'running': 'ENGINE_RUNNING',
        'sleeping': 'ENGINE_SLEEP',
        'paused': 'ENGINE_SLEEP',
        'reloading': 'ENGINE_RELOAD',
        'deprecated': 'ENGINE_DEPRECATED',
        'destroyed': 'ENGINE_DESTROYED'
    },

    // ============================================================
    // EVENT METHODS
    // ============================================================

    /**
     * Get event name for a state
     * @param {string} state - Lifecycle state
     * @returns {string} Event name
     */
    getEventForState: function(state) {
        return this.STATE_TO_EVENT[state] || null;
    },

    /**
     * Get all lifecycle events
     * @returns {Array} List of event names
     */
    getAllEvents: function() {
        return [
            this.ENGINE_CREATED,
            this.ENGINE_REGISTERED,
            this.ENGINE_INITIALIZED,
            this.ENGINE_READY,
            this.ENGINE_RUNNING,
            this.ENGINE_SLEEP,
            this.ENGINE_WAKE,
            this.ENGINE_RELOAD,
            this.ENGINE_DEPRECATED,
            this.ENGINE_DESTROYED
        ];
    },

    /**
     * Get event description
     * @param {string} eventName - Event name
     * @returns {string} Description
     */
    getEventDescription: function(eventName) {
        var descriptions = {
            'ENGINE_CREATED': 'Engine instance created',
            'ENGINE_REGISTERED': 'Engine registered with registry',
            'ENGINE_INITIALIZED': 'Engine initialization complete',
            'ENGINE_READY': 'Engine ready for operation',
            'ENGINE_RUNNING': 'Engine started running',
            'ENGINE_SLEEP': 'Engine entered sleep state',
            'ENGINE_WAKE': 'Engine woke from sleep',
            'ENGINE_RELOAD': 'Engine reloading',
            'ENGINE_DEPRECATED': 'Engine marked deprecated',
            'ENGINE_DESTROYED': 'Engine destroyed'
        };
        return descriptions[eventName] || 'Unknown event';
    },

    /**
     * Emit lifecycle event
     * @param {string} engineName - Engine name
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    emit: function(engineName, eventName, data) {
        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (eventBus && typeof eventBus.emit === 'function') {
            eventBus.emit(eventName, {
                engine: engineName,
                event: eventName,
                timestamp: Date.now(),
                ...data
            });
        } else {
            console.log('[LifecycleEvents] ' + eventName + ' for ' + engineName);
        }
    },

    /**
     * Get event listener for lifecycle
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     */
    on: function(eventName, callback) {
        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (eventBus && typeof eventBus.on === 'function') {
            eventBus.on(eventName, callback);
        } else {
            console.warn('[LifecycleEvents] EventBus not available for subscription');
        }
    }
};

// 暴露到全局
window.lifecycleEvents = LawAIApp.LifecycleEvents;

console.log('📋 LifecycleEvents ready');
