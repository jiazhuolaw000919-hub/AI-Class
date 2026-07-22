/**
 * System Evolution Manifest
 * Maintains architecture version and evolution milestones.
 * Read only – do not modify at runtime.
 */

export const EVOLUTION_MANIFEST = {
  architectureVersion: '5.0.0',
  recoveryVersion: 'R1',
  recoveryStage: 'Complete',
  governanceStage: 'Stabilized',
  timeline: [
    { date: '2024-01-01', event: 'Initial Architecture', version: '1.0.0' },
    { date: '2024-03-01', event: 'Runtime Core Added', version: '1.1.0' },
    { date: '2024-05-01', event: 'Governance Layer', version: '2.0.0' },
    { date: '2024-07-01', event: 'Registry Governance', version: '2.1.0' },
    { date: '2024-09-01', event: 'Domain Architecture', version: '3.0.0' },
    { date: '2024-11-01', event: 'Engine Constitution', version: '3.1.0' },
    { date: '2025-01-01', event: 'Recovery R1 Begins', version: '3.2.0' },
    { date: '2025-03-01', event: 'Governance Expansion', version: '4.0.0' },
    { date: '2025-05-01', event: 'Recovery R1 Complete', version: '4.1.0' },
    { date: '2025-07-01', event: 'System Awareness', version: '4.2.0' },
    { date: '2025-09-01', event: 'System Intelligence', version: '4.3.0' },
    { date: '2025-11-01', event: 'System Memory & Reflection', version: '5.0.0' },
    { date: '2026-01-01', event: 'System Decision Layer', version: '5.1.0' },
    { date: '2026-07-01', event: 'System Evolution Layer', version: '5.2.0' }
  ],
  milestones: [
    { id: 'M1', name: 'Initial Architecture', completed: true, version: '1.0.0' },
    { id: 'M2', name: 'Runtime Stabilization', completed: true, version: '1.1.0' },
    { id: 'M3', name: 'Governance Framework', completed: true, version: '2.0.0' },
    { id: 'M4', name: 'Registry Governance', completed: true, version: '2.1.0' },
    { id: 'M5', name: 'Domain Architecture', completed: true, version: '3.0.0' },
    { id: 'M6', name: 'Engine Constitution', completed: true, version: '3.1.0' },
    { id: 'M7', name: 'Recovery R1 Launch', completed: true, version: '3.2.0' },
    { id: 'M8', name: 'Governance Expansion', completed: true, version: '4.0.0' },
    { id: 'M9', name: 'Recovery R1 Complete', completed: true, version: '4.1.0' },
    { id: 'M10', name: 'System Awareness', completed: true, version: '4.2.0' },
    { id: 'M11', name: 'System Intelligence', completed: true, version: '4.3.0' },
    { id: 'M12', name: 'Memory & Reflection', completed: true, version: '5.0.0' },
    { id: 'M13', name: 'System Decision Layer', completed: true, version: '5.1.0' },
    { id: 'M14', name: 'System Evolution Layer', completed: true, version: '5.2.0' }
  ]
};

export function getEvolutionManifest() {
  return JSON.parse(JSON.stringify(EVOLUTION_MANIFEST));
}

export function getArchitectureVersion() {
  return EVOLUTION_MANIFEST.architectureVersion;
}

export function getRecoveryVersion() {
  return EVOLUTION_MANIFEST.recoveryVersion;
}

export function getRecoveryStage() {
  return EVOLUTION_MANIFEST.recoveryStage;
}

export function getGovernanceStage() {
  return EVOLUTION_MANIFEST.governanceStage;
}

export function getTimeline() {
  return JSON.parse(JSON.stringify(EVOLUTION_MANIFEST.timeline));
}

export function getMilestones() {
  return JSON.parse(JSON.stringify(EVOLUTION_MANIFEST.milestones));
}

export function getCompletedMilestones() {
  return EVOLUTION_MANIFEST.milestones.filter(m => m.completed);
}

export function getNextMilestone() {
  return EVOLUTION_MANIFEST.milestones.find(m => !m.completed) || null;
}

export function getMilestoneCount() {
  return EVOLUTION_MANIFEST.milestones.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemEvolutionManifest = {
    EVOLUTION_MANIFEST,
    getEvolutionManifest,
    getArchitectureVersion,
    getRecoveryVersion,
    getRecoveryStage,
    getGovernanceStage,
    getTimeline,
    getMilestones,
    getCompletedMilestones,
    getNextMilestone,
    getMilestoneCount,
    init: function() { console.log('✅ SystemEvolutionManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemEvolutionManifest = window.systemEvolutionManifest;
  }
}
