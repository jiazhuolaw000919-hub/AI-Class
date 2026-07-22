/**
 * System Coherence Validator
 * Validates intelligence chain coherence.
 * Warnings only – never stops Boot.
 */

import { INTELLIGENCE_CHAIN, LAYER_RELATIONSHIPS } from './systemCoherenceManifest.js';
import { analyzeCoherence } from './systemCoherenceAnalyzer.js';

export function validateCoherence() {
  var warnings = [];
  var analysis = analyzeCoherence();

  // Missing intelligence layers
  for (var i = 0; i < analysis.missingLayers.length; i++) {
    warnings.push('Missing intelligence layer: "' + analysis.missingLayers[i] + '"');
  }

  // Invalid relationships
  var relationships = LAYER_RELATIONSHIPS;
  var layerIds = INTELLIGENCE_CHAIN.map(function(l) { return l.id; });

  for (var i = 0; i < relationships.length; i++) {
    var rel = relationships[i];
    if (layerIds.indexOf(rel.from) === -1) {
      warnings.push('Invalid relationship source: "' + rel.from + '"');
    }
    if (layerIds.indexOf(rel.to) === -1) {
      warnings.push('Invalid relationship target: "' + rel.to + '"');
    }
  }

  // Circular intelligence dependencies
  var visited = {};
  var recursionStack = {};

  function hasCycle(layerId) {
    if (recursionStack[layerId]) return true;
    if (visited[layerId]) return false;

    visited[layerId] = true;
    recursionStack[layerId] = true;

    var outgoing = relationships.filter(function(r) { return r.from === layerId; });
    for (var i = 0; i < outgoing.length; i++) {
      if (hasCycle(outgoing[i].to)) {
        return true;
      }
    }

    recursionStack[layerId] = false;
    return false;
  }

  for (var i = 0; i < layerIds.length; i++) {
    if (hasCycle(layerIds[i])) {
      warnings.push('Circular intelligence dependency detected');
      break;
    }
  }

  // Broken chain warnings
  for (var i = 0; i < analysis.brokenLinks.length; i++) {
    var link = analysis.brokenLinks[i];
    warnings.push('Broken chain: ' + link.from + ' → ' + link.to + ' (' + link.reason + ')');
  }

  // Duplicate relationships
  for (var i = 0; i < analysis.duplicateRelationships.length; i++) {
    warnings.push('Duplicate relationship: "' + analysis.duplicateRelationships[i] + '"');
  }

  // Unknown layer
  for (var i = 0; i < analysis.layers.length; i++) {
    var layer = analysis.layers[i];
    if (!layer.available && !layer.source) {
      warnings.push('Unknown layer: "' + layer.id + '"');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemCoherenceValidator = {
    validateCoherence: validateCoherence,
    init: function() {
      console.log('✅ SystemCoherenceValidator ready');
      var warnings = validateCoherence();
      if (warnings.length > 0) {
        console.warn('⚠️ Coherence warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ Intelligence chain coherent.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemCoherenceValidator = window.systemCoherenceValidator;
  }
}
