/**
 * Engine Coordination Validator
 * Validates engine coordination relationships.
 * Warnings only – never stops Boot.
 */

import { ENGINE_COORDINATION_MAP, ENGINE_RELATIONSHIPS } from './engineCoordinationManifest.js';

export function validateRelationship(engineName, connectedEngine, relationship) {
  const warnings = [];
  
  // Duplicate relationship
  const existing = ENGINE_COORDINATION_MAP.some(e => 
    e.engine === engineName && 
    e.connected.includes(connectedEngine)
  );
  if (existing) {
    warnings.push(`Duplicate Relationship: ${engineName} -> ${connectedEngine} already exists`);
  }
  
  // Unknown engine
  const allEngines = ENGINE_COORDINATION_MAP.map(e => e.engine);
  if (!allEngines.includes(engineName)) {
    warnings.push(`Unknown Engine: "${engineName}" not found in manifest`);
  }
  
  // Invalid relationship type
  const validTypes = Object.values(ENGINE_RELATIONSHIPS);
  if (relationship && !validTypes.includes(relationship)) {
    warnings.push(`Invalid Relationship Type: "${relationship}"`);
  }
  
  // Circular coordination check (simple: same engine appears twice)
  if (engineName === connectedEngine) {
    warnings.push(`Circular Coordination: Engine "${engineName}" connects to itself`);
  }
  
  // Missing provider (if relationship is PROVIDES_TO or DEPENDS_ON)
  if (relationship === 'DEPENDS_ON' || relationship === 'CONSUMES_FROM') {
    const providerExists = ENGINE_COORDINATION_MAP.some(e => 
      e.engine === connectedEngine || 
      (e.connected.includes(connectedEngine) && e.relationship === 'PROVIDES_TO')
    );
    if (!providerExists && !ENGINE_COORDINATION_MAP.some(e => e.engine === connectedEngine)) {
      warnings.push(`Missing Provider: "${connectedEngine}" not found as provider for ${engineName}`);
    }
  }
  
  // Orphan engine check (not in any relationship)
  const hasConnections = ENGINE_COORDINATION_MAP.some(e => 
    e.engine === engineName && e.connected.length > 0
  );
  if (!hasConnections && ENGINE_COORDINATION_MAP.some(e => e.engine === engineName)) {
    warnings.push(`Orphan Engine: "${engineName}" has no connections`);
  }
  
  return warnings;
}

export function validateAllRelationships() {
  const results = {};
  const all = ENGINE_COORDINATION_MAP;
  
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    const engineWarnings = [];
    
    for (let j = 0; j < e.connected.length; j++) {
      const w = validateRelationship(e.engine, e.connected[j], e.relationship);
      if (w.length > 0) {
        engineWarnings.push({ connected: e.connected[j], warnings: w });
      }
    }
    
    if (engineWarnings.length > 0) {
      results[e.engine] = engineWarnings;
    }
  }
  
  return results;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCoordinationValidator = {
    validateRelationship,
    validateAllRelationships,
    init: function() { 
      console.log('✅ EngineCoordinationValidator ready');
      // Log validation results
      const results = validateAllRelationships();
      if (Object.keys(results).length > 0) {
        console.warn('⚠️ Coordination warnings found:', results);
      }
      return this; 
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCoordinationValidator = window.engineCoordinationValidator;
  }
}
