/**
 * Engine State Manifest
 * Maintains every official Engine State.
 * Read only – do not modify at runtime.
 */

export const ENGINE_STATES = [
  { id: 'UNREGISTERED', category: 'Initial', description: 'Engine not yet registered', status: 'active' },
  { id: 'REGISTERED', category: 'Initial', description: 'Engine registered but not initialized', status: 'active' },
  { id: 'INITIALIZING', category: 'Transition', description: 'Engine is initializing', status: 'active' },
  { id: 'READY', category: 'Ready', description: 'Engine initialized and ready', status: 'active' },
  { id: 'ACTIVE', category: 'Active', description: 'Engine actively processing', status: 'active' },
  { id: 'IDLE', category: 'Active', description: 'Engine active but idle', status: 'active' },
  { id: 'SLEEP', category: 'Active', description: 'Engine in low‑power state', status: 'active' },
  { id: 'PAUSED', category: 'Active', description: 'Engine temporarily paused', status: 'active' },
  { id: 'WAITING', category: 'Active', description: 'Engine waiting for resources', status: 'active' },
  { id: 'UPDATING', category: 'Transition', description: 'Engine updating configuration', status: 'active' },
  { id: 'ERROR', category: 'Error', description: 'Recoverable error occurred', status: 'active' },
  { id: 'FAILED', category: 'Error', description: 'Fatal error occurred', status: 'active' },
  { id: 'DISABLED', category: 'Terminal', description: 'Manually disabled', status: 'active' },
  { id: 'DEPRECATED', category: 'Terminal', description: 'Deprecated, pending removal', status: 'active' },
  { id: 'DESTROYED', category: 'Terminal', description: 'Engine destroyed', status: 'active' }
];

export const STATE_CATEGORIES = {
  Initial: ['UNREGISTERED', 'REGISTERED'],
  Transition: ['INITIALIZING', 'UPDATING'],
  Ready: ['READY'],
  Active: ['ACTIVE', 'IDLE', 'SLEEP', 'PAUSED', 'WAITING'],
  Error: ['ERROR', 'FAILED'],
  Terminal: ['DISABLED', 'DEPRECATED', 'DESTROYED']
};

export const STATE_TRANSITIONS = {
  UNREGISTERED: { to: ['REGISTERED'] },
  REGISTERED: { to: ['INITIALIZING', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  INITIALIZING: { to: ['READY', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  READY: { to: ['ACTIVE', 'UPDATING', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  ACTIVE: { to: ['IDLE', 'SLEEP', 'PAUSED', 'WAITING', 'UPDATING', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  IDLE: { to: ['ACTIVE', 'SLEEP', 'PAUSED', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  SLEEP: { to: ['ACTIVE', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  PAUSED: { to: ['ACTIVE', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  WAITING: { to: ['ACTIVE', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  UPDATING: { to: ['READY', 'ERROR', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  ERROR: { to: ['READY', 'ACTIVE', 'FAILED', 'DISABLED', 'DEPRECATED', 'DESTROYED'] },
  FAILED: { to: ['DISABLED', 'DEPRECATED', 'DESTROYED'] },
  DISABLED: { to: ['ENABLED', 'DEPRECATED', 'DESTROYED'] },
  DEPRECATED: { to: ['DESTROYED'] },
  DESTROYED: { to: [] }
};

export function getEngineStates() {
  return JSON.parse(JSON.stringify(ENGINE_STATES));
}

export function getStateById(id) {
  return ENGINE_STATES.find(s => s.id === id) || null;
}

export function getStatesByCategory(category) {
  return ENGINE_STATES.filter(s => s.category === category);
}

export function getCategories() {
  return Object.keys(STATE_CATEGORIES);
}

export function getStatesForCategory(category) {
  return STATE_CATEGORIES[category] || [];
}

export function getTransitions(fromState) {
  return STATE_TRANSITIONS[fromState] || { to: [] };
}

export function isValidTransition(fromState, toState) {
  var transitions = STATE_TRANSITIONS[fromState];
  if (!transitions) return false;
  return transitions.to.indexOf(toState) !== -1;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineStateManifest = {
    ENGINE_STATES,
    STATE_CATEGORIES,
    STATE_TRANSITIONS,
    getEngineStates,
    getStateById,
    getStatesByCategory,
    getCategories,
    getStatesForCategory,
    getTransitions,
    isValidTransition,
    init: function() { console.log('✅ EngineStateManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineStateManifest = window.engineStateManifest;
  }
}
