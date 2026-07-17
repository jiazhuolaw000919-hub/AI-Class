/**
 * Compliance Health
 * 
 * Generates compliance health scores.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ComplianceHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[ComplianceHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan compliance health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[ComplianceHealth] Scanning compliance...');

        var freezeAudit = LawAIApp.FreezeAudit || window.freezeAudit;
        var complianceValidator = LawAIApp.ComplianceValidator || window.complianceValidator;

        var auditResults = freezeAudit ? freezeAudit.getResults() : null;
        var validatorResults = complianceValidator ? complianceValidator.getSummary() : null;

        var architectureScore = 0;
        var runtimeScore = 0;
        var featureScore = 0;
        var uiScore = 0;
        var engineScore = 0;
        var registryScore = 0;

        if (auditResults) {
            architectureScore = auditResults.architecture ? auditResults.architecture.score || 0 : 0;
            runtimeScore = auditResults.runtime ? auditResults.runtime.score || 0 : 0;
            featureScore = auditResults.features ? auditResults.features.score || 0 : 0;
            uiScore = auditResults.ui ? auditResults.ui.score || 0 : 0;
            engineScore = auditResults.engine ? auditResults.engine.score || 0 : 0;
            registryScore = auditResults.registry ? auditResults.registry.score || 0 : 0;
        }

        var overallScore = Math.round((architectureScore + runtimeScore + featureScore + uiScore + engineScore + registryScore) / 6);

        var violations = validatorResults ? validatorResults.violationCount || 0 : 0;
        var status = 'EXCELLENT';
        if (overallScore >= 90 && violations === 0) {
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
            architectureScore: architectureScore,
            runtimeScore: runtimeScore,
            featureScore: featureScore,
            uiScore: uiScore,
            engineScore: engineScore,
            registryScore: registryScore,
            violations: violations,
            passed: overallScore >= 70 && violations === 0
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
        console.log('   COMPLIANCE HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Overall Status: ' + h.overallStatus);
        console.log('Overall Score: ' + h.overallScore + '%');
        console.log('Violations: ' + h.violations);
        console.log('Pass: ' + (h.passed ? '✅ PASS' : '❌ FAIL'));
        console.log('─────────────────────────────────────');
        console.log('Architecture: ' + h.architectureScore + '%');
        console.log('Runtime: ' + h.runtimeScore + '%');
        console.log('Feature: ' + h.featureScore + '%');
        console.log('UI: ' + h.uiScore + '%');
        console.log('Engine: ' + h.engineScore + '%');
        console.log('Registry: ' + h.registryScore + '%');
        console.log('─────────────────────────────────────');

        if (h.passed) {
            console.log('✅ ALL COMPLIANCE REQUIREMENTS MET');
        } else if (h.overallScore >= 50) {
            console.warn('⚠️ SOME COMPLIANCE REQUIREMENTS NEED ATTENTION');
        } else {
            console.warn('❌ COMPLIANCE REQUIREMENTS NOT MET');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get health data
     * @returns {Object}
     */
    getHealth: function() {
        if (!this.healthData) this.scan();
        return this.healthData;
    },

    /**
     * Get overall score
     * @returns {number}
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallScore;
    },

    /**
     * Get overall status
     * @returns {string}
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.overallStatus;
    },

    /**
     * Check if compliant
     * @returns {boolean}
     */
    isCompliant: function() {
        if (!this.healthData) this.scan();
        return this.healthData.passed;
    },

    /**
     * Get summary
     * @returns {Object}
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.overallScore,
            status: this.healthData.overallStatus,
            passed: this.healthData.passed,
            violations: this.healthData.violations
        };
    }
};

// 暴露到全局
window.complianceHealth = LawAIApp.ComplianceHealth;

console.log('📋 ComplianceHealth ready');
