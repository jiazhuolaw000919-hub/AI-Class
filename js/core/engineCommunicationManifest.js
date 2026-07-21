/**
 * Engine Communication Manifest
 * Maintains official communication contracts.
 * Read only – do not modify at runtime.
 */

export const COMMUNICATION_TYPES = ['REQUEST', 'RESPONSE', 'NOTIFICATION', 'EVENT', 'COMMAND', 'QUERY'];
export const PERMISSION_LEVELS = ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'PRIVATE'];
export const STATUS_VALUES = ['active', 'deprecated', 'experimental'];

export const COMMUNICATION_CONTRACTS = [
  {
    sourceEngine: 'LearningEngine',
    targetEngine: 'MemoryEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'PUBLIC',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'LearningEngine',
    targetEngine: 'GoalEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'PUBLIC',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'MemoryEngine',
    targetEngine: 'LearningEngine',
    communicationType: 'RESPONSE',
    messageType: 'RESPONSE',
    permission: 'PUBLIC',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'PracticeEngine',
    targetEngine: 'LearningEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'INTERNAL',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'PracticeEngine',
    targetEngine: 'MemoryEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'INTERNAL',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'GoalEngine',
    targetEngine: 'LearningEngine',
    communicationType: 'NOTIFICATION',
    messageType: 'EVENT',
    permission: 'PUBLIC',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'AnalyticsEngine',
    targetEngine: 'LearningEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'INTERNAL',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'AnalyticsEngine',
    targetEngine: 'MemoryEngine',
    communicationType: 'REQUEST',
    messageType: 'QUERY',
    permission: 'INTERNAL',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'GovernanceEngine',
    targetEngine: 'EventBus',
    communicationType: 'NOTIFICATION',
    messageType: 'EVENT',
    permission: 'RESTRICTED',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'BootManager',
    targetEngine: 'RuntimeKernel',
    communicationType: 'COMMAND',
    messageType: 'COMMAND',
    permission: 'RESTRICTED',
    version: '1.0',
    status: 'active'
  },
  {
    sourceEngine: 'RuntimeKernel',
    targetEngine: 'BootManager',
    communicationType: 'RESPONSE',
    messageType: 'RESPONSE',
    permission: 'RESTRICTED',
    version: '1.0',
    status: 'active'
  }
];

export function getContracts() {
  return JSON.parse(JSON.stringify(COMMUNICATION_CONTRACTS));
}

export function getContractBySource(source) {
  return COMMUNICATION_CONTRACTS.filter(c => c.sourceEngine === source);
}

export function getContractByTarget(target) {
  return COMMUNICATION_CONTRACTS.filter(c => c.targetEngine === target);
}

export function getContract(source, target) {
  return COMMUNICATION_CONTRACTS.find(c => c.sourceEngine === source && c.targetEngine === target) || null;
}

export function getAllSources() {
  return [...new Set(COMMUNICATION_CONTRACTS.map(c => c.sourceEngine))];
}

export function getAllTargets() {
  return [...new Set(COMMUNICATION_CONTRACTS.map(c => c.targetEngine))];
}

export function getAllMessageTypes() {
  return [...new Set(COMMUNICATION_CONTRACTS.map(c => c.messageType))];
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCommunicationManifest = {
    COMMUNICATION_TYPES,
    PERMISSION_LEVELS,
    STATUS_VALUES,
    COMMUNICATION_CONTRACTS,
    getContracts,
    getContractBySource,
    getContractByTarget,
    getContract,
    getAllSources,
    getAllTargets,
    getAllMessageTypes,
    init: function() { console.log('✅ EngineCommunicationManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCommunicationManifest = window.engineCommunicationManifest;
  }
}
