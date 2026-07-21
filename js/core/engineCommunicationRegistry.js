/**
 * Engine Communication Registry
 * Registers and queries communication contracts.
 * Metadata only – never executes engines.
 */

import { COMMUNICATION_CONTRACTS } from './engineCommunicationManifest.js';

// Runtime storage for dynamic registrations
let _runtimeContracts = [];

export function register(sourceEngine, targetEngine, communicationType, messageType, permission, version, status) {
  // Check if contract already exists
  const exists = COMMUNICATION_CONTRACTS.some(c => 
    c.sourceEngine === sourceEngine && 
    c.targetEngine === targetEngine
  );
  
  if (exists) {
    console.warn('⚠️ Contract already exists:', sourceEngine, '->', targetEngine);
    return false;
  }
  
  // Check if already registered at runtime
  const existsRuntime = _runtimeContracts.some(c => 
    c.sourceEngine === sourceEngine && 
    c.targetEngine === targetEngine
  );
  
  if (existsRuntime) {
    console.warn('⚠️ Contract already registered at runtime:', sourceEngine, '->', targetEngine);
    return false;
  }
  
  _runtimeContracts.push({
    sourceEngine: sourceEngine,
    targetEngine: targetEngine,
    communicationType: communicationType || 'REQUEST',
    messageType: messageType || 'QUERY',
    permission: permission || 'PUBLIC',
    version: version || '1.0',
    status: status || 'active',
    registered: new Date().toISOString(),
    runtime: true
  });
  
  return true;
}

export function list() {
  const all = [
    ...COMMUNICATION_CONTRACTS.map(c => ({ ...c, runtime: false })),
    ..._runtimeContracts
  ];
  return all;
}

export function find(source, target) {
  const manifest = COMMUNICATION_CONTRACTS.find(c => 
    c.sourceEngine === source && 
    c.targetEngine === target
  );
  
  if (manifest) {
    return { ...manifest, runtime: false };
  }
  
  const runtime = _runtimeContracts.find(c => 
    c.sourceEngine === source && 
    c.targetEngine === target
  );
  
  return runtime ? { ...runtime } : null;
}

export function findBySource(source) {
  const manifest = COMMUNICATION_CONTRACTS
    .filter(c => c.sourceEngine === source)
    .map(c => ({ ...c, runtime: false }));
  
  const runtime = _runtimeContracts
    .filter(c => c.sourceEngine === source);
  
  return [...manifest, ...runtime];
}

export function findByTarget(target) {
  const manifest = COMMUNICATION_CONTRACTS
    .filter(c => c.targetEngine === target)
    .map(c => ({ ...c, runtime: false }));
  
  const runtime = _runtimeContracts
    .filter(c => c.targetEngine === target);
  
  return [...manifest, ...runtime];
}

export function count() {
  return COMMUNICATION_CONTRACTS.length + _runtimeContracts.length;
}

export function countBySource() {
  const result = {};
  const all = list();
  for (let i = 0; i < all.length; i++) {
    const source = all[i].sourceEngine;
    result[source] = (result[source] || 0) + 1;
  }
  return result;
}

export function countByTarget() {
  const result = {};
  const all = list();
  for (let i = 0; i < all.length; i++) {
    const target = all[i].targetEngine;
    result[target] = (result[target] || 0) + 1;
  }
  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCommunicationRegistry = {
    register,
    list,
    find,
    findBySource,
    findByTarget,
    count,
    countBySource,
    countByTarget,
    init: function() { console.log('✅ EngineCommunicationRegistry ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCommunicationRegistry = window.engineCommunicationRegistry;
  }
}
