/**
 * Engine Audit Health
 * 
 * Generates engine audit health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineAuditHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineAuditHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan audit health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[EngineAuditHealth] Scanning audit health...');

        var manifest = LawAIApp.EngineAuditManifest || window.engineAuditManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            console.warn('[EngineAuditHealth] EngineAuditManifest not available.');
            return null;
        }

        var records = manifest.getRecords();
        var summary = manifest.getSummary();
        var totalEngines = records.length;

        var healthyCount = 0;
        var brokenCount = 0;
        var warningCount = 0;
        var coveredChecks = 0;
        var totalChecks = 0;

        var engineHealth = [];

        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            var issues = this._countIssues(r);
            var isHealthy = issues === 0;

            if (isHealthy) {
                healthyCount++;
            } else {
                brokenCount++;
                if (issues <= 2) warningCount++;
            }

            // Count covered checks
            var checkCount = 0;
            for (var key in r) {
                if (r.hasOwnProperty(key) && typeof r[key] === 'object') {
                    totalChecks++;
                    if (r[key].declared || r[key].valid || r[key].hasName) {
                        coveredChecks++;
                        checkCount++;
                    }
                }
            }

            engineHealth.push({
                name: r.name,
                healthy: isHealthy,
                issues: issues,
                checkCount: checkCount
            });
        }

        var coveragePercentage = totalChecks > 0 ? Math.round((coveredChecks / totalChecks) * 100) : 0;
        var overallScore = totalEngines > 0 ? Math.round((healthyCount / totalEngines) * 100) : 0;

        var status = 'EXCELLENT';
        if (overallScore >= 90 && brokenCount === 0) {
            status = 'EXCELLENT';
        } else if (overallScore >= 70) {
            status = 'GOOD';
        } else if (overallScore >= 50) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        this.healthData = {
            timestamp: Date.now(),
            overallScore: overallScore,
            overallStatus: status,
            totalEngines: totalEngines,
            healthyEngines: healthyCount,
            brokenEngines: brokenCount,
            warningEngines: warningCount,
            coveragePercentage: coveragePercentage,
            engineHealth: engineHealth,
            summary: summary
        };

        this._display();
        return this.healthData;
    },

    /**
     * Count issues in a record
     * @private
     */
    _countIssues: function(record) {
        var count = 0;
        if (!record.identity || !record.identity.hasName) count++;
        if (!record.domain || !record.domain.declared) count++;
        if (!record.capability || !record.capability.declared) count++;
        if (!record.version || !record.version.declared) count++;
        if (!record.owner || !record.owner.declared) count++;
        if (!record.status || !record.status.declared) count++;
        return count;
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   ENGINE AUDIT HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Audit Score: ' + h.overallScore + '% (' + h.overallStatus + ')');
        console.log('Total Engines: ' + h.totalEngines);
        console.log('✅ Healthy: ' + h.healthyEngines);
        console.log('⚠️ Warning: ' + h.warningEngines);
        console.log('❌ Broken: ' + h.brokenEngines);
        console.log('📊 Coverage: ' + h.coveragePercentage + '%');
        console.log('─────────────────────────────────────');

        if (h.brokenEngines > 0) {
            console.warn('Broken Engines:');
            for (var i = 0; i < h.engineHealth.length; i++) {
                if (!h.engineHealth[i].healthy) {
                    console.warn('  ❌ ' + h.engineHealth[i].name + ' (' + h.engineHealth[i].issues + ' issues)');
                }
            }
        }

        if (h.brokenEngines === 0 && h.warningEngines === 0) {
            console.log('✅ All engines pass governance audit.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        if (!this.healthData) this.scan();
        return this.healthData;
    },

    /**
     * Get audit score
     * @returns {number} Audit score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallScore;
    },

    /**
     * Get audit status
     * @returns {string} Audit status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallStatus;
    },

    /**
     * Check if audit passes
     * @returns {boolean}
     */
    isPassing: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallScore >= 80 && this.healthData.brokenEngines === 0;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.overallScore,
            status: this.healthData.overallStatus,
            totalEngines: this.healthData.totalEngines,
            healthy: this.healthData.healthyEngines,
            broken: this.healthData.brokenEngines,
            coverage: this.healthData.coveragePercentage
        };
    }
};

// 暴露到全局
window.engineAuditHealth = LawAIApp.EngineAuditHealth;

console.log('📋 EngineAuditHealth ready');
