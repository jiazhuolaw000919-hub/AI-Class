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
      recs.push('Resolve circular dependencies: ' + dep.circularD
