/**
 * Engine Signal Manifest
 * Maintains official signal definitions.
 * Read only – do not modify at runtime.
 */

export const SIGNAL_TYPES = ['STATUS', 'HEALTH', 'PERFORMANCE', 'LIFECYCLE', 'COMMUNICATION', 'COORDINATION', 'DISCOVERY', 'EVENT'];
export const SEVERITY_LEVELS = ['INFO', 'WARNING', 'ERROR', 'CRITICAL', 'RECOVERED'];

export const OFFICIAL_SIGNALS = [
  {
    name: 'ENGINE_STARTED',
    type: 'LIFECYCLE',
    severity: 'INFO',
    source: 'Engine',
    description: 'Engine has started initialization',
    version: '1.0'
  },
  {
    name: 'ENGINE_READY',
    type: 'LIFECYCLE',
    severity: 'INFO',
    source: 'Engine',
    description: 'Engine is ready and operational',
    version: '1.0'
  },
  {
    name: 'ENGINE_IDLE',
    type: 'STATUS',
    severity: 'INFO',
    source: 'Engine',
    description: 'Engine is idle with no active tasks',
    version: '1.0'
  },
  {
    name: 'ENGINE_BUSY',
    type: 'STATUS',
    severity: 'INFO',
    source: 'Engine',
    description: 'Engine is actively processing',
    version: '1.0'
  },
  {
    name: 'ENGINE_WARNING',
    type: 'HEALTH',
    severity: 'WARNING',
    source: 'Engine',
    description: 'Engine has detected a warning condition',
    version: '1.0'
  },
  {
    name: 'ENGINE_ERROR',
    type: 'HEALTH',
    severity: 'ERROR',
    source: 'Engine',
    description: 'Engine has encountered an error',
    version: '1.0'
  },
  {
    name: 'ENGINE_RECOVERED',
    type: 'HEALTH',
    severity: 'RECOVERED',
    source: 'Engine',
    description: 'Engine has recovered from error state',
    version: '1.0'
  },
  {
    name: 'ENGINE_UPDATED',
    type: 'LIFECYCLE',
    severity: 'INFO',
    source: 'Engine',
    description: 'Engine configuration or version updated',
    version: '1.0'
  },
  {
    name: 'ENGINE_DEPRECATED',
    type: 'LIFECYCLE',
    severity: 'WARNING',
    source: 'Engine',
    description: 'Engine has been marked deprecated',
    version: '1.0'
  }
];

export function getSignals() {
  return JSON.parse(JSON.stringify(OFFICIAL_SIGNALS));
}

export function getSignalByName(name) {
  return OFFICIAL_SIGNALS.find(s => s.name === name) || null;
}

export function getSignalsByType(type) {
  return OFFICIAL_SIGNALS.filter(s => s.type === type);
}

export function getSignalsBySeverity(severity) {
  return OFFICIAL_SIGNALS.filter(s => s.severity === severity);
}

export function getSignalsBySource(source) {
  return OFFICIAL_SIGNALS.filter(s => s.source === source);
}

export function getAllTypes() {
  return [...new Set(OFFICIAL_SIGNALS.map(s => s.type))];
}

export function getAllSeverities() {
  return [...new Set(OFFICIAL_SIGNALS.map(s => s.severity))];
}

export function getAllSources() {
  return [...new Set(OFFICIAL_SIGNALS.map(s => s.source))];
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineSignalManifest = {
    SIGNAL_TYPES,
    SEVERITY_LEVELS,
    OFFICIAL_SIGNALS,
    getSignals,
    getSignalByName,
    getSignalsByType,
    getSignalsBySeverity,
    getSignalsBySource,
    getAllTypes,
    getAllSeverities,
    getAllSources,
    init: function() { console.log('✅ EngineSignalManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineSignalManifest = window.engineSignalManifest;
  }
}
