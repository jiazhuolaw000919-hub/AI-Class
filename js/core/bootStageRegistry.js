/**
 * Boot Stage Registry
 * Central registry of boot stages.
 * Read only.
 */

export const BOOT_STAGE_REGISTRY = [
  {
    name: 'BOOT_START',
    order: 0,
    owner: 'BootManager',
    required: true,
    description: 'Initialize boot process'
  },
  {
    name: 'RUNTIME_INIT',
    order: 1,
    owner: 'Runtime Core',
    required: true,
    description: 'Initialize runtime kernel'
  },
  {
    name: 'ARCHITECTURE_CHECK',
    order: 2,
    owner: 'Architecture',
    required: true,
    description: 'Validate architecture'
  },
  {
    name: 'REGISTRY_LOAD',
    order: 3,
    owner: 'Registry',
    required: true,
    description: 'Load all registries'
  },
  {
    name: 'GOVERNANCE_LOAD',
    order: 4,
    owner: 'Governance',
    required: true,
    description: 'Load governance systems'
  },
  {
    name: 'ENGINE_LOAD',
    order: 5,
    owner: 'Engine',
    required: true,
    description: 'Load engine systems'
  },
  {
    name: 'INTELLIGENCE_LOAD',
    order: 6,
    owner: 'Intelligence',
    required: false,
    description: 'Load intelligence layers'
  },
  {
    name: 'HEALTH_CHECK',
    order: 7,
    owner: 'Health',
    required: true,
    description: 'Run health diagnostics'
  },
  {
    name: 'SYSTEM_READY',
    order: 8,
    owner: 'BootManager',
    required: true,
    description: 'System ready notification'
  }
];

export function getStageRegistry() {
  return JSON.parse(JSON.stringify(BOOT_STAGE_REGISTRY));
}

export function getStageByName(name) {
  return BOOT_STAGE_REGISTRY.find(function(s) { return s.name === name; }) || null;
}

export function getStageByOrder(order) {
  return BOOT_STAGE_REGISTRY.find(function(s) { return s.order === order; }) || null;
}

export function getRequiredStages() {
  return BOOT_STAGE_REGISTRY.filter(function(s) { return s.required; });
}

export function getOptionalStages() {
  return BOOT_STAGE_REGISTRY.filter(function(s) { return !s.required; });
}

export function getStageCount() {
  return BOOT_STAGE_REGISTRY.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootStageRegistry = {
    BOOT_STAGE_REGISTRY: BOOT_STAGE_REGISTRY,
    getStageRegistry: getStageRegistry,
    getStageByName: getStageByName,
    getStageByOrder: getStageByOrder,
    getRequiredStages: getRequiredStages,
    getOptionalStages: getOptionalStages,
    getStageCount: getStageCount,
    init: function() {
      console.log('📋 Boot Stage Registry Ready');
      console.log('  📋 Stages:', getStageCount());
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootStageRegistry = window.bootStageRegistry;
  }
}
