/**
 * Governance Health
 * 
 * Generates governance health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GovernanceHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[GovernanceHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan governance health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[GovernanceHealth] Scanning governance health...');

        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            console.warn('[GovernanceHealth] GovernanceManifest not available.');
            return null;
        }

        var validator = LawAIApp.GovernanceValidator || window.governanceValidator;
        var validatorSummary = validator ? validator.getSummary() : null;

        var records = manifest.getRecords();
        var summary = manifest.getSummary();
        var totalEngines = records.length;

        var healthyCount = 0;
        var incompleteCount = 0;
        var brokenCount = 0;
        var totalRequirements = 0;
        var passedRequirements = 0;

        var engineHealth = [];

        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            
            // Count requirements
            var reqs = [
                r.identity.hasName,
                r.owner.declared,
                r.domain.declared && r.domain.valid,
                r.capability.declared && r.capability.value !== 'undefined',
                r.lifecycle.declared && r.lifecycle.valid,
                r.version.declared && r.version.valid,
                r.health.valid,
                r.maturity.valid
            ];
            
            var passed = 0;
            for (var j = 0; j < reqs.length; j++) {
                totalRequirements++;
                if (reqs[j]) {
                    passed++;
                    passedRequirements++;
                }
            }

            var score = Math.round((passed / reqs.length) * 100);
            var isHealthy = score >= 80;
            var isIncomplete = score >= 50 && score < 80;
            var isBroken = score < 50;

            if (isHealthy) healthyCount++;
            if (isIncomplete) incompleteCount++;
            if (isBroken) brokenCount++;

            engineHealth.push({
                name: r.name,
                score: score,
                passed: passed,
                total: reqs.length,
                healthy: isHealthy,
                incomplete: isIncomplete,
                broken: isBroken,
                requirements: reqs
            });
        }

        var coveragePercentage = totalRequirements > 0 ? Math.round((passedRequirements / totalRequirements) * 100) : 0;
        var overallScore = totalEngines > 0 ? Math.round((healthyCount / totalEngines) * 100) : 0;

        var status = 'EXCELLENT';
        if (overallScore >= 80 && brokenCount === 0) {
            status = 'EXCELLENT';
        } else if (overallScore >= 60) {
            status = 'GOOD';
        } else if (overallScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        // Top healthy engines
        var sorted = engineHealth.slice().sort(function(a, b) { return b.score - a.score; });
        var topHealthy = sorted.slice(0, 5);
        var needsAttention = sorted.filter(function(e) { return e.score < 70; });

        this.healthData = {
            timestamp: Date.now(),
            overallScore: overallScore,
            overallStatus: status,
            coveragePercentage: coveragePercentage,
            totalEngines: totalEngines,
            healthyCount: healthyCount,
            incompleteCount: incompleteCount,
            brokenCount: brokenCount,
            topHealthy: topHealthy,
            needsAttention: needsAttention,
            engineHealth: engineHealth,
            summary: summary,
            violations: validatorSummary ? validatorSummary.violationCount : 0
        };

        this._display();
        return this.healthData;
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   GOVERNANCE HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Governance Score: ' + h.overallScore + '% (' + h.overallStatus + ')');
        console.log('Coverage: ' + h.coveragePercentage + '%');
        console.log('Total Engines: ' + h.totalEngines);
        console.log('✅ Healthy: ' + h.healthyCount);
        console.log('⚠️ Incomplete: ' + h.incompleteCount);
        console.log('❌ Broken: ' + h.brokenCount);
        console.log('📋 Violations: ' + h.violations);
        console.log('─────────────────────────────────────');
        console.log('Top Healthy Engines:');
        for (var i = 0; i < Math.min(5, h.topHealthy.length); i++) {
            console.log('  ✅ ' + h.topHealthy[i].name + ' (' + h.topHealthy[i].score + '%)');
        }
        console.log('─────────────────────────────────────');
        
        if (h.needsAttention.length > 0) {
            console.warn('Needs Attention:');
            for (var j = 0; j < Math.min(5, h.needsAttention.length); j++) {
                console.warn('  ⚠️ ' + h.needsAttention[j].name + ' (' + h.needsAttention[j].score + '%)');
            }
        }

        if (h.brokenCount === 0 && h.incompleteCount === 0) {
            console.log('✅ All engines have excellent governance.');
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
     * Get governance score
     * @returns {number} Governance score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallScore;
    },

    /**
     * Get governance status
     * @returns {string} Governance status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallStatus;
    },

    /**
     * Check if governance is passing
     * @returns {boolean}
     */
    isPassing: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallScore >= 80 && this.healthData.brokenCount === 0;
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
            healthy: this.healthData.healthyCount,
            incomplete: this.healthData.incompleteCount,
            broken: this.healthData.brokenCount,
            coverage: this.healthData.coveragePercentage
        };
    }
};

// 暴露到全局
window.governanceHealth = LawAIApp.GovernanceHealth;

console.log('📋 GovernanceHealth ready');
