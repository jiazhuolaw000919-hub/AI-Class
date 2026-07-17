/**
 * Freeze Audit
 * 
 * Audits all architecture components.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.FreezeAudit = {
    initialized: false,
    results: null,

    /**
     * Initialize audit
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[FreezeAudit] Initialized.');
    },

    /**
     * Run full freeze audit
     * @returns {Object} Audit results
     */
    run: function() {
        console.log('[FreezeAudit] Running freeze audit...');

        this.results = {
            timestamp: Date.now(),
            architecture: this._auditArchitecture(),
            runtime: this._auditRuntime(),
            features: this._auditFeatures(),
            ui: this._auditUI(),
            engine: this._auditEngine(),
            registry: this._auditRegistry(),
            recovery: this._auditRecovery(),
            overall: {
                status: 'PASS',
                score: 100,
                warnings: 0,
                failures: 0
            }
        };

        this.results.overall = this._calculateOverall();
        this._display();
        return this.results;
    },

    /**
     * Audit Architecture
     * @private
     */
    _auditArchitecture: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Architecture Guard
        var guard = LawAIApp.ArchitectureGuard || window.architectureGuard;
        if (!guard) {
            issues.push({ type: 'failure', message: 'ArchitectureGuard not found' });
            failures++;
            score -= 30;
        } else if (typeof guard.isCompliant === 'function' && !guard.isCompliant()) {
            issues.push({ type: 'warning', message: 'ArchitectureGuard detected violations' });
            warnings++;
            score -= 15;
        }

        // Check Architecture Validator
        var validator = LawAIApp.ArchitectureValidator || window.architectureValidator;
        if (!validator) {
            issues.push({ type: 'warning', message: 'ArchitectureValidator not found' });
            warnings++;
            score -= 10;
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit Runtime
     * @private
     */
    _auditRuntime: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Runtime Validator
        var validator = LawAIApp.RuntimeValidator || window.runtimeValidator;
        if (!validator) {
            issues.push({ type: 'warning', message: 'RuntimeValidator not found' });
            warnings++;
            score -= 15;
        } else if (typeof validator.isCompliant === 'function' && !validator.isCompliant()) {
            issues.push({ type: 'warning', message: 'RuntimeValidator detected violations' });
            warnings++;
            score -= 15;
        }

        // Check Runtime Manifest
        var manifest = LawAIApp.RuntimeManifest || window.runtimeManifest;
        if (!manifest) {
            issues.push({ type: 'warning', message: 'RuntimeManifest not found' });
            warnings++;
            score -= 10;
        }

        // Check Runtime Health
        var health = LawAIApp.RuntimeHealth || window.runtimeHealth;
        if (health && typeof health.getScore === 'function') {
            var healthScore = health.getScore();
            if (healthScore < 80) {
                issues.push({ type: 'warning', message: 'Runtime health score: ' + healthScore + '%' });
                warnings++;
                score -= 10;
            }
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit Features
     * @private
     */
    _auditFeatures: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Feature Registry
        var registry = LawAIApp.FeatureRegistry || window.featureRegistry;
        if (!registry) {
            issues.push({ type: 'failure', message: 'FeatureRegistry not found' });
            failures++;
            score -= 25;
            return { status: 'FAILED', score: Math.max(0, score), warnings: warnings, failures: failures, issues: issues };
        }

        // Check Feature Health
        var health = LawAIApp.FeatureHealth || window.featureHealth;
        if (health && typeof health.getHealth === 'function') {
            var data = health.getHealth();
            if (data.unhealthyFeatures > 0) {
                issues.push({ type: 'warning', message: data.unhealthyFeatures + ' unhealthy features found' });
                warnings += data.unhealthyFeatures;
                score -= data.unhealthyFeatures * 5;
            }
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit UI
     * @private
     */
    _auditUI: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check UI Registry
        var registry = LawAIApp.UIRegistry || window.uiRegistry;
        if (!registry) {
            issues.push({ type: 'failure', message: 'UIRegistry not found' });
            failures++;
            score -= 25;
            return { status: 'FAILED', score: Math.max(0, score), warnings: warnings, failures: failures, issues: issues };
        }

        // Check UI Health
        var health = LawAIApp.UIHealth || window.uiHealth;
        if (health && typeof health.getHealth === 'function') {
            var data = health.getHealth();
            if (data.unhealthyComponents > 0) {
                issues.push({ type: 'warning', message: data.unhealthyComponents + ' unhealthy UI components found' });
                warnings += data.unhealthyComponents;
                score -= data.unhealthyComponents * 5;
            }
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit Engine
     * @private
     */
    _auditEngine: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Engine Validator
        var validator = LawAIApp.EngineValidator || window.engineValidator;
        if (!validator) {
            issues.push({ type: 'warning', message: 'EngineValidator not found' });
            warnings++;
            score -= 15;
        } else if (typeof validator.isCompliant === 'function' && !validator.isCompliant()) {
            issues.push({ type: 'warning', message: 'EngineValidator detected violations' });
            warnings++;
            score -= 15;
        }

        // Check Engine Health
        var health = LawAIApp.EngineHealth || window.engineHealth;
        if (health && typeof health.getScore === 'function') {
            var healthScore = health.getScore();
            if (healthScore < 80) {
                issues.push({ type: 'warning', message: 'Engine health score: ' + healthScore + '%' });
                warnings++;
                score -= 10;
            }
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit Registry
     * @private
     */
    _auditRegistry: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Registry Validator
        var validator = LawAIApp.RegistryValidator || window.registryValidator;
        if (!validator) {
            issues.push({ type: 'warning', message: 'RegistryValidator not found' });
            warnings++;
            score -= 15;
        } else if (typeof validator.isCompliant === 'function' && !validator.isCompliant()) {
            issues.push({ type: 'warning', message: 'RegistryValidator detected violations' });
            warnings++;
            score -= 15;
        }

        // Check Registry Health
        var health = LawAIApp.RegistryHealth || window.registryHealth;
        if (health && typeof health.getScore === 'function') {
            var healthScore = health.getScore();
            if (healthScore < 80) {
                issues.push({ type: 'warning', message: 'Registry health score: ' + healthScore + '%' });
                warnings++;
                score -= 10;
            }
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Audit Recovery
     * @private
     */
    _auditRecovery: function() {
        var issues = [];
        var warnings = 0;
        var failures = 0;
        var score = 100;

        // Check Recovery Report
        var report = LawAIApp.RecoveryReport || window.recoveryReport;
        if (!report) {
            issues.push({ type: 'warning', message: 'RecoveryReport not found' });
            warnings++;
            score -= 20;
        } else if (typeof report.isHealthy === 'function' && !report.isHealthy()) {
            issues.push({ type: 'warning', message: 'Recovery is not healthy' });
            warnings++;
            score -= 20;
        }

        // Check Architecture Audit
        var audit = LawAIApp.ArchitectureAudit || window.architectureAudit;
        if (!audit) {
            issues.push({ type: 'warning', message: 'ArchitectureAudit not found' });
            warnings++;
            score -= 10;
        }

        return {
            status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAILED',
            score: Math.max(0, score),
            warnings: warnings,
            failures: failures,
            issues: issues
        };
    },

    /**
     * Calculate overall results
     * @private
     */
    _calculateOverall: function() {
        var sections = ['architecture', 'runtime', 'features', 'ui', 'engine', 'registry', 'recovery'];
        var totalScore = 0;
        var totalWarnings = 0;
        var totalFailures = 0;
        var failedSections = [];

        for (var i = 0; i < sections.length; i++) {
            var key = sections[i];
            var section = this.results[key];
            if (section) {
                totalScore += section.score;
                totalWarnings += section.warnings || 0;
                totalFailures += section.failures || 0;
                if (section.status === 'FAILED') {
                    failedSections.push(key);
                }
            }
        }

        var avgScore = Math.round(totalScore / sections.length);
        var status = 'PASS';
        if (failedSections.length > 0 || avgScore < 50) {
            status = 'FAILED';
        } else if (totalWarnings > 0 || avgScore < 80) {
            status = 'WARNING';
        }

        return {
            status: status,
            score: avgScore,
            warnings: totalWarnings,
            failures: totalFailures,
            failedSections: failedSections
        };
    },

    /**
     * Display audit results
     * @private
     */
    _display: function() {
        var r = this.results;
        console.log('═══════════════════════════════════════');
        console.log('   FREEZE AUDIT');
        console.log('═══════════════════════════════════════');
        console.log('Overall Status: ' + r.overall.status);
        console.log('Overall Score: ' + r.overall.score + '%');
        console.log('Warnings: ' + r.overall.warnings);
        console.log('Failures: ' + r.overall.failures);
        console.log('─────────────────────────────────────');

        var sections = [
            { name: 'Architecture', data: r.architecture },
            { name: 'Runtime', data: r.runtime },
            { name: 'Features', data: r.features },
            { name: 'UI', data: r.ui },
            { name: 'Engine', data: r.engine },
            { name: 'Registry', data: r.registry },
            { name: 'Recovery', data: r.recovery }
        ];

        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            var icon = s.data.status === 'PASS' ? '✅' : s.data.status === 'WARNING' ? '⚠️' : '❌';
            console.log(icon + ' ' + s.name + ': ' + s.data.status + ' (' + s.data.score + '%)');
        }

        console.log('─────────────────────────────────────');
        if (r.overall.status === 'PASS') {
            console.log('✅ ALL SECTIONS PASS');
        } else if (r.overall.status === 'WARNING') {
            console.warn('⚠️ SECTIONS HAVE WARNINGS');
        } else {
            console.warn('❌ SECTIONS HAVE FAILURES');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get results
     * @returns {Object} Audit results
     */
    getResults: function() {
        if (!this.results) this.run();
        return this.results;
    },

    /**
     * Get overall status
     * @returns {string} PASS | WARNING | FAILED
     */
    getStatus: function() {
        if (!this.results) this.run();
        return this.results.overall.status;
    },

    /**
     * Get overall score
     * @returns {number} Score 0-100
     */
    getScore: function() {
        if (!this.results) this.run();
        return this.results.overall.score;
    },

    /**
     * Check if audit passed
     * @returns {boolean}
     */
    isPassed: function() {
        if (!this.results) this.run();
        return this.results.overall.status === 'PASS';
    }
};

// 暴露到全局
window.freezeAudit = LawAIApp.FreezeAudit;

console.log('📋 FreezeAudit ready');
