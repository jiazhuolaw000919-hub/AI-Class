/**
 * Engine Coordination Manifest
 * Maintains official Engine Collaboration Map.
 * Read only – do not modify at runtime.
 */

export const ENGINE_RELATIONSHIPS = {
  DEPENDS_ON: 'DEPENDS_ON',
  PROVIDES_TO: 'PROVIDES_TO',
  COLLABORATES_WITH: 'COLLABORATES_WITH',
  ORCHESTRATES: 'ORCHESTRATES',
  CONSUMES_FROM: 'CONSUMES_FROM',
  EXTENDS: 'EXTENDS'
};

export const ENGINE_COORDINATION_MAP = [
  { engine: 'LearningEngine', connected: ['MemoryEngine', 'GoalEngine'], relationship: 'COLLABORATES_WITH', priority: 1, version: '1.0', status: 'active' },
  { engine: 'MemoryEngine', connected: ['PracticeEngine'], relationship: 'PROVIDES_TO', priority: 2, version: '1.0', status: 'active' },
  { engine: 'PracticeEngine', connected: ['GoalEngine', 'LearningEngine'], relationship: 'DEPENDS_ON', priority: 2, version: '1.0', status: 'active' },
  { engine: 'GoalEngine', connected: ['LearningEngine'], relationship: 'CONSUMES_FROM', priority: 3, version: '1.0', status: 'active' },
  { engine: 'RuntimeKernel', connected: ['BootManager', 'RuntimeRegistry'], relationship: 'ORCHESTRATES', priority: 0, version: '1.0', status: 'active' },
  { engine: 'BootManager', connected: ['RuntimeKernel', 'EventBus'], relationship: 'DEPENDS_ON', priority: 0, version: '1.0', status: 'active' },
  { engine: 'EngineRegistry', connected: ['EventBus', 'RuntimeRegistry'], relationship: 'COLLABORATES_WITH', priority: 1, version: '1.0', status: 'active' }
];

export function getCoordinationMap() {
  return JSON.parse(JSON.stringify(ENGINE_COORDINATION_MAP));
}

export function getConnectionsForEngine(engineName) {
  const entry = ENGINE_COORDINATION_MAP.find(e => e.engine === engineName);
  return entry ? [...entry.connected] : [];
}

export function getRelationship(engineName, connectedEngine) {
  const entry = ENGINE_COORDINATION_MAP.find(e => e.engine === engineName);
  if (!entry) return null;
  const idx = entry.connected.indexOf(connectedEngine);
  return idx !== -1 ? entry.relationship : null;
}

export function getAllEngines() {
  return ENGINE_COORDINATION_MAP.map(e => e.engine);
}

export function getEnginesByRelationship(type) {
  return ENGINE_COORDINATION_MAP
    .filter(e => e.relationship === type)
    .map(e => e.engine);
}

export function isEngineConnected(engineName) {
  return ENGINE_COORDINATION_MAP.some(e => e.engine === engineName);
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCoordinationManifest = {
    ENGINE_RELATIONSHIPS,
    ENGINE_COORDINATION_MAP,
    getCoordinationMap,
    getConnectionsForEngine,
    getRelationship,
    getAllEngines,
    getEnginesByRelationship,
    isEngineConnected,
    init: function() { console.log('✅ EngineCoordinationManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCoordinationManifest = window.engineCoordinationManifest;
  }
}
