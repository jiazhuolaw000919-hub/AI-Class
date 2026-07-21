/**
 * Runtime Reality Validator
 * Validates manifest vs runtime state.
 * Warnings only – never stops Boot.
 */

import { collectAll } from './runtimeRealityCollector.js';
import { getEngineMetadata } from './engineDiscoveryManifest.js';

export function validateManifestVsRuntime() {
  var warnings = [];
  var results = {
    declared: { engines: [], domains: [], features: [] },
    runtime: { engines: [], domains: [], features: [] },
    matches: { engines: [], domains: [], features: [] },
    missing: { engines: [], domains: [], features: [] },
    unknown: { engines: [], domains: [], features: [] }
  };
  
  try {
    // Get declared state from manifest
    var declaredEngines = getEngineMetadata ? getEngineMetadata().map(function(e) { return e.name; }) : [];
    results.declared.engines = declaredEngines;
    
    // Get runtime state from collector
    var runtime = collectAll();
    var runtimeEngineNames = runtime.engines.names || [];
    results.runtime.engines = runtimeEngineNames;
    
    // Compare declared vs runtime
    for (var i = 0; i < declaredEngines.length; i++) {
      var name = declaredEngines[i];
      if (runtimeEngineNames.indexOf(name) !== -1) {
        results.matches.engines.push(name);
      } else {
        results.missing.engines.push(name);
        warnings.push('Declared but Missing: "' + name + '" not found at runtime');
      }
    }
    
    // Find unknown runtime engines
    for (var i = 0; i < runtimeEngineNames.length; i++) {
      var name = runtimeEngineNames[i];
      if (declaredEngines.indexOf(name) === -1) {
        results.unknown.engines.push(name);
        warnings.push('Loaded but Unknown: "' + name + '" not declared in manifest');
      }
    }
    
    // Domain validation
    var declaredDomains = [];
    try {
      if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        if (LawAIApp.DomainRegistry && typeof LawAIApp.DomainRegistry.list === 'function') {
          var domains = LawAIApp.DomainRegistry.list();
          declaredDomains = domains.map(function(d) { return d.name; });
        }
      }
    } catch (e) {
      // Ignore
    }
    results.declared.domains = declaredDomains;
    results.runtime.domains = runtime.domains.names || [];
    
    for (var i = 0; i < declaredDomains.length; i++) {
      var name = declaredDomains[i];
      if (results.runtime.domains.indexOf(name) !== -1) {
        results.matches.domains.push(name);
      } else {
        results.missing.domains.push(name);
        warnings.push('Declared Domain Missing: "' + name + '" not found at runtime');
      }
    }
    
    // Feature validation
    var declaredFeatures = [];
    try {
      if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        if (LawAIApp.FeatureRegistry && typeof LawAIApp.FeatureRegistry.list === 'function') {
          var features = LawAIApp.FeatureRegistry.list();
          declaredFeatures = features.map(function(f) { return f.name || f.id; }).filter(Boolean);
        }
      }
    } catch (e) {
      // Ignore
    }
    results.declared.features = declaredFeatures;
    results.runtime.features = runtime.features.names || [];
    
    for (var i = 0; i < declaredFeatures.length; i++) {
      var name = declaredFeatures[i];
      if (results.runtime.features.indexOf(name) !== -1) {
        results.matches.features.push(name);
      } else {
        results.missing.features.push(name);
        warnings.push('Declared Feature Missing: "' + name + '" not found at runtime');
      }
    }
    
  } catch (err) {
    warnings.push('Validation error: ' + err.message);
  }
  
  return {
    warnings: warnings,
    results: results,
    warningCount: warnings.length
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeRealityValidator = {
    validateManifestVsRuntime: validateManifestVsRuntime,
    init: function() {
      console.log('✅ RuntimeRealityValidator ready');
      var result = validateManifestVsRuntime();
      if (result.warningCount > 0) {
        console.warn('⚠️ Reality warnings:', result.warningCount);
        result.warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Reality matches manifest.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeRealityValidator = window.runtimeRealityValidator;
  }
}
