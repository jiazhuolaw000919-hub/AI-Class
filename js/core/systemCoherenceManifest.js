/**
 * System Coherence Manifest
 * Maintains official coherence definitions.
 * Read only – do not modify at runtime.
 */

export const INTELLIGENCE_CHAIN = [
  { id: 'awareness', name: 'System Awareness', layer: 'Awareness', order: 0 },
  { id: 'intelligence', name: 'System Intelligence', layer: 'Intelligence', order: 1 },
  { id: 'memory', name: 'System Memory', layer: 'Memory', order: 2 },
  { id: 'reflection', name: 'System Reflection', layer: 'Reflection', order: 3 },
  { id: 'decision', name: 'System Decision', layer: 'Decision', order: 4 },
  { id: 'evolution', name: 'System Evolution', layer: 'Evolution', order: 5 },
  { id: 'state', name: 'Engine State', layer: 'State', order: 6 },
  { id: 'context', name: 'System Context', layer: 'Context', order: 7 },
  { id: 'intention', name: 'System Intention', layer: 'Intention', order: 8 },
  { id: 'adaptation', name: 'System Adaptation', layer: 'Adaptation', order: 9 },
  { id: 'coherence', name: 'System Coherence', layer: 'Coherence', order: 10 }
];

export const LAYER_RELATIONSHIPS = [
  { from: 'awareness', to: 'intelligence', type: 'feeds' },
  { from: 'intelligence', to: 'memory', type: 'stores' },
  { from: 'memory', to: 'reflection', type: 'analyzes' },
  { from: 'reflection', to: 'decision', type: 'informs' },
  { from: 'decision', to: 'evolution', type: 'guides' },
  { from: 'evolution', to: 'state', type: 'defines' },
  { from: 'state', to: 'context', type: 'provides' },
  { from: 'context', to: 'intention', type: 'shapes' },
  { from: 'intention', to: 'adaptation', type: 'drives' },
  { from: 'adaptation', to: 'coherence', type: 'completes' }
];

export const LAYER_SOURCES = {
  awareness: 'SystemAwarenessHealth',
  intelligence: 'SystemIntelligenceHealth',
  memory: 'SystemMemoryHealth',
  reflection: 'SystemReflectionHealth',
  decision: 'SystemDecisionHealth',
  evolution: 'SystemEvolutionHealth',
  state: 'EngineStateHealth',
  context: 'SystemContextHealth',
  intention: 'SystemIntentionHealth',
  adaptation: 'SystemAdaptationHealth',
  coherence: 'SystemCoherenceHealth'
};

export function getIntelligenceChain() {
  return JSON.parse(JSON.stringify(INTELLIGENCE_CHAIN));
}

export function getLayerById(id) {
  return INTELLIGENCE_CHAIN.find(l => l.id === id) || null;
}

export function getLayerByOrder(order) {
  return INTELLIGENCE_CHAIN.find(l => l.order === order) || null;
}

export function getLayerRelationships() {
  return JSON.parse(JSON.stringify(LAYER_RELATIONSHIPS));
}

export function getRelationshipsForLayer(id) {
  return LAYER_RELATIONSHIPS.filter(r => r.from === id || r.to === id);
}

export function getLayerSource(id) {
  return LAYER_SOURCES[id] || null;
}

export function getChainLength() {
  return INTELLIGENCE_CHAIN.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemCoherenceManifest = {
    INTELLIGENCE_CHAIN,
    LAYER_RELATIONSHIPS,
    LAYER_SOURCES,
    getIntelligenceChain,
    getLayerById,
    getLayerByOrder,
    getLayerRelationships,
    getRelationshipsForLayer,
    getLayerSource,
    getChainLength,
    init: function() { console.log('✅ SystemCoherenceManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemCoherenceManifest = window.systemCoherenceManifest;
  }
}
