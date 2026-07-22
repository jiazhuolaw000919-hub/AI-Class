/**
 * System Maturity Manifest
 * Maintains official maturity model.
 * Read only – do not modify at runtime.
 */

export const MATURITY_STAGES = [
  { id: 'foundation', name: 'Foundation', order: 0, description: 'Basic system structure exists' },
  { id: 'structured', name: 'Structured', order: 1, description: 'Organized architecture with governance' },
  { id: 'governed', name: 'Governed', order: 2, description: 'Full governance coverage' },
  { id: 'intelligent', name: 'Intelligent', order: 3, description: 'Intelligence layers operational' },
  { id: 'adaptive', name: 'Adaptive', order: 4, description: 'System can observe and recommend' },
  { id: 'mature', name: 'Mature', order: 5, description: 'Full system maturity achieved' }
];

export const MATURITY_CRITERIA = {
  architecture: {
    weight: 25,
    required: ['Architecture', 'Runtime', 'Governance']
  },
  runtime: {
    weight: 20,
    required: ['RuntimeKernel', 'RuntimeStatus', 'RuntimeHealth']
  },
  governance: {
    weight: 25,
    required: ['EngineGovernance', 'RegistryGovernance', 'DomainGovernance']
  },
  intelligence: {
    weight: 20,
    required: ['Awareness', 'Intelligence', 'Memory']
  },
  consistency: {
    weight: 10,
    required: ['Coherence', 'Continuity', 'Identity']
  }
};

export const MATURITY_MILESTONES = [
  { id: 'M1', name: 'Architecture Foundation', stage: 'foundation', completed: true },
  { id: 'M2', name: 'Runtime Stabilization', stage: 'foundation', completed: true },
  { id: 'M3', name: 'Governance Framework', stage: 'structured', completed: true },
  { id: 'M4', name: 'Registry Governance', stage: 'structured', completed: true },
  { id: 'M5', name: 'Domain Architecture', stage: 'governed', completed: true },
  { id: 'M6', name: 'Engine Constitution', stage: 'governed', completed: true },
  { id: 'M7', name: 'Recovery R1 Launch', stage: 'governed', completed: true },
  { id: 'M8', name: 'System Awareness', stage: 'intelligent', completed: true },
  { id: 'M9', name: 'System Intelligence', stage: 'intelligent', completed: true },
  { id: 'M10', name: 'System Memory', stage: 'intelligent', completed: true },
  { id: 'M11', name: 'System Reflection', stage: 'adaptive', completed: true },
  { id: 'M12', name: 'System Decision', stage: 'adaptive', completed: true },
  { id: 'M13', name: 'System Evolution', stage: 'adaptive', completed: true },
  { id: 'M14', name: 'System Coherence', stage: 'mature', completed: true },
  { id: 'M15', name: 'System Continuity', stage: 'mature', completed: true },
  { id: 'M16', name: 'System Identity', stage: 'mature', completed: true },
  { id: 'M17', name: 'System Maturity', stage: 'mature', completed: true }
];

export function getMaturityStages() {
  return JSON.parse(JSON.stringify(MATURITY_STAGES));
}

export function getStageById(id) {
  return MATURITY_STAGES.find(s => s.id === id) || null;
}

export function getStageByOrder(order) {
  return MATURITY_STAGES.find(s => s.order === order) || null;
}

export function getMaturityCriteria() {
  return JSON.parse(JSON.stringify(MATURITY_CRITERIA));
}

export function getMaturityMilestones() {
  return JSON.parse(JSON.stringify(MATURITY_MILESTONES));
}

export function getMilestonesByStage(stage) {
  return MATURITY_MILESTONES.filter(m => m.stage === stage);
}

export function getStageCount() {
  return MATURITY_STAGES.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMaturityManifest = {
    MATURITY_STAGES,
    MATURITY_CRITERIA,
    MATURITY_MILESTONES,
    getMaturityStages,
    getStageById,
    getStageByOrder,
    getMaturityCriteria,
    getMaturityMilestones,
    getMilestonesByStage,
    getStageCount,
    init: function() { console.log('✅ SystemMaturityManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMaturityManifest = window.systemMaturityManifest;
  }
}
