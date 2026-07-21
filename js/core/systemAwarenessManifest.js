/**
 * System Awareness Manifest
 * Maintains official awareness sources.
 * Read only – do not modify at runtime.
 */

export const AWARENESS_SOURCES = [
  {
    id: 'runtime',
    name: 'Runtime',
    description: 'Runtime status and health information',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'engine',
    name: 'Engine',
    description: 'Engine registry and status information',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'domain',
    name: 'Domain',
    description: 'Domain architecture and distribution',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'capability',
    name: 'Capability',
    description: 'Capability registry and coverage',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Health monitoring and scores',
    version: '1.0',
    status: 'active'
  }
];

export function getAwarenessSources() {
  return JSON.parse(JSON.stringify(AWARENESS_SOURCES));
}

export function getSourceById(id) {
  return AWARENESS_SOURCES.find(s => s.id === id) || null;
}

export function getActiveSources() {
  return AWARENESS_SOURCES.filter(s => s.status === 'active');
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAwarenessManifest = {
    AWARENESS_SOURCES,
    getAwarenessSources,
    getSourceById,
    getActiveSources,
    init: function() { console.log('✅ SystemAwarenessManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAwarenessManifest = window.systemAwarenessManifest;
  }
}
