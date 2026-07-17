/**
 * Architecture Audit Engine
 * 
 * Audits the entire architecture including runtime, features, UI, domains, and layers.
 * Audit only - no fixing.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ArchitectureAudit = {
  results: null,
  initialized: false,

  /**
   * Initialize audit engine
   */
  init: function() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[ArchitectureAudit] Initialized.');
  },

  /**
   * Run full architecture audit
   * @returns {Object} Audit results
   */
  run: function() {
    console.log('[ArchitectureAudit] Running full audit...');
    
    var startTime = Date.now();
    
    this.results = {
      timestamp: startTime,
      duration: 0,
      architecture: this._auditArchitecture(),
      runtime: this._auditRuntime(),
      features: this._auditFeatures(),
      ui: this._auditUI(),
      domains: this._auditDomains(),
      layers: this._auditLayers(),
      overall: {
        score: 0,
        status: 'unknown',
        warnings: 0,
        errors: 0
      }
    };
    
    this.results.duration = Date.now() - startTime;
    this.results.overall = this._calculateOverall();
    
    console.log('[ArchitectureAudit] Audit complete in ' + this.results.duration + 'ms');
    return this.results;
  },

  /**
   * Audit Architecture
   */
  _auditArchitecture: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    // Check Domain Registry
    var domainRegistry = LawAIApp.DomainRegistry || window.domainRegistry;
    if (!domainRegistry || typeof domainRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'DomainRegistry not available' });
      errors++;
      score -= 20;
    } else {
      var domains = domainRegistry.list();
      if (domains.length === 0) {
        issues.push({ type: 'warning', message: 'No domains registered' });
        warnings++;
        score -= 10;
      }
    }

    // Check Layer Registry
    var layerRegistry = LawAIApp.LayerRegistry || window.layerRegistry;
    if (!layerRegistry || typeof layerRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'LayerRegistry not available' });
      errors++;
      score -= 20;
    } else {
      var layers = layerRegistry.list();
      if (Object.keys(layers).length === 0) {
        issues.push({ type: 'warning', message: 'No layers registered' });
        warnings++;
        score -= 10;
      }
    }

    // Check Architecture Validator
    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (!archValidator) {
      issues.push({ type: 'warning', message: 'ArchitectureValidator not available' });
      warnings++;
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Audit Runtime
   */
  _auditRuntime: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    // Check Runtime Kernel
    var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
    if (!runtimeKernel || typeof runtimeKernel.isReady !== 'function') {
      issues.push({ type: 'error', message: 'RuntimeKernel not available or incomplete' });
      errors++;
      score -= 25;
    } else if (!runtimeKernel.isReady()) {
      issues.push({ type: 'warning', message: 'RuntimeKernel not ready' });
      warnings++;
      score -= 15;
    }

    // Check Runtime Status
    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    if (!runtimeStatus || typeof runtimeStatus.getStatus !== 'function') {
      issues.push({ type: 'warning', message: 'RuntimeStatus not available' });
      warnings++;
      score -= 10;
    }

    // Check Runtime Registry
    var runtimeRegistry = LawAIApp.RuntimeRegistry || window.runtimeRegistry;
    if (!runtimeRegistry || typeof runtimeRegistry.getAll !== 'function') {
      issues.push({ type: 'warning', message: 'RuntimeRegistry not available' });
      warnings++;
      score -= 10;
    } else {
      var modules = runtimeRegistry.getAll();
      if (modules.length === 0) {
        issues.push({ type: 'warning', message: 'No runtime modules registered' });
        warnings++;
        score -= 10;
      }
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Audit Features
   */
  _auditFeatures: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    // Check Feature Registry
    var featureRegistry = LawAIApp.FeatureRegistry || window.featureRegistry;
    if (!featureRegistry || typeof featureRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'FeatureRegistry not available' });
      errors++;
      score -= 25;
      return { score: Math.max(0, score), status: 'critical', warnings: warnings, errors: errors, issues: issues };
    }

    var features = featureRegistry.list();
    if (features.length === 0) {
      issues.push({ type: 'warning', message: 'No features registered' });
      warnings++;
      score -= 10;
    }

    // Check Feature Health
    var featureHealth = LawAIApp.FeatureHealth || window.featureHealth;
    if (featureHealth && typeof featureHealth.getHealth === 'function') {
      var health = featureHealth.getHealth();
      if (health.unhealthyFeatures > 0) {
        issues.push({ type: 'warning', message: health.unhealthyFeatures + ' unhealthy features found' });
        warnings += health.unhealthyFeatures;
        score -= health.unhealthyFeatures * 5;
      }
    }

    // Check Feature Validator
    var featureValidator = LawAIApp.FeatureValidator || window.featureValidator;
    if (featureValidator && typeof featureValidator.getWarnings === 'function') {
      var warningsList = featureValidator.getWarnings();
      if (warningsList.length > 0) {
        issues.push({ type: 'warning', message: warningsList.length + ' feature warnings found' });
        warnings += warningsList.length;
        score -= warningsList.length * 2;
      }
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Audit UI
   */
  _auditUI: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    // Check UI Registry
    var uiRegistry = LawAIApp.UIRegistry || window.uiRegistry;
    if (!uiRegistry || typeof uiRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'UIRegistry not available' });
      errors++;
      score -= 25;
      return { score: Math.max(0, score), status: 'critical', warnings: warnings, errors: errors, issues: issues };
    }

    var components = uiRegistry.list();
    if (components.length === 0) {
      issues.push({ type: 'warning', message: 'No UI components registered' });
      warnings++;
      score -= 10;
    }

    // Check UI Health
    var uiHealth = LawAIApp.UIHealth || window.uiHealth;
    if (uiHealth && typeof uiHealth.getHealth === 'function') {
      var health = uiHealth.getHealth();
      if (health.unhealthyComponents > 0) {
        issues.push({ type: 'warning', message: health.unhealthyComponents + ' unhealthy UI components found' });
        warnings += health.unhealthyComponents;
        score -= health.unhealthyComponents * 5;
      }
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Audit Domains
   */
  _auditDomains: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    var domainRegistry = LawAIApp.DomainRegistry || window.domainRegistry;
    if (!domainRegistry || typeof domainRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'DomainRegistry not available' });
      errors++;
      score -= 30;
      return { score: Math.max(0, score), status: 'critical', warnings: warnings, errors: errors, issues: issues };
    }

    var domains = domainRegistry.list();
    if (domains.length === 0) {
      issues.push({ type: 'warning', message: 'No domains registered' });
      warnings++;
      score -= 20;
    }

    // Check for duplicate domains
    var names = domains.map(function(d) { return d.name; });
    var duplicates = names.filter(function(name, index) {
      return names.indexOf(name) !== index;
    });
    if (duplicates.length > 0) {
      issues.push({ type: 'warning', message: 'Duplicate domains found: ' + duplicates.join(', ') });
      warnings += duplicates.length;
      score -= duplicates.length * 10;
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Audit Layers
   */
  _auditLayers: function() {
    var issues = [];
    var warnings = 0;
    var errors = 0;
    var score = 100;

    var layerRegistry = LawAIApp.LayerRegistry || window.layerRegistry;
    if (!layerRegistry || typeof layerRegistry.list !== 'function') {
      issues.push({ type: 'error', message: 'LayerRegistry not available' });
      errors++;
      score -= 30;
      return { score: Math.max(0, score), status: 'critical', warnings: warnings, errors: errors, issues: issues };
    }

    var layers = layerRegistry.list();
    var layerNames = Object.keys(layers);
    if (layerNames.length === 0) {
      issues.push({ type: 'warning', message: 'No layers registered' });
      warnings++;
      score -= 20;
    }

    // Expected layers
    var expectedLayers = ['App', 'Core', 'Feature', 'Content', 'UI', 'AI'];
    var missingLayers = expectedLayers.filter(function(el) {
      return layerNames.indexOf(el) === -1;
    });
    if (missingLayers.length > 0) {
      issues.push({ type: 'warning', message: 'Missing expected layers: ' + missingLayers.join(', ') });
      warnings += missingLayers.length;
      score -= missingLayers.length * 10;
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      warnings: warnings,
      errors: errors,
      issues: issues
    };
  },

  /**
   * Calculate overall score
   */
  _calculateOverall: function() {
    var scores = [
      this.results.architecture.score,
      this.results.runtime.score,
      this.results.features.score,
      this.results.ui.score,
      this.results.domains.score,
      this.results.layers.score
    ];
    
    var totalWarnings = 0;
    var totalErrors = 0;
    
    for (var key in this.results) {
      if (this.results[key] && typeof this.results[key] === 'object') {
        if (this.results[key].warnings) totalWarnings += this.results[key].warnings;
        if (this.results[key].errors) totalErrors += this.results[key].errors;
      }
    }
    
    var avgScore = Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);
    
    var status = 'unknown';
    if (avgScore >= 85) status = 'excellent';
    else if (avgScore >= 70) status = 'good';
    else if (avgScore >= 50) status = 'degraded';
    else status = 'critical';
    
    return {
      score: avgScore,
      status: status,
      warnings: totalWarnings,
      errors: totalErrors,
      pass: avgScore >= 70 && totalErrors === 0
    };
  },

  /**
   * Get audit report
   * @returns {Object} Audit report
   */
  report: function() {
    if (!this.results) {
      this.run();
    }
    return {
      timestamp: this.results.timestamp,
      duration: this.results.duration,
      overall: this.results.overall,
      sections: {
        architecture: this.results.architecture,
        runtime: this.results.runtime,
        features: this.results.features,
        ui: this.results.ui,
        domains: this.results.domains,
        layers: this.results.layers
      }
    };
  },

  /**
   * Get summary
   * @returns {Object} Summary
   */
  summary: function() {
    if (!this.results) {
      this.run();
    }
    return {
      score: this.results.overall.score,
      status: this.results.overall.status,
      pass: this.results.overall.pass,
      warnings: this.results.overall.warnings,
      errors: this.results.overall.errors,
      duration: this.results.duration
    };
  },

  /**
   * Get score
   * @returns {number} Overall score
   */
  score: function() {
    if (!this.results) {
      this.run();
    }
    return this.results.overall.score;
  },

  /**
   * Display audit report in console
   */
  display: function() {
    if (!this.results) {
      this.run();
    }
    
    var r = this.results;
    console.log('═══════════════════════════════════════');
    console.log('   ARCHITECTURE AUDIT REPORT');
    console.log('═══════════════════════════════════════');
    console.log('Duration: ' + r.duration + 'ms');
    console.log('Overall Score: ' + r.overall.score + '% (' + r.overall.status + ')');
    console.log('Pass: ' + (r.overall.pass ? '✅ YES' : '❌ NO'));
    console.log('Warnings: ' + r.overall.warnings);
    console.log('Errors: ' + r.overall.errors);
    console.log('─────────────────────────────────────');
    
    var sections = [
      { name: 'Architecture', data: r.architecture },
      { name: 'Runtime', data: r.runtime },
      { name: 'Features', data: r.features },
      { name: 'UI', data: r.ui },
      { name: 'Domains', data: r.domains },
      { name: 'Layers', data: r.layers }
    ];
    
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var statusIcon = s.data.score >= 80 ? '✅' : s.data.score >= 50 ? '⚠️' : '❌';
      console.log(statusIcon + ' ' + s.name + ': ' + s.data.score + '% (' + s.data.status + ')');
    }
    
    console.log('─────────────────────────────────────');
    
    // Show issues
    var allIssues = [];
    for (var key in r) {
      if (r[key] && r[key].issues && r[key].issues.length > 0) {
        for (var j = 0; j < r[key].issues.length; j++) {
          allIssues.push(r[key].issues[j]);
        }
      }
    }
    
    if (allIssues.length > 0) {
      console.warn('Issues Found:');
      for (var k = 0; k < allIssues.length; k++) {
        var icon = allIssues[k].type === 'error' ? '❌' : '⚠️';
        console.warn('  ' + icon + ' ' + allIssues[k].message);
      }
    } else {
      console.log('✅ No issues found.');
    }
    console.log('═══════════════════════════════════════');
  }
};

// 暴露到全局
window.architectureAudit = LawAIApp.ArchitectureAudit;

console.log('🏗️ ArchitectureAudit ready');
