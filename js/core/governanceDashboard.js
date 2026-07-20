/**
 * Governance Dashboard
 * 
 * Generates read-only governance summaries.
 * No editing capabilities.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GovernanceDashboard = {
    initialized: false,
    dashboardData: null,

    /**
     * Initialize dashboard
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[GovernanceDashboard] Initialized.');
        this.generate();
    },

    /**
     * Generate dashboard data
     * @returns {Object} Dashboard data
     */
    generate: function() {
        console.log('[GovernanceDashboard] Generating dashboard...');

        var health = LawAIApp.GovernanceHealth || window.governanceHealth;
        var manifest = LawAIApp.GovernanceManifest || window.governanceManifest;
        var validator = LawAIApp.GovernanceValidator || window.governanceValidator;

        if (!health || !manifest) {
            console.warn('[GovernanceDashboard] Dependencies not available.');
            return null;
        }

        var healthData = health.getHealth();
        var manifestSummary = manifest.getSummary();
        var validatorSummary = validator ? validator.getSummary() : null;

        this.dashboardData = {
            timestamp: Date.now(),
            engineCount: {
                total: healthData.totalEngines || 0,
                healthy: healthData.healthyCount || 0,
                incomplete: healthData.incompleteCount || 0,
                broken: healthData.brokenCount || 0
            },
            governanceScore: {
                overall: healthData.overallScore || 0,
                status: healthData.overallStatus || 'unknown',
                coverage: healthData.coveragePercentage || 0
            },
            maturityDistribution: {
                core: manifestSummary.core || 0,
                business: manifestSummary.business || 0,
                support: manifestSummary.support || 0,
                experimental: manifestSummary.experimental || 0,
                deprecated: manifestSummary.deprecated || 0
            },
            domainDistribution: manifestSummary.domains || {},
            topHealthy: healthData.topHealthy || [],
            needsAttention: healthData.needsAttention || [],
            violations: {
                count: healthData.violations || 0,
                details: validatorSummary ? validatorSummary.violationsByType : {}
            },
            recommendations: this._generateRecommendations(healthData)
        };

        this._display();
        return this.dashboardData;
    },

    /**
     * Generate recommendations
     * @private
     */
    _generateRecommendations: function(healthData) {
        var recs = [];

        if (healthData.brokenCount > 0) {
            recs.push('Fix ' + healthData.brokenCount + ' broken engines');
        }

        if (healthData.incompleteCount > 0) {
            recs.push('Complete ' + healthData.incompleteCount + ' incomplete engines');
        }

        if (healthData.coveragePercentage < 80) {
            recs.push('Improve governance coverage from ' + healthData.coveragePercentage + '% to 80%+');
        }

        if (healthData.overallScore < 70) {
            recs.push('Address governance violations to improve score');
        }

        if (recs.length === 0) {
            recs.push('All engines have excellent governance.');
        }

        return recs;
    },

    /**
     * Display dashboard
     * @private
     */
    _display: function() {
        var d = this.dashboardData;
        console.log('═══════════════════════════════════════');
        console.log('   GOVERNANCE DASHBOARD');
        console.log('═══════════════════════════════════════');
        console.log('Governance Score: ' + d.governanceScore.overall + '% (' + d.governanceScore.status + ')');
        console.log('Coverage: ' + d.governanceScore.coverage + '%');
        console.log('─────────────────────────────────────');
        console.log('Engine Count:');
        console.log('  Total: ' + d.engineCount.total);
        console.log('  ✅ Healthy: ' + d.engineCount.healthy);
        console.log('  ⚠️ Incomplete: ' + d.engineCount.incomplete);
        console.log('  ❌ Broken: ' + d.engineCount.broken);
        console.log('─────────────────────────────────────');
        console.log('Maturity Distribution:');
        console.log('  Core: ' + d.maturityDistribution.core);
        console.log('  Business: ' + d.maturityDistribution.business);
        console.log('  Support: ' + d.maturityDistribution.support);
        console.log('  Experimental: ' + d.maturityDistribution.experimental);
        console.log('  Deprecated: ' + d.maturityDistribution.deprecated);
        console.log('─────────────────────────────────────');
        console.log('Top Healthy:');
        for (var i = 0; i < Math.min(3, d.topHealthy.length); i++) {
            console.log('  ✅ ' + d.topHealthy[i].name + ' (' + d.topHealthy[i].score + '%)');
        }
        
        if (d.needsAttention.length > 0) {
            console.log('─────────────────────────────────────');
            console.warn('Needs Attention:');
            for (var j = 0; j < Math.min(3, d.needsAttention.length); j++) {
                console.warn('  ⚠️ ' + d.needsAttention[j].name + ' (' + d.needsAttention[j].score + '%)');
            }
        }
        console.log('─────────────────────────────────────');
        console.log('Recommendations:');
        for (var k = 0; k < d.recommendations.length; k++) {
            console.log('  • ' + d.recommendations[k]);
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get dashboard data
     * @returns {Object} Dashboard data
     */
    getDashboard: function() {
        if (!this.dashboardData) this.generate();
        return this.dashboardData;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.dashboardData) this.generate();
        return {
            score: this.dashboardData.governanceScore.overall,
            status: this.dashboardData.governanceScore.status,
            totalEngines: this.dashboardData.engineCount.total,
            healthy: this.dashboardData.engineCount.healthy,
            broken: this.dashboardData.engineCount.broken,
            coverage: this.dashboardData.governanceScore.coverage
        };
    }
};

// 暴露到全局
window.governanceDashboard = LawAIApp.GovernanceDashboard;

console.log('📋 GovernanceDashboard ready');
