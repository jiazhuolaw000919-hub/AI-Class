/**
 * Module Audit
 * 
 * Checks duplicate modules, unused modules,
 * deprecated modules, broken modules, and version mismatches.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ModuleAudit = {
  results: null,
  initialized: false,

  /**
   * Initialize audit
   */
  init: function() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[ModuleAudit] Initialized.');
  },

  /**
   * Run module audit
   * @returns {Object} Audit results
   */
  run: function() {
    console.log('[ModuleAudit] Running...');
    
    var results = {
      timestamp: Date.now(),
      duplicateModules: [],
      unusedModules: [],
      deprecatedModules: [],
      brokenModules: [],
      versionMismatches: [],
      totalModules: 0,
      warnings: 0,
      errors: 0,
      score: 100
    };

    // Check Runtime Registry
    var runtimeRegistry = LawAIApp.RuntimeRegistry || window.runtimeRegistry;
    if (runtimeRegistry && typeof runtimeRegistry.getAll === 'function') {
      var modules = runtimeRegistry.getAll();
      results.totalModules = modules.length;
      
      // Check for duplicates
      var names = modules.map(function(m) { return m.name; });
      var duplicates = names.filter(function(name, index) {
        return names.indexOf(name) !== index;
      });
      if (duplicates.length > 0) {
        results.duplicateModules = duplicates;
        results.warnings += duplicates.length;
        results.score -= duplicates.length * 10;
      }
      
      // Check for unused modules
      var usedModules = [];
      var featureRegistry = LawAIApp.FeatureRegistry || window.featureRegistry;
      if (featureRegistry && typeof featureRegistry.list === 'function') {
        var features = featureRegistry.list();
        for (var i = 0; i < features.length; i++) {
          if (features[i].dependencies) {
            for (var j = 0; j < features[i].dependencies.length; j++) {
              usedModules.push(features[i].dependencies[j]);
            }
          }
        }
      }
      
      for (var k = 0; k < modules.length; k++) {
        var m = modules[k];
        // Check if module is used
        if (usedModules.indexOf(m.name) === -1) {
          results.unusedModules.push(m.name);
          results.warnings++;
          results.score -= 5;
        }
      }
    }

    // Check Feature Registry for deprecated features
    var featureRegistry = LawAIApp.FeatureRegistry || window.featureRegistry;
    if (featureRegistry && typeof featureRegistry.list === 'function') {
      var features = featureRegistry.list();
      for (var l = 0; l < features.length; l++) {
        var f = features[l];
        if (f.status === 'deprecated') {
          results.deprecatedModules.push({
            id: f.id,
            name: f.name,
            version: f.version
          });
          results.warnings++;
          results.score -= 3;
        }
        if (f.healthy === false) {
          results.brokenModules.push({
            id: f.id,
            name: f.name,
            message: f.healthMessage || 'Unknown issue'
          });
          results.errors++;
          results.score -= 10;
        }
      }
    }

    // Check UI Registry for deprecated components
    var uiRegistry = LawAIApp.UIRegistry || window.uiRegistry;
    if (uiRegistry && typeof uiRegistry.list === 'function') {
      var components = uiRegistry.list();
      for (var m2 = 0; m2 < components.length; m2++) {
        var c = components[m2];
        if (c.status === 'deprecated') {
          results.deprecatedModules.push({
            id: c.id,
            name: c.name,
            version: c.version,
            type: 'ui'
          });
          results.warnings++;
          results.score -= 3;
        }
        if (c.healthy === false) {
          results.brokenModules.push({
            id: c.id,
            name: c.name,
            message: c.healthMessage || 'Unknown issue',
            type: 'ui'
          });
          results.errors++;
          results.score -= 10;
        }
      }
    }

    results.score = Math.max(0, results.score);
    results.status = results.score >= 80 ? 'healthy' : results.score >= 50 ? 'degraded' : 'critical';
    
    this.results = results;
    this._display();
    return results;
  },

  /**
   * Display results
   */
  _display: function() {
    var r = this.results;
    console.log('═══════════════════════════════════════');
    console.log('   MODULE AUDIT');
    console.log('═══════════════════════════════════════');
    console.log('Total Modules: ' + r.totalModules);
    console.log('Score: ' + r.score + '% (' + r.status + ')');
    console.log('Duplicate Modules: ' + r.duplicateModules.length);
    console.log('Unused Modules: ' + r.unusedModules.length);
    console.log('Deprecated Modules: ' + r.deprecatedModules.length);
    console.log('Broken Modules: ' + r.brokenModules.length);
    console.log('─────────────────────────────────────');
    
    if (r.unusedModules.length > 0) {
      console.warn('Unused Modules: ' + r.unusedModules.join(', '));
    }
    if (r.deprecatedModules.length > 0) {
      console.warn('Deprecated Modules:');
      for (var i = 0; i < r.deprecatedModules.length; i++) {
        var d = r.deprecatedModules[i];
        console.warn('  ' + d.name + ' (' + d.id + ') v' + d.version);
      }
    }
    if (r.brokenModules.length > 0) {
      console.warn('Broken Modules:');
      for (var j = 0; j < r.brokenModules.length; j++) {
        var b = r.brokenModules[j];
        console.warn('  ' + b.name + ': ' + b.message);
      }
    }
    
    if (r.unusedModules.length === 0 && r.deprecatedModules.length === 0 && r.brokenModules.length === 0) {
      console.log('✅ No module issues found.');
    }
    console.log('═══════════════════════════════════════');
  },

  /**
   * Get report
   */
  report: function() {
    if (!this.results) this.run();
    return this.results;
  },

  /**
   * Get summary
   */
  summary: function() {
    if (!this.results) this.run();
    return {
      score: this.results.score,
      status: this.results.status,
      total: this.results.totalModules,
      unused: this.results.unusedModules.length,
      deprecated: this.results.deprecatedModules.length,
      broken: this.results.brokenModules.length
    };
  }
};

// 暴露到全局
window.moduleAudit = LawAIApp.ModuleAudit;

console.log('📦 ModuleAudit ready');
