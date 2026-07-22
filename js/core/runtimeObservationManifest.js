/**
 * Runtime Observation Manifest
 * Maintains official observation events.
 * Read only – do not modify at runtime.
 */

export const OBSERVATION_EVENTS = [
  { id: 'BOOT_STARTED', category: 'boot', description: 'Boot process has started' },
  { id: 'BOOT_STAGE_STARTED', category: 'boot', description: 'A boot stage has started' },
  { id: 'BOOT_STAGE_COMPLETED', category: 'boot', description: 'A boot stage has completed' },
  { id: 'BOOT_STAGE_FAILED', category: 'boot', description: 'A boot stage has failed' },
  { id: 'RUNTIME_READY', category: 'runtime', description: 'Runtime is ready' },
  { id: 'RUNTIME_WARNING', category: 'runtime', description: 'Runtime warning occurred' },
  { id: 'RUNTIME_ERROR', category: 'runtime', description: 'Runtime error occurred' },
  { id: 'HEALTH_UPDATED', category: 'health', description: 'Health score updated' }
];

export const OBSERVATION_CATEGORIES = ['boot', 'runtime', 'health'];

export function getObservationEvents() {
  return JSON.parse(JSON.stringify(OBSERVATION_EVENTS));
}

export function getEventById(id) {
  return OBSERVATION_EVENTS.find(e => e.id === id) || null;
}

export function getEventsByCategory(category) {
  return OBSERVATION_EVENTS.filter(e => e.category === category);
}

export function getEventCount() {
  return OBSERVATION_EVENTS.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeObservationManifest = {
    OBSERVATION_EVENTS,
    OBSERVATION_CATEGORIES,
    getObservationEvents,
    getEventById,
    getEventsByCategory,
    getEventCount,
    init: function() { console.log('✅ RuntimeObservationManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeObservationManifest = window.runtimeObservationManifest;
  }
}
