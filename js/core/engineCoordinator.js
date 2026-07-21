/**
 * Engine Coordinator
 * Coordinates engine collaboration relationships.
 * Read only – never executes engine logic.
 */

import { ENGINE_COORDINATION_MAP, ENGINE_RELATIONSHIPS } from './engineCoordinationManifest.js';

// Internal store for runtime connections (read-only mirror)
let _connections = [];

export function registerConnection(engineName, connectedEngine, relationship) {
  // Validate relationship type
  const validRelationships = Object.values(ENGINE_RELATIONSHIPS);
  if (!validRelationships.includes(relationship)) {
    console.warn('⚠️ Invalid relationship type:', relationship);
    return false;
  }
  
  // Check if connection already exists
  const exists = _connections.some(c => 
    c.engine === engineName && 
    c.connected === connectedEngine &&
    c.relationship === relationship
  );
  
  if (!exists) {
    _connections.push({
      engine: engineName,
      connected: connectedEngine,
      relationship: relationship,
      registered: new Date().toISOString()
    });
  }
  
  return true;
}

export function getConnections(engineName) {
  // Return both static and runtime connections
  const staticConnections = ENGINE_COORDINATION_MAP
    .filter(e => e.engine === engineName)
    .flatMap(e => e.connected.map(c => ({
      engine: e.engine,
      connected: c,
      relationship: e.relationship,
      source: 'manifest'
    })));
  
  const runtimeConnections = _connections
    .filter(c => c.engine === engineName)
    .map(c => ({
      engine: c.engine,
      connected: c.connected,
      relationship: c.relationship,
      source: 'runtime'
    }));
  
  return [...staticConnections, ...runtimeConnections];
}

export function getDependents(engineName) {
  // Engines that depend on this engine
  const dependents = [];
  const all = ENGINE_COORDINATION_MAP;
  
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    if (e.connected.includes(engineName) && e.relationship === 'DEPENDS_ON') {
      dependents.push(e.engine);
    }
  }
  
  // Runtime connections
  for (let i = 0; i < _connections.length; i++) {
    const c = _connections[i];
    if (c.connected === engineName && c.relationship === 'DEPENDS_ON') {
      dependents.push(c.engine);
    }
  }
  
  return dependents;
}

export function getProviders(engineName) {
  // Engines that provide to this engine
  const providers = [];
  const all = ENGINE_COORDINATION_MAP;
  
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    if (e.connected.includes(engineName) && e.relationship === 'PROVIDES_TO') {
      providers.push(e.engine);
    }
  }
  
  // Runtime connections
  for (let i = 0; i < _connections.length; i++) {
    const c = _connections[i];
    if (c.connected === engineName && c.relationship === 'PROVIDES_TO') {
      providers.push(c.engine);
    }
  }
  
  return providers;
}

export function listCooperation() {
  // List all collaboration relationships
  const result = [];
  const all = ENGINE_COORDINATION_MAP;
  
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    if (e.relationship === 'COLLABORATES_WITH') {
      result.push({
        engine: e.engine,
        partners: e.connected,
        type: 'COLLABORATES_WITH'
      });
    }
  }
  
  // Runtime collaborations
  for (let i = 0; i < _connections.length; i++) {
    const c = _connections[i];
    if (c.relationship === 'COLLABORATES_WITH') {
      result.push({
        engine: c.engine,
        partners: [c.connected],
        type: 'COLLABORATES_WITH'
      });
    }
  }
  
  return result;
}

export function getAllRelationships() {
  const all = ENGINE_COORDINATION_MAP;
  const result = [];
  
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    for (let j = 0; j < e.connected.length; j++) {
      result.push({
        engine: e.engine,
        connected: e.connected[j],
        relationship: e.relationship
      });
    }
  }
  
  // Runtime connections
  for (let i = 0; i < _connections.length; i++) {
    const c = _connections[i];
    result.push({
      engine: c.engine,
      connected: c.connected,
      relationship: c.relationship,
      runtime: true
    });
  }
  
  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCoordinator = {
    registerConnection,
    getConnections,
    getDependents,
    getProviders,
    listCooperation,
    getAllRelationships,
    init: function() { 
      console.log('✅ EngineCoordinator ready');
      // Pre-register static connections
      const all = ENGINE_COORDINATION_MAP;
      for (let i = 0; i < all.length; i++) {
        const e = all[i];
        for (let j = 0; j < e.connected.length; j++) {
          registerConnection(e.engine, e.connected[j], e.relationship);
        }
      }
      return this; 
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCoordinator = window.engineCoordinator;
  }
}
