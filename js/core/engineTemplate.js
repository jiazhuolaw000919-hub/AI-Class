```javascript
/**
 * ENGINE TEMPLATE
 * 
 * This is NOT a real engine.
 * It is a reference template for creating new engines.
 * 
 * Copy this file, rename it, and fill in the sections.
 * 
 * ═══════════════════════════════════════
 * USAGE:
 * 1. Copy this file to a new file (e.g., myEngine.js)
 * 2. Replace "EngineTemplate" with your engine name
 * 3. Fill in the metadata
 * 4. Implement the methods
 * 5. Register with the appropriate registry
 * ═══════════════════════════════════════
 */

/**
 * EngineTemplate
 * 
 * One sentence description of what this engine does.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineTemplate = {
    // ============================================================
    // METADATA (Required - DO NOT SKIP)
    // ============================================================
    __meta: {
        name: 'EngineTemplate',
        domain: 'Feature',      // App | Core | Feature | UI | AI | Content
        layer: 'Feature',       // App | Core | Feature | Content | UI | AI
        owner: 'Law AI Academy',
        version: '1.0.0',
        status: 'active',       // active | beta | deprecated | archived
        dependencies: [],       // ['Dependency1', 'Dependency2']
        registry: 'FeatureRegistry', // RuntimeRegistry | FeatureRegistry | UIRegistry | DomainRegistry | LayerRegistry
        description: 'One sentence describing what this engine does.',
        initPolicy: 'auto',     // auto | manual | lazy
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    },

    // ============================================================
    // PRIVATE STATE
    // ============================================================
    _state: {
        initialized: false,
        ready: false,
        config: {},
        data: {},
        cache: {}
    },

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * Initialize the engine
     * Called by BootManager or Registry
     * @param {Object} options - Configuration options
     */
    init: function(options) {
        if (this._state.initialized) {
            console.warn('[EngineTemplate] Already initialized.');
            return;
        }

        console.log('[EngineTemplate] Initializing...');

        // Merge configuration
        if (options) {
            this._state.config = Object.assign({}, this._state.config, options);
        }

        // Initialize dependencies
        this._initDependencies();

        // Set initialized flag
        this._state.initialized = true;
        this._state.ready = true;

        console.log('[EngineTemplate] Initialized.');
    },

    /**
     * Initialize dependencies
     * @private
     */
    _initDependencies: function() {
        // Check dependencies
        for (var i = 0; i < this.__meta.dependencies.length; i++) {
            var depName = this.__meta.dependencies[i];
            var dep = LawAIApp[depName];
            if (!dep) {
                console.warn('[EngineTemplate] Dependency not found: ' + depName);
                continue;
            }
            // Initialize dependency if needed
            if (typeof dep.init === 'function' && !dep._state?.initialized) {
                dep.init();
            }
        }
    },

    // ============================================================
    // PUBLIC API
    // ============================================================

    /**
     * Get engine status
     * @returns {Object} Status object
     */
    getStatus: function() {
        return {
            name: this.__meta.name,
            version: this.__meta.version,
            domain: this.__meta.domain,
            layer: this.__meta.layer,
            status: this.__meta.status,
            initialized: this._state.initialized,
            ready: this._state.ready,
            dependencies: this.__meta.dependencies.slice()
        };
    },

    /**
     * Get engine configuration
     * @returns {Object} Configuration
     */
    getConfig: function() {
        return Object.freeze(Object.assign({}, this._state.config));
    },

    /**
     * Get engine state
     * @returns {Object} State
     */
    getState: function() {
        return {
            initialized: this._state.initialized,
            ready: this._state.ready
        };
    },

    /**
     * Check if engine is ready
     * @returns {boolean}
     */
    isReady: function() {
        return this._state.ready;
    },

    // ============================================================
    // CORE METHODS (Override these)
    // ============================================================

    /**
     * Process data
     * @param {*} input - Input data
     * @returns {*} Processed data
     */
    process: function(input) {
        // Implement your business logic here
        return input;
    },

    /**
     * Get data
     * @param {string} key - Data key
     * @returns {*} Data
     */
    get: function(key) {
        return this._state.data[key];
    },

    /**
     * Set data
     * @param {string} key - Data key
     * @param {*} value - Data value
     */
    set: function(key, value) {
        this._state.data[key] = value;
    },

    // ============================================================
    // VALIDATION
    // ============================================================

    /**
     * Validate engine metadata
     * @returns {Object} Validation results
     */
    validate: function() {
        var errors = [];
        var meta = this.__meta;

        // Check required fields
        var required = ['name', 'domain', 'layer', 'owner', 'version', 'status', 'dependencies', 'registry', 'description', 'initPolicy'];
        for (var i = 0; i < required.length; i++) {
            var field = required[i];
            if (!meta[field]) {
                errors.push('Missing metadata field: ' + field);
            }
        }

        // Validate domain
        var validDomains = ['App', 'Core', 'Feature', 'UI', 'AI', 'Content'];
        if (meta.domain && validDomains.indexOf(meta.domain) === -1) {
            errors.push('Invalid domain: ' + meta.domain + '. Must be one of: ' + validDomains.join(', '));
        }

        // Validate layer
        var validLayers = ['App', 'Core', 'Feature', 'Content', 'UI', 'AI'];
        if (meta.layer && validLayers.indexOf(meta.layer) === -1) {
            errors.push('Invalid layer: ' + meta.layer + '. Must be one of: ' + validLayers.join(', '));
        }

        // Validate status
        var validStatuses = ['active', 'beta', 'deprecated', 'archived'];
        if (meta.status && validStatuses.indexOf(meta.status) === -1) {
            errors.push('Invalid status: ' + meta.status + '. Must be one of: ' + validStatuses.join(', '));
        }

        // Validate version format
        if (meta.version && !/^\d+\.\d+\.\d+$/.test(meta.version)) {
            errors.push('Invalid version format: ' + meta.version + '. Expected: x.y.z');
        }

        // Validate initPolicy
        var validPolicies = ['auto', 'manual', 'lazy'];
        if (meta.initPolicy && validPolicies.indexOf(meta.initPolicy) === -1) {
            errors.push('Invalid initPolicy: ' + meta.initPolicy + '. Must be one of: ' + validPolicies.join(', '));
        }

        // Validate dependencies is array
        if (meta.dependencies && !Array.isArray(meta.dependencies)) {
            errors.push('Dependencies must be an array');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // ============================================================
    // REGISTRATION
    // ============================================================

    /**
     * Register this engine with its registry
     */
    register: function() {
        var registry = LawAIApp[this.__meta.registry];
        if (registry && typeof registry.register === 'function') {
            registry.register(this.__meta.name, this);
            console.log('[EngineTemplate] Registered with ' + this.__meta.registry);
        } else {
            console.warn('[EngineTemplate] Registry not found: ' + this.__meta.registry);
        }
    },

    // ============================================================
    // FREEZE OBJECT
    // ============================================================

    /**
     * Get immutable engine description
     * @returns {Object} Immutable metadata
     */
    getManifest: function() {
        return Object.freeze({
            name: this.__meta.name,
            domain: this.__meta.domain,
            layer: this.__meta.layer,
            owner: this.__meta.owner,
            version: this.__meta.version,
            status: this.__meta.status,
            dependencies: this.__meta.dependencies.slice(),
            registry: this.__meta.registry,
            description: this.__meta.description,
            initPolicy: this.__meta.initPolicy,
            createdAt: this.__meta.createdAt,
            updatedAt: this.__meta.updatedAt
        });
    },

    // ============================================================
    // DESTRUCTION
    // ============================================================

    /**
     * Destroy the engine
     * Clean up resources
     */
    destroy: function() {
        if (!this._state.initialized) return;
        this._state.initialized = false;
        this._state.ready = false;
        this._state.data = {};
        this._state.cache = {};
        console.log('[EngineTemplate] Destroyed.');
    }
};

// ============================================================
// EXPOSE TO GLOBAL NAMESPACE
// ============================================================

// Already in window.LawAIApp
console.log('[EngineTemplate] Template ready.');
