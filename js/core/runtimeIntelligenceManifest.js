/**
 * Runtime Intelligence Manifest
 * Maintains every Runtime Observation Target.
 * Read only – do not modify at runtime.
 */

export const OBSERVATION_TARGETS = [
  {
    id: 'engine_status',
    name: 'Engine Status',
    target: 'ENGINE',
    observation: 'status',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'engine_metadata',
    name: 'Engine Metadata',
    target: 'ENGINE',
    observation: 'metadata',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'runtime_status',
    name: 'Runtime Status',
    target: 'RUNTIME',
    observation: 'status',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'runtime_health',
    name: 'Runtime Health',
    target: 'RUNTIME',
    observation: 'health',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'lifecycle_state',
    name: 'Lifecycle State',
    target: 'LIFECYCLE',
    observation: 'state',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'lifecycle_events',
    name: 'Lifecycle Events',
    target: 'LIFECYCLE',
    observation: 'events',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'registry_modules',
    name: 'Registry Modules',
    target: 'REGISTRY',
    observation: 'modules',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'registry_engines',
    name: 'Registry Engines',
    target: 'REGISTRY',
    observation: 'engines',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'performance_metrics',
    name: 'Performance Metrics',
    target: 'PERFORMANCE',
    observation: 'metrics',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health_scores',
    name: 'Health Scores',
    target: 'HEALTH',
    observation: 'scores',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health_warnings',
    name: 'Health Warnings',
    target: 'HEALTH',
    observation: 'warnings',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health_violations',
    name: 'Health Violations',
    target: 'HEALTH',
    observation: 'violations',
    version: '1.0',
    status: 'active'
  }
];

export const OBSERVATION_SOURCES = [
  'LawAIApp',
  'window',
  'runtimeRegistry',
  'engineRegistry',
  'eventBus',
  'runtimeHealth',
  'lifecycleHealth',
  'governanceHealth'
];

export const OBSERVATION_TYPES = [
  'status',
  'metadata',
  'health',
  'state',
  'events',
  'modules',
  'engines',
  'metrics',
  'scores',
  'warnings',
  'violations'
];

export function getObservationTargets() {
  return [...OBSERVATION_TARGETS];
}

export function getTargetById(id) {
  return OBSERVATION_TARGETS.find(t => t.id === id) || null;
}

export function getTargetsByObservation(type) {
  return OBSERVATION_TARGETS.filter(t => t.observation === type);
}

export function isObservationTarget(id) {
  return OBSERVATION_TARGETS.some(t => t.id === id);
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeIntelligenceManifest = {
    OBSERVATION_TARGETS,
    OBSERVATION_SOURCES,
    OBSERVATION_TYPES,
    getObservationTargets,
    getTargetById,
    getTargetsByObservation,
    isObservationTarget,
    init: function() { console.log('✅ RuntimeIntelligenceManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeIntelligenceManifest = {
      OBSERVATION_TARGETS,
      OBSERVATION_SOURCES,
      OBSERVATION_TYPES,
      getObservationTargets,
      getTargetById,
      getTargetsByObservation,
      isObservationTarget,
      init: function() { console.log('✅ RuntimeIntelligenceManifest ready'); return this; }
    };
  }
}
