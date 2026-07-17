/**
 * Engine Audit Report
 * 
 * Generates comprehensive audit reports.
 * Read only - no business logic.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineAuditReport = {
    initialized: false,
    report: null,

    /**
     * Initialize report generator
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[EngineAuditReport] Initialized.');
    },

    /**
     * Generate audit report
     * @returns {Object} Audit report
     */
    generate: function() {
        console.log('[EngineAuditReport] Generating audit report...');

        var auditManifest = LawAIApp.EngineAuditManifest || window.engineAuditManifest;
        var auditHealth = LawAIApp.EngineAuditHealth || window.engineAuditHealth;
        var auditValidator = LawAIApp.EngineAuditValidator || window.engineAuditValidator;

        var summary = auditManifest ? auditManifest.getSummary() : null;
        var health = auditHealth ? auditHealth.getHealth() : null;
        var validatorSummary = auditValidator ? auditValidator.getSummary() : null;

        var recommendations = this._generateRecommendations(summary, health, validatorSummary);

        this.report = {
            timestamp: Date.now(),
            version: '1.0.0',
            developerSummary: {
                totalEngines: summary ? summary.totalEngines : 0,
                passingEngines: summary ? summary.passingEngines : 0,
                failingEngines: summary ? summary.failingEngines : 0,
                auditScore: health ? health.overallScore : 0,
                auditStatus: health ? health.overallStatus : 'unknown'
            },
            healthSummary: {
                healthyEngines: health ? health.healthyEngines : 0,
                warningEngines: health ? health.warningEngines : 0,
                brokenEngines: health ? health.brokenEngines : 0,
                coveragePercentage: health ? health.coveragePercentage : 0
            },
            coverageSummary: {
                identity: this._getCoverage('identity'),
                domain: this._getCoverage('domain'),
                dependency: this._getCoverage('dependency'),
                capability: this._getCoverage('capability'),
                lifecycle: this._getCoverage('lifecycle'),
                version: this._getCoverage('version'),
                health: this._getCoverage('health'),
                owner: this._getCoverage('owner'),
                status: this._getCoverage('status')
            },
            recommendations: recommendations,
            violations: validatorSummary ? validatorSummary.violationsByType : {}
        };

        this._display();
        return this.report;
    },

    /**
     * Get coverage for a specific check
     * @private
     */
    _getCoverage: function(checkName) {
        var manifest = LawAIApp.EngineAuditManifest || window.engineAuditManifest;
        if (!manifest || typeof manifest.getRecords !== 'function') {
            return { covered: 0, total: 0, percentage: 0 };
        }

        var records = manifest.getRecords();
        var total = records.length;
        var covered = 0;

        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            if (r[checkName]) {
                var hasCheck = false;
                for (var key in r[checkName]) {
                    if (r[checkName][key] === true) {
                        hasCheck = true;
                        break;
                    }
                }
                if (hasCheck) covered++;
            }
        }

        return {
            covered: covered,
            total: total,
            percentage: total > 0 ? Math.round((covered / total) * 100) : 0
        };
    },

    /**
     * Generate recommendations
     * @private
     */
    _generateRecommendations: function(summary, health, validatorSummary) {
        var recs = [];

        if (summary && summary.failingEngines > 0) {
            recs.push('Fix ' + summary.failingEngines + ' failing engines');
        }

        if (health && health.brokenEngines > 0) {
            recs.push('Address ' + health.brokenEngines + ' broken engines');
        }

        if (health && health.coveragePercentage < 80) {
            recs.push('Improve audit coverage from ' + health.coveragePercentage + '% to 80%+');
        }

        if (validatorSummary && validatorSummary.violationCount > 0) {
            var types = validatorSummary.violationsByType;
            for (var type in types) {
                recs.push('Resolve ' + types[type] + ' ' + type + ' violations');
            }
        }

        if (recs.length === 0) {
            recs.push('All engines pass governance audit.');
        }

        return recs;
    },

    /**
     * Display report
     * @private
     */
    _display: function() {
        var r = this.report;
        console.log('═══════════════════════════════════════');
        console.log('   ENGINE AUDIT REPORT');
        console.log('═══════════════════════════════════════');
        console.log('Audit Score: ' + r.developerSummary.auditScore + '% (' + r.developerSummary.auditStatus + ')');
        console.log('Total Engines: ' + r.developerSummary.totalEngines);
        console.log('✅ Passing: ' + r.developerSummary.passingEngines);
        console.log('❌ Failing: ' + r.developerSummary.failingEngines);
        console.log('─────────────────────────────────────');
        console.log('Coverage:');
        console.log('  Identity: ' + r.coverageSummary.identity.percentage + '%');
        console.log('  Domain: ' + r.coverageSummary.domain.percentage + '%');
        console.log('  Capability: ' + r.coverageSummary.capability.percentage + '%');
        console.log('  Version: ' + r.coverageSummary.version.percentage + '%');
        console.log('  Owner: ' + r.coverageSummary.owner.percentage + '%');
        console.log('  Status: ' + r.coverageSummary.status.percentage + '%');
        console.log('─────────────────────────────────────');
        console.log('Recommendations:');
        for (var i = 0; i < r.recommendations.length; i++) {
            console.log('  • ' + r.recommendations[i]);
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get report
     * @returns {Object} Report
     */
    getReport: function() {
        if (!this.report) this.generate();
        return this.report;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.report) this.generate();
        return {
            score: this.report.developerSummary.auditScore,
            status: this.report.developerSummary.auditStatus,
            totalEngines: this.report.developerSummary.totalEngines,
            passing: this.report.developerSummary.passingEngines,
            failing: this.report.developerSummary.failingEngines
        };
    }
};

// 暴露到全局
window.engineAuditReport = LawAIApp.EngineAuditReport;

console.log('📋 EngineAuditReport ready');
