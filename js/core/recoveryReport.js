/**
 * Recovery Report
 * 
 * Collects all audit results and generates a comprehensive
 * Recovery Health Report.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RecoveryReport = {
  report: null,
  initialized: false,

  /**
   * Initialize report generator
   */
  init: function() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[RecoveryReport] Initialized.');
  },

  /**
   * Generate complete recovery report
   * @returns {Object} Recovery report
   */
  generate: function() {
    console.log('[RecoveryReport] Generating report...');
    
    // Run all audits
    var archAudit = LawAIApp.ArchitectureAudit || window.architectureAudit;
    var depAudit = LawAIApp.DependencyAudit || window.dependencyAudit;
    var modAudit = LawAIApp.ModuleAudit || window.moduleAudit;
    
    var archResult = archAudit ? archAudit.run() : null;
    var depResult = depAudit ? depAudit.run() : null;
    var modResult = modAudit ? modAudit.run() : null;
    
    // Get Feature and UI health
    var featureHealth = LawAIApp.FeatureHealth || window.featureHealth;
    var uiHealth = LawAIApp.UIHealth || window.uiHealth;
    
    var featureScore = featureHealth ? featureHealth.getScore() : 0;
    var uiScore = uiHealth ? uiHealth.getScore() : 0;
    
    // Calculate scores
    var archScore = archResult ? archResult.overall.score : 0;
    var depScore = depResult ? depResult.score : 0;
    var modScore = modResult ? modResult.score : 0;
    
    // Overall recovery score
    var scores = [archScore, depScore, modScore, featureScore, uiScore];
    var validScores = scores.filter(function(s) { return s > 0; });
    var overallScore = validScores.length > 0 
      ? Math.round(validScores.reduce(function(a, b) { return a + b; }, 0) / validScores.length)
      : 0;
    
    var overallStatus = overallScore >= 80 ? 'excellent' 
      : overallScore >= 60 ? 'good' 
      : overallScore >= 40 ? 'degraded' 
      : 'critical';
    
    var pass = overallScore >= 70;
    
    this.report = {
      timestamp: Date.now(),
      version: '1.0.0',
      overall: {
        score: overallScore,
        status: overallStatus,
        pass: pass
      },
      sections: {
        architecture: {
          score: archScore,
          status: archResult ? archResult.overall.status : 'unknown',
          warnings: archResult ? archResult.overall.warnings : 0,
          errors: archResult ? archResult.overall.errors : 0
        },
        dependencies: {
          score: depScore,
          status: depResult ? depResult.status : 'unknown',
          missing: depResult ? depResult.missingDependencies.length : 0,
          circular: depResult ? depResult.circularDependencies.length : 0
        },
        modules: {
          score: modScore,
          status: modResult ? modResult.status : 'unknown',
          total: modResult ? modResult.totalModules : 0,
          unused: modResult ? modResult.unusedModules.length : 0,
          deprecated: modResult ? modResult.deprecatedModules.length : 0,
          broken: modResult ? modResult.brokenModules.length : 0
        },
        features: {
          score: featureScore,
          status: featureScore >= 80 ? 'healthy' : featureScore >= 50 ? 'degraded' : 'critical'
        },
        ui: {
          score: uiScore,
          status: uiScore >= 80 ? 'healthy' : uiScore >= 50 ? 'degraded' : 'critical'
        }
      },
      recommendations: this._generateRecommendations(archResult, depResult, modResult)
    };
    
    this._display();
    return this.report;
  },

  /**
   * Generate recommendations
   */
  _generateRecommendations: function(arch, dep, mod) {
    var recs = [];
    
    if (arch && arch.overall.errors > 0) {
      recs.push('Fix architecture errors: ' + arch.overall.errors + ' errors found');
    }
    if (arch && arch.overall.warnings > 0) {
      recs.push('Review architecture warnings: ' + arch.overall.warnings + ' warnings found');
    }
    if (dep && dep.missingDependencies.length > 0) {
      recs.push('Fix missing dependencies: ' + dep.missingDependencies.length + ' missing');
    }
    if (dep && dep.circularDependencies.length > 0) {
      recs.push('Resolve circular dependencies: ' + dep.circularDependencies.length + ' found');
    }
    if (mod && mod.unusedModules.length > 0) {
      recs.push('Review unused modules: ' + mod.unusedModules.length + ' modules not used');
    }
    if (mod && mod.brokenModules.length > 0) {
      recs.push('Fix broken modules: ' + mod.brokenModules.length + ' modules broken');
    }
    
    if (recs.length === 0) {
      recs.push('All systems healthy. No recommendations.');
    }
    
    return recs;
  },

  /**
   * Display report in console
   */
  _display: function() {
    var r = this.report;
    console.log('═══════════════════════════════════════');
    console.log('   RECOVERY HEALTH REPORT');
    console.log('═══════════════════════════════════════');
    console.log('Version: ' + r.version);
    console.log('Timestamp: ' + new Date(r.timestamp).toLocaleString());
    console.log('─────────────────────────────────────');
    console.log('Overall Score: ' + r.overall.score + '% (' + r.overall.status + ')');
    console.log('Pass: ' + (r.overall.pass ? '✅ PASS' : '❌ FAIL'));
    console.log('─────────────────────────────────────');
    
    var sections = [
      { name: 'Architecture', data: r.sections.architecture },
      { name: 'Dependencies', data: r.sections.dependencies },
      { name: 'Modules', data: r.sections.modules },
      { name: 'Features', data: r.sections.features },
      { name: 'UI', data: r.sections.ui }
    ];
    
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var icon = s.data.score >= 80 ? '✅' : s.data.score >= 50 ? '⚠️' : '❌';
      console.log(icon + ' ' + s.name + ': ' + s.data.score + '% (' + s.data.status + ')');
    }
    
    console.log('─────────────────────────────────────');
    console.log('Recommendations:');
    for (var j = 0; j < r.recommendations.length; j++) {
      console.log('  • ' + r.recommendations[j]);
    }
    console.log('═══════════════════════════════════════');
    
    if (r.overall.pass) {
      console.log('✅ RECOVERY HEALTH PASS');
    } else {
      console.warn('⚠️ RECOVERY HEALTH NEEDS ATTENTION');
    }
  },

  /**
   * Get report
   */
  getReport: function() {
    if (!this.report) this.generate();
    return this.report;
  },

  /**
   * Get summary
   */
  getSummary: function() {
    if (!this.report) this.generate();
    return {
      score: this.report.overall.score,
      status: this.report.overall.status,
      pass: this.report.overall.pass,
      recommendations: this.report.recommendations.length
    };
  },

  /**
   * Get score
   */
  getScore: function() {
    if (!this.report) this.generate();
    return this.report.overall.score;
  },

  /**
   * Check if recovery is healthy
   */
  isHealthy: function() {
    if (!this.report) this.generate();
    return this.report.overall.pass;
  }
};

// 暴露到全局
window.recoveryReport = LawAIApp.RecoveryReport;

console.log('📊 RecoveryReport ready');
