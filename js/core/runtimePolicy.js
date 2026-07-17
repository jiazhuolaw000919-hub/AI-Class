/**
 * Runtime Policy
 * 
 * Contains all runtime rules and policies.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimePolicy = {
    // ============================================================
    // RUNTIME CONSTANTS
    // ============================================================
    
    /**
     * Maximum boot phases
     * Runtime can have up to this many boot phases
     */
    MAX_BOOT_PHASES: 10,
    
    /**
     * Maximum lifecycle stages
     * Runtime can have up to this many lifecycle stages
     */
    MAX_LIFECYCLE_STAGES: 8,
    
    /**
     * Maximum runtime responsibilities
     * Runtime can have up to this many responsibilities
     */
    MAX_RUNTIME_RESPONSIBILITIES: 10,
    
    // ============================================================
    // RESERVED NAMESPACES
    // ============================================================
    
    /**
     * Reserved runtime namespaces
     * All runtime modules must use these namespaces
     */
    RESERVED_NAMESPACES: [
        'LawAIApp.RuntimeKernel',
        'LawAIApp.RuntimeStatus',
        'LawAIApp.RuntimeRegistry',
        'LawAIApp.RuntimeLifecycle',
        'LawAIApp.RuntimeHealth',
        'LawAIApp.RuntimeInspector',
        'LawAIApp.BootManager',
        'LawAIApp.BootPerformance'
    ],
    
    /**
     * Reserved runtime event prefixes
     */
    RESERVED_EVENT_PREFIXES: [
        'RUNTIME_'
    ],
    
    // ============================================================
    // RUNTIME STATES
    // ============================================================
    
    /**
     * Valid runtime states
     */
    VALID_STATES: [
        'idle',
        'initializing',
        'booting',
        'loading',
        'ready',
        'refreshing',
        'destroyed'
    ],
    
    // ============================================================
    // RUNTIME RESPONSIBILITIES
    // ============================================================
    
    /**
     * Allowed runtime responsibilities
     */
    ALLOWED_RESPONSIBILITIES: [
        'coordinate_boot',
        'coordinate_lifecycle',
        'coordinate_health',
        'coordinate_validation',
        'coordinate_registry'
    ],
    
    /**
     * Forbidden runtime responsibilities
     */
    FORBIDDEN_RESPONSIBILITIES: [
        'business_logic',
        'storage_operations',
        'ui_rendering',
        'routing_logic',
        'user_data',
        'analytics',
        'business_rules'
    ],
    
    // ============================================================
    // RUNTIME VALIDATION
    // ============================================================
    
    /**
     * Check if a state is valid
     * @param {string} state - State to check
     * @returns {boolean}
     */
    isValidState: function(state) {
        return this.VALID_STATES.indexOf(state) !== -1;
    },
    
    /**
     * Check if a responsibility is allowed
     * @param {string} responsibility - Responsibility to check
     * @returns {boolean}
     */
    isAllowedResponsibility: function(responsibility) {
        return this.ALLOWED_RESPONSIBILITIES.indexOf(responsibility) !== -1;
    },
    
    /**
     * Check if a responsibility is forbidden
     * @param {string} responsibility - Responsibility to check
     * @returns {boolean}
     */
    isForbiddenResponsibility: function(responsibility) {
        return this.FORBIDDEN_RESPONSIBILITIES.indexOf(responsibility) !== -1;
    },
    
    /**
     * Check if a namespace is reserved
     * @param {string} namespace - Namespace to check
     * @returns {boolean}
     */
    isReservedNamespace: function(namespace) {
        return this.RESERVED_NAMESPACES.indexOf(namespace) !== -1;
    },
    
    /**
     * Get all reserved namespaces
     * @returns {Array} Reserved namespaces
     */
    getReservedNamespaces: function() {
        return this.RESERVED_NAMESPACES.slice();
    },
    
    /**
     * Get all valid states
     * @returns {Array} Valid states
     */
    getValidStates: function() {
        return this.VALID_STATES.slice();
    },
    
    /**
     * Get all allowed responsibilities
     * @returns {Array} Allowed responsibilities
     */
    getAllowedResponsibilities: function() {
        return this.ALLOWED_RESPONSIBILITIES.slice();
    },
    
    /**
     * Get all forbidden responsibilities
     * @returns {Array} Forbidden responsibilities
     */
    getForbiddenResponsibilities: function() {
        return this.FORBIDDEN_RESPONSIBILITIES.slice();
    }
};

// 暴露到全局
window.runtimePolicy = LawAIApp.RuntimePolicy;

console.log('📋 RuntimePolicy ready');
