/**
 * Engine Communication Validator
 * Validates communication contracts.
 * Warnings only – never stops Boot.
 */

import { COMMUNICATION_CONTRACTS, COMMUNICATION_TYPES, PERMISSION_LEVELS, STATUS_VALUES } from './engineCommunicationManifest.js';

export function validateContracts() {
  const warnings = [];
  const seen = new Set();
  
  for (let i = 0; i < COMMUNICATION_CONTRACTS.length; i++) {
    const c = COMMUNICATION_CONTRACTS[i];
    const key = c.sourceEngine + '->' + c.targetEngine;
    
    // Duplicate contract
    if (seen.has(key)) {
      warnings.push('Duplicate contract: ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
    seen.add(key);
    
    // Unknown source engine
    if (!c.sourceEngine) {
      warnings.push('Missing source engine for contract #' + i);
    }
    
    // Unknown target engine
    if (!c.targetEngine) {
      warnings.push('Missing target engine for contract #' + i);
    }
    
    // Invalid communication type
    if (c.communicationType && !COMMUNICATION_TYPES.includes(c.communicationType)) {
      warnings.push('Invalid communication type "' + c.communicationType + '" for ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
    
    // Invalid message type
    if (!c.messageType) {
      warnings.push('Missing message type for ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
    
    // Invalid permission
    if (c.permission && !PERMISSION_LEVELS.includes(c.permission)) {
      warnings.push('Invalid permission "' + c.permission + '" for ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
    
    // Invalid status
    if (c.status && !STATUS_VALUES.includes(c.status)) {
      warnings.push('Invalid status "' + c.status + '" for ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
    
    // Missing version
    if (!c.version) {
      warnings.push('Missing version for ' + c.sourceEngine + ' -> ' + c.targetEngine);
    }
  }
  
  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCommunicationValidator = {
    validateContracts,
    init: function() {
      console.log('✅ EngineCommunicationValidator ready');
      const warnings = validateContracts();
      if (warnings.length > 0) {
        console.warn('⚠️ Communication warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All communication contracts valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCommunicationValidator = window.engineCommunicationValidator;
  }
}
