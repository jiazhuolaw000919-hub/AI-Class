/**
 * System Coherence Analyzer
 * Analyzes intelligence chain completeness and connections.
 * No automatic repair – observation only.
 */

import { INTELLIGENCE_CHAIN, LAYER_RELATIONSHIPS, LAYER_SOURCES } from './systemCoherenceManifest.js';

export function analyzeCoherence() {
  var chain = INTELLIGENCE_CHAIN;
  var relationships = LAYER_RELATIONSHIPS;
  var result = {
    timestamp: new Date().toISOString(),
    layers: [],
    connections: [],
    missingLayers: [],
    brokenLinks: [],
    duplicateRelationships: [],
    unusedLayers: [],
    completeness: 0,
    chainComplete: false
  };

  // Check each layer
  var availableLayers = [];
  for (var i = 0; i < chain.length; i++) {
    var layer = chain[i];
    var source = LAYER_SOURCES[layer.id];
    var available = false;

    try {
      if (source) {
        if (typeof LawAIApp !== 'undefined' && LawAIApp) {
          if (LawAIApp[source]) available = true;
        }
        if (!available && typeof window !== 'undefined') {
          if (window[source]) available = true;
        }
      }
    } catch (e) { /* ignore */ }

    var layerInfo = {
      id: layer.id,
      name: layer.name,
      layer: layer.layer,
      order: layer.order,
      available: available,
      source: source
    };

    result.layers.push(layerInfo);

    if (available) {
      availableLayers.push(layer.id);
    } else {
      result.missingLayers.push(layer.id);
    }
  }

  // Check connections between layers
  var connectedLayers = [];
  for (var i = 0; i < relationships.length; i++) {
    var rel = relationships[i];
    var fromAvailable = availableLayers.indexOf(rel.from) !== -1;
    var toAvailable = availableLayers.indexOf(rel.to) !== -1;

    var connection = {
      from: rel.from,
      to: rel.to,
      type: rel.type,
      healthy: fromAvailable && toAvailable,
      fromAvailable: fromAvailable,
      toAvailable: toAvailable
    };

    result.connections.push(connection);

    if (fromAvailable && !toAvailable) {
      result.brokenLinks.push({
        from: rel.from,
        to: rel.to,
        reason: 'Target layer not available'
      });
    }

    if (!fromAvailable && toAvailable) {
      result.brokenLinks.push({
        from: rel.from,
        to: rel.to,
        reason: 'Source layer not available'
      });
    }

    if (fromAvailable && toAvailable) {
      connectedLayers.push(rel.from, rel.to);
    }
  }

  // Check for duplicate relationships
  var seen = {};
  for (var i = 0; i < relationships.length; i++) {
    var key = relationships[i].from + '->' + relationships[i].to;
    if (seen[key]) {
      result.duplicateRelationships.push(key);
    }
    seen[key] = true;
  }

  // Check for unused layers
  for (var i = 0; i < availableLayers.length; i++) {
    var layerId = availableLayers[i];
    var hasConnection = relationships.some(function(r) {
      return r.from === layerId || r.to === layerId;
    });
    if (!hasConnection) {
      result.unusedLayers.push(layerId);
    }
  }

  // Calculate completeness
  var totalLayers = chain.length;
  var availableCount = availableLayers.length;
  var connectedCount = new Set(connectedLayers).size;
  var completeness = totalLayers > 0 ? Math.round((connectedCount / totalLayers) * 100) : 0;
  result.completeness = completeness;
  result.chainComplete = completeness === 100 && result.brokenLinks.length === 0;

  return result;
}

export function getLayerStatus(layerId) {
  var analysis = analyzeCoherence();
  var layer = analysis.layers.find(function(l) { return l.id === layerId; });
  return layer || null;
}

export function getConnectionStatus(from, to) {
  var analysis = analyzeCoherence();
  var connection = analysis.connections.find(function(c) {
    return c.from === from && c.to === to;
  });
  return connection || null;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemCoherenceAnalyzer = {
    analyzeCoherence: analyzeCoherence,
    getLayerStatus: getLayerStatus,
    getConnectionStatus: getConnectionStatus,
    init: function() {
      console.log('✅ SystemCoherenceAnalyzer ready');
      var analysis = analyzeCoherence();
      console.log('🧩 Coherence Analysis:', analysis.completeness + '% complete, ' + analysis.brokenLinks.length + ' broken links');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemCoherenceAnalyzer = window.systemCoherenceAnalyzer;
  }
}
