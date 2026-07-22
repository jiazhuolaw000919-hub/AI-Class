/**
 * System Context Manifest
 * Maintains official context types.
 * Read only – do not modify at runtime.
 */

export const CONTEXT_TYPES = [
  {
    id: 'USER_CONTEXT',
    name: 'User Context',
    description: 'Current user identity and preferences',
    ownership: 'User',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SESSION_CONTEXT',
    name: 'Session Context',
    description: 'Active session state and metadata',
    ownership: 'Session',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'LEARNING_CONTEXT',
    name: 'Learning Context',
    description: 'Current learning path and progress',
    ownership: 'Learning',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'RUNTIME_CONTEXT',
    name: 'Runtime Context',
    description: 'Runtime environment and configuration',
    ownership: 'Runtime',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'PROJECT_CONTEXT',
    name: 'Project Context',
    description: 'Active project and workspace',
    ownership: 'Project',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'GOAL_CONTEXT',
    name: 'Goal Context',
    description: 'Current goals and objectives',
    ownership: 'Goal',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'DEVICE_CONTEXT',
    name: 'Device Context',
    description: 'Device capabilities and constraints',
    ownership: 'Device',
    version: '1.0',
    status: 'active'
  }
];

export function getContextTypes() {
  return JSON.parse(JSON.stringify(CONTEXT_TYPES));
}

export function getContextById(id) {
  return CONTEXT_TYPES.find(c => c.id === id) || null;
}

export function getContextsByOwnership(ownership) {
  return CONTEXT_TYPES.filter(c => c.ownership === ownership);
}

export function getActiveContexts() {
  return CONTEXT_TYPES.filter(c => c.status === 'active');
}

export function getContextCount() {
  return CONTEXT_TYPES.length;
}

export function getOwnerships() {
  return [...new Set(CONTEXT_TYPES.map(c => c.ownership))];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContextManifest = {
    CONTEXT_TYPES,
    getContextTypes,
    getContextById,
    getContextsByOwnership,
    getActiveContexts,
    getContextCount,
    getOwnerships,
    init: function() { console.log('✅ SystemContextManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContextManifest = window.systemContextManifest;
  }
}
