/**
 * Engine Discovery Service
 * Reads engine metadata and provides query capabilities.
 * Never instantiates engines.
 */

import { ENGINE_METADATA } from './engineDiscoveryManifest.js';

export function list() {
  return JSON.parse(JSON.stringify(ENGINE_METADATA));
}

export function find(name) {
  const engine = ENGINE_METADATA.find(e => e.name === name);
  return engine ? JSON.parse(JSON.stringify(engine)) : null;
}

export function findByDomain(domain) {
  return ENGINE_METADATA
    .filter(e => e.domain === domain)
    .map(e => JSON.parse(JSON.stringify(e)));
}

export function findByCategory(category) {
  return ENGINE_METADATA
    .filter(e => e.category === category)
    .map(e => JSON.parse(JSON.stringify(e)));
}

export function findByCapability(capability) {
  return ENGINE_METADATA
    .filter(e => e.capabilities && e.capabilities.includes(capability))
    .map(e => JSON.parse(JSON.stringify(e)));
}

export function search(keyword) {
  if (!keyword || keyword.trim() === '') return [];
  const lowerKeyword = keyword.toLowerCase().trim();
  return ENGINE_METADATA
    .filter(e => 
      e.name.toLowerCase().includes(lowerKeyword) ||
      e.description.toLowerCase().includes(lowerKeyword) ||
      e.domain.toLowerCase().includes(lowerKeyword) ||
      e.category.toLowerCase().includes(lowerKeyword) ||
      e.capabilities.some(c => c.toLowerCase().includes(lowerKeyword))
    )
    .map(e => JSON.parse(JSON.stringify(e)));
}

export function count() {
  return ENGINE_METADATA.length;
}

export function countByDomain() {
  const result = {};
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const domain = ENGINE_METADATA[i].domain;
    result[domain] = (result[domain] || 0) + 1;
  }
  return result;
}

export function countByCategory() {
  const result = {};
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const category = ENGINE_METADATA[i].category;
    result[category] = (result[category] || 0) + 1;
  }
  return result;
}

export function getStatusCounts() {
  const result = {};
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const status = ENGINE_METADATA[i].status;
    result[status] = (result[status] || 0) + 1;
  }
  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineDiscovery = {
    list,
    find,
    findByDomain,
    findByCategory,
    findByCapability,
    search,
    count,
    countByDomain,
    countByCategory,
    getStatusCounts,
    init: function() { console.log('✅ EngineDiscovery ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineDiscovery = window.engineDiscovery;
  }
}
