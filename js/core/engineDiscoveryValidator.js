/**
 * Engine Discovery Validator
 * Validates engine metadata.
 * Warnings only – never interrupts Boot.
 */

import { ENGINE_METADATA } from './engineDiscoveryManifest.js';

export function validateEngineMetadata() {
  const warnings = [];
  const nameSet = new Set();
  
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const engine = ENGINE_METADATA[i];
    
    // Duplicate engine names
    if (nameSet.has(engine.name)) {
      warnings.push(`Duplicate engine name: "${engine.name}"`);
    }
    nameSet.add(engine.name);
    
    // Missing description
    if (!engine.description || engine.description.trim() === '') {
      warnings.push(`Missing description for engine: "${engine.name}"`);
    }
    
    // Unknown domain
    const validDomains = ['Core', 'Business', 'Support', 'Experimental'];
    if (!validDomains.includes(engine.domain)) {
      warnings.push(`Unknown domain "${engine.domain}" for engine: "${engine.name}"`);
    }
    
    // Unknown category
    const validCategories = ['Learning', 'Memory', 'Practice', 'Goal', 'Analytics', 'Governance', 'UI', 'Integration', 'Utility'];
    if (!validCategories.includes(engine.category)) {
      warnings.push(`Unknown category "${engine.category}" for engine: "${engine.name}"`);
    }
    
    // Missing capabilities
    if (!engine.capabilities || engine.capabilities.length === 0) {
      warnings.push(`Missing capabilities for engine: "${engine.name}"`);
    }
    
    // Missing version
    if (!engine.version || engine.version.trim() === '') {
      warnings.push(`Missing version for engine: "${engine.name}"`);
    }
    
    // Unknown status
    const validStatuses = ['active', 'deprecated', 'experimental'];
    if (engine.status && !validStatuses.includes(engine.status)) {
      warnings.push(`Unknown status "${engine.status}" for engine: "${engine.name}"`);
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineDiscoveryValidator = {
    validateEngineMetadata,
    init: function() {
      console.log('✅ EngineDiscoveryValidator ready');
      const warnings = validateEngineMetadata();
      if (warnings.length > 0) {
        console.warn('⚠️ Discovery warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All engine metadata valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineDiscoveryValidator = window.engineDiscoveryValidator;
  }
}
