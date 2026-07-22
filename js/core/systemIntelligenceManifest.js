/**
 * System Intelligence Manifest
 * Maintains official intelligence domains.
 * Read only – do not modify at runtime.
 */

export const INTELLIGENCE_DOMAINS = [
  {
    id: 'runtime',
    name: 'Runtime Intelligence',
    source: 'RuntimeHealth',
    version: '1.0',
    status: 'active',
    description: 'Runtime health and status information'
  },
  {
    id: 'architecture',
    name: 'Architecture Intelligence',
    source: 'ArchitectureValidator',
    version: '1.0',
    status: 'active',
    description: 'Architecture governance and validation'
  },
  {
    id: 'engine',
    name: 'Engine Intelligence',
    source: 'EngineHealth',
    version: '1.0',
    status: 'active',
    description: 'Engine health and standards compliance'
  },
  {
    id: 'registry',
    name: 'Registry Intelligence',
    source: 'RegistryHealth',
    version: '1.0',
    status: 'active',
    description: 'Registry health and completeness'
  },
  {
    id: 'dependency',
    name: 'Dependency Intelligence',
    source: 'DependencyHealth',
    version: '1.0',
    status: 'active',
    description: 'Dependency governance health'
  },
  {
    id: 'lifecycle',
    name: 'Lifecycle Intelligence',
    source: 'LifecycleHealth',
    version: '1.0',
    status: 'active',
    description: 'Lifecycle governance health'
  },
  {
    id: 'capability',
    name: 'Capability Intelligence',
    source: 'CapabilityHealth',
    version: '1.0',
    status: 'active',
    description: 'Capability governance health'
  },
  {
    id: 'communication',
    name: 'Communication Intelligence',
    source: 'EngineCommunicationHealth',
    version: '1.0',
    status: 'active',
    description: 'Engine communication health'
  },
  {
    id: 'signal',
    name: 'Signal Intelligence',
    source: 'EngineSignalHealth',
    version: '1.0',
    status: 'active',
    description: 'Engine signal health'
  }
];

export function getIntelligenceDomains() {
  return JSON.parse(JSON.stringify(INTELLIGENCE_DOMAINS));
}

export function getDomainById(id) {
  return INTELLIGENCE_DOMAINS.find(d => d.id === id) || null;
}

export function getActiveDomains() {
  return INTELLIGENCE_DOMAINS.filter(d => d.status === 'active');
}

export function getDomainCount() {
  return INTELLIGENCE_DOMAINS.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntelligenceManifest = {
    INTELLIGENCE_DOMAINS,
    getIntelligenceDomains,
    getDomainById,
    getActiveDomains,
    getDomainCount,
    init: function() { console.log('✅ SystemIntelligenceManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntelligenceManifest = window.systemIntelligenceManifest;
  }
}
