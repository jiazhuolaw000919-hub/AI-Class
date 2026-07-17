/**
 * Registry Health
 * 
 * Tracks health of all registries.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RegistryHealth = {
    healthData: {
        lastCheck: null,
        totalRegistries: 0,
        healthyRegistries: 0,
        duplicateRegistries: 0,
        unusedRegistries: 0,
        invalidRegistrations: 0,
        registryDetails: [],
        healthScore: 100
    },
    initialized: false,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[RegistryHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan registry health
     */
    scan: function() {
        console.log('[RegistryHealth] Scanning registries...');

        var manifest = LawAIApp.RegistryManifest || window.registryManifest;
        if (!manifest || typeof manifest.getRegistries !== 'function') {
            console.warn('[RegistryHealth] RegistryManifest not available.');
            return;
        }

        var registries = manifest.getRegistries();
        var validator = LawAIApp.RegistryValidator || window.registryValidator;
        var warnings = (validator && typeof validator.getViolations === 'function') ? validator.getViolations() : [];

        this.healthData.lastCheck = Date.now();
        this.healthData.totalRegistries = registries.length;
        this.healthData.healthyRegistries = 0;
        this.healthData.duplicateRegistries = 0;
        this.healthData.unusedRegistries = 0;
        this.healthData.invalidRegistrations = 0;
        this.healthData.registryDetails = [];

        for (var i = 0; i < registries.length; i++) {
            var r = registries[i];
            var isHealthy = r.exists && r.hasMeta && r.status !== 'deprecated';
            var isUsed = r.objectCount > 0;
            var hasInvalidRegistrations = false;

            // Check for duplicate registrations
            if (warnings && warnings.length > 0) {
                for (var j = 0; j < warnings.length; j++) {
                    if (warnings[j].type === 'duplicate_registration' && warnings[j].registry === r.name) {
                        this.healthData.duplicateRegistries++;
                    }
                }
            }

            if (isHealthy) {
                this.healthData.healthyRegistries++;
            }

            if (!isUsed && r.exists) {
                this.healthData.unusedRegistries++;
            }

            this.healthData.registryDetails.push({
                name: r.name,
                exists: r.exists,
                healthy: isHealthy,
                used: isUsed,
                objectCount: r.objectCount,
                domain: r.domain,
                status: r.status,
                hasMeta: r.hasMeta
            });
        }

        // Count invalid registrations from warnings
        if (warnings) {
            for (var k = 0; k < warnings.length; k++) {
                if (warnings[k].type === 'cross_domain_registration' || 
                    warnings[k].type === 'illegal_ownership') {
                    this.healthData.invalidRegistrations++;
                }
            }
        }

        // Calculate health score
        var total = this.healthData.totalRegistries;
        var healthy = this.healthData.healthyRegistries;
        if (total > 0) {
            this.healthData.healthScore = Math.round((healthy / total) * 100);
        } else {
            this.healthData.healthScore = 0;
        }

        this._display();
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   REGISTRY HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Total Registries:     ' + h.totalRegistries);
        console.log('✅ Healthy:           ' + h.healthyRegistries);
        console.log('🔄 Duplicate:         ' + h.duplicateRegistries);
        console.log('📭 Unused:            ' + h.unusedRegistries);
        console.log('❌ Invalid Registrations: ' + h.invalidRegistrations);
        console.log('📊 Health Score:      ' + h.healthScore + '%');
        console.log('─────────────────────────────────────');

        // List unhealthy registries
        var unhealthy = h.registryDetails.filter(function(r) { return !r.healthy && r.exists; });
        if (unhealthy.length > 0) {
            console.warn('Unhealthy Registries:');
            for (var i = 0; i < unhealthy.length; i++) {
                console.warn('  ' + unhealthy[i].name + ' (status: ' + unhealthy[i].status + ')');
            }
        }

        // List unused registries
        var unused = h.registryDetails.filter(function(r) { return !r.used && r.exists; });
        if (unused.length > 0) {
            console.warn('Unused Registries:');
            for (var j = 0; j < unused.length; j++) {
                console.warn('  ' + unused[j].name + ' (0 objects registered)');
            }
        }

        if (unhealthy.length === 0 && unused.length === 0) {
            console.log('✅ All registries are healthy.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        return {
            totalRegistries: this.healthData.totalRegistries,
            healthyRegistries: this.healthData.healthyRegistries,
            duplicateRegistries: this.healthData.duplicateRegistries,
            unusedRegistries: this.healthData.unusedRegistries,
            invalidRegistrations: this.healthData.invalidRegistrations,
            healthScore: this.healthData.healthScore,
            lastCheck: this.healthData.lastCheck,
            registryDetails: this.healthData.registryDetails.slice()
        };
    },

    /**
     * Get health score
     * @returns {number} Health score
     */
    getScore: function() {
        return this.healthData.healthScore;
    },

    /**
     * Check if all registries are healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        return this.healthData.healthScore === 100 && this.healthData.duplicateRegistries === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        return {
            timestamp: this.healthData.lastCheck,
            totalRegistries: this.healthData.totalRegistries,
            healthScore: this.healthData.healthScore,
            healthy: this.healthData.healthyRegistries,
            duplicate: this.healthData.duplicateRegistries,
            unused: this.healthData.unusedRegistries
        };
    }
};

// 暴露到全局
window.registryHealth = LawAIApp.RegistryHealth;

console.log('📋 RegistryHealth ready');
