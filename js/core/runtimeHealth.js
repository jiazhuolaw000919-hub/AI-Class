/**
 * Runtime Health
 * 
 * Monitors runtime health including boot time, compose time,
 * validation time, health time, registry time, and lifecycle time.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeHealth = {
    initialized: false,
    
    // ============================================================
    // HEALTH DATA
    // ============================================================
    
    healthData: {
        lastCheck: null,
        bootTime: 0,
        composeTime: 0,
        validationTime: 0,
        healthCheckTime: 0,
        registryTime: 0,
        lifecycleTime: 0,
        healthScore: 100,
        status: 'unknown',
        details: {}
    },

    // ============================================================
    // INITIALIZATION
    // ============================================================

    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[RuntimeHealth] Initialized.');
    },

    // ============================================================
    // HEALTH METHODS
    // ============================================================

    /**
     * Record boot time
     * @param {number} time - Time in milliseconds
     */
    recordBootTime: function(time) {
        this.healthData.bootTime = time || Date.now();
        this.healthData.lastCheck = Date.now();
    },

    /**
     * Record compose time
     * @param {number} time - Time in milliseconds
     */
    recordComposeTime: function(time) {
        this.healthData.composeTime = time || Date.now();
    },

    /**
     * Record validation time
     * @param {number} time - Time in milliseconds
     */
    recordValidationTime: function(time) {
        this.healthData.validationTime = time || Date.now();
    },

    /**
     * Record health check time
     * @param {number} time - Time in milliseconds
     */
    recordHealthCheckTime: function(time) {
        this.healthData.healthCheckTime = time || Date.now();
    },

    /**
     * Record registry time
     * @param {number} time - Time in milliseconds
     */
    recordRegistryTime: function(time) {
        this.healthData.registryTime = time || Date.now();
    },

    /**
     * Record lifecycle time
     * @param {number} time - Time in milliseconds
     */
    recordLifecycleTime: function(time) {
        this.healthData.lifecycleTime = time || Date.now();
    },

    /**
     * Calculate health score
     * @returns {number} Health score 0-100
     */
    calculateScore: function() {
        var score = 100;
        var data = this.healthData;

        // Check if all times are recorded
        if (!data.bootTime) score -= 20;
        if (!data.composeTime) score -= 10;
        if (!data.validationTime) score -= 10;
        if (!data.registryTime) score -= 10;
        if (!data.lifecycleTime) score -= 10;

        // Check if health check was performed
        if (!data.healthCheckTime) score -= 20;

        // Check if last check is recent (within 5 minutes)
        if (data.lastCheck && (Date.now() - data.lastCheck) > 300000) {
            score -= 10;
        }

        this.healthData.healthScore = Math.max(0, Math.min(100, score));
        
        // Set status
        if (this.healthData.healthScore >= 80) {
            this.healthData.status = 'excellent';
        } else if (this.healthData.healthScore >= 60) {
            this.healthData.status = 'good';
        } else if (this.healthData.healthScore >= 40) {
            this.healthData.status = 'degraded';
        } else {
            this.healthData.status = 'critical';
        }

        return this.healthData.healthScore;
    },

    /**
     * Get health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        this.calculateScore();
        return {
            bootTime: this.healthData.bootTime,
            composeTime: this.healthData.composeTime,
            validationTime: this.healthData.validationTime,
            healthCheckTime: this.healthData.healthCheckTime,
            registryTime: this.healthData.registryTime,
            lifecycleTime: this.healthData.lifecycleTime,
            healthScore: this.healthData.healthScore,
            status: this.healthData.status,
            lastCheck: this.healthData.lastCheck,
            details: this.healthData.details
        };
    },

    /**
     * Get health score
     * @returns {number} Health score
     */
    getScore: function() {
        return this.calculateScore();
    },

    /**
     * Get status
     * @returns {string} Status
     */
    getStatus: function() {
        this.calculateScore();
        return this.healthData.status;
    },

    /**
     * Display health report
     */
    display: function() {
        var h = this.getHealth();
        console.log('═══════════════════════════════════════');
        console.log('   RUNTIME HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Status: ' + h.status.toUpperCase());
        console.log('Health Score: ' + h.healthScore + '%');
        console.log('─────────────────────────────────────');
        console.log('Boot Time: ' + (h.bootTime ? new Date(h.bootTime).toLocaleTimeString() : 'N/A'));
        console.log('Compose Time: ' + (h.composeTime ? new Date(h.composeTime).toLocaleTimeString() : 'N/A'));
        console.log('Validation Time: ' + (h.validationTime ? new Date(h.validationTime).toLocaleTimeString() : 'N/A'));
        console.log('Health Check Time: ' + (h.healthCheckTime ? new Date(h.healthCheckTime).toLocaleTimeString() : 'N/A'));
        console.log('Registry Time: ' + (h.registryTime ? new Date(h.registryTime).toLocaleTimeString() : 'N/A'));
        console.log('Lifecycle Time: ' + (h.lifecycleTime ? new Date(h.lifecycleTime).toLocaleTimeString() : 'N/A'));
        console.log('─────────────────────────────────────');
        
        if (h.healthScore >= 80) {
            console.log('✅ Runtime is healthy.');
        } else if (h.healthScore >= 60) {
            console.log('⚠️ Runtime is degraded.');
        } else {
            console.warn('❌ Runtime needs attention.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Add detail
     * @param {string} key - Detail key
     * @param {*} value - Detail value
     */
    addDetail: function(key, value) {
        this.healthData.details[key] = value;
    },

    /**
     * Get detail
     * @param {string} key - Detail key
     * @returns {*} Detail value
     */
    getDetail: function(key) {
        return this.healthData.details[key];
    },

    /**
     * Reset health data
     */
    reset: function() {
        this.healthData = {
            lastCheck: null,
            bootTime: 0,
            composeTime: 0,
            validationTime: 0,
            healthCheckTime: 0,
            registryTime: 0,
            lifecycleTime: 0,
            healthScore: 100,
            status: 'unknown',
            details: {}
        };
        console.log('[RuntimeHealth] Reset.');
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        this.calculateScore();
        return {
            status: this.healthData.status,
            healthScore: this.healthData.healthScore,
            lastCheck: this.healthData.lastCheck,
            times: {
                boot: this.healthData.bootTime,
                compose: this.healthData.composeTime,
                validation: this.healthData.validationTime,
                healthCheck: this.healthData.healthCheckTime,
                registry: this.healthData.registryTime,
                lifecycle: this.healthData.lifecycleTime
            }
        };
    }
};

// 暴露到全局
window.runtimeHealth = LawAIApp.RuntimeHealth;

console.log('📋 RuntimeHealth ready');
