/**
 * Runtime Trace Manifest
 * Maintains official trace types.
 * Read only – do not modify at runtime.
 */

export const TRACE_TYPES = [
  { id: 'BOOT', description: 'Boot process trace' },
  { id: 'PIPELINE', description: 'Pipeline execution trace' },
  { id: 'STAGE', description: 'Individual stage trace' },
  { id: 'ENGINE', description: 'Engine lifecycle trace' },
  { id: 'RUNTIME', description: 'Runtime state trace' },
  { id: 'HEALTH', description: 'Health check trace' }
];

export const TRACE_STATUSES = ['STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT'];

export function getTraceTypes() {
  return JSON.parse(JSON.stringify(TRACE_TYPES));
}

export function getTraceTypeById(id) {
  return TRACE_TYPES.find(t => t.id === id) || null;
}

export function getTraceStatuses() {
  return TRACE_STATUSES.slice();
}

export function isValidStatus(status) {
  return TRACE_STATUSES.indexOf(status) !== -1;
}

export function getTraceCount() {
  return TRACE_TYPES.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeTraceManifest = {
    TRACE_TYPES,
    TRACE_STATUSES,
    getTraceTypes,
    getTraceTypeById,
    getTraceStatuses,
    isValidStatus,
    getTraceCount,
    init: function() { console.log('✅ RuntimeTraceManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeTraceManifest = window.runtimeTraceManifest;
  }
}
