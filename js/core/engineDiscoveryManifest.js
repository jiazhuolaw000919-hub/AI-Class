/**
 * Engine Discovery Manifest
 * Maintains metadata for every engine.
 * Read only – do not modify at runtime.
 */

export const ENGINE_METADATA = [
  {
    name: 'LearningEngine',
    domain: 'Core',
    category: 'Learning',
    version: '3.2.0',
    description: 'Manages learning paths, courses, and student progress',
    owner: 'Learning Team',
    status: 'active',
    capabilities: ['learn', 'track_progress', 'recommend_paths'],
    dependencies: ['MemoryEngine', 'GoalEngine']
  },
  {
    name: 'MemoryEngine',
    domain: 'Core',
    category: 'Memory',
    version: '2.1.0',
    description: 'Stores and retrieves knowledge, memories, and learning data',
    owner: 'Memory Team',
    status: 'active',
    capabilities: ['store', 'recall', 'forget', 'review'],
    dependencies: ['StorageEngine']
  },
  {
    name: 'PracticeEngine',
    domain: 'Business',
    category: 'Practice',
    version: '1.8.0',
    description: 'Generates practice exercises and evaluates answers',
    owner: 'Practice Team',
    status: 'active',
    capabilities: ['generate_exercises', 'evaluate_answers', 'provide_feedback'],
    dependencies: ['LearningEngine', 'MemoryEngine']
  },
  {
    name: 'GoalEngine',
    domain: 'Business',
    category: 'Goal',
    version: '2.0.0',
    description: 'Manages user goals, milestones, and achievement tracking',
    owner: 'Goal Team',
    status: 'active',
    capabilities: ['set_goals', 'track_progress', 'detect_milestones'],
    dependencies: ['LearningEngine']
  },
  {
    name: 'AnalyticsEngine',
    domain: 'Support',
    category: 'Analytics',
    version: '1.5.0',
    description: 'Analyzes learning data and generates insights and reports',
    owner: 'Analytics Team',
    status: 'active',
    capabilities: ['analyze', 'generate_reports', 'visualize_data'],
    dependencies: ['LearningEngine', 'MemoryEngine']
  },
  {
    name: 'GovernanceEngine',
    domain: 'Core',
    category: 'Governance',
    version: '2.3.0',
    description: 'Enforces governance rules and validates compliance',
    owner: 'Governance Team',
    status: 'active',
    capabilities: ['validate', 'audit', 'report_compliance'],
    dependencies: ['EventBus']
  },
  {
    name: 'EventBus',
    domain: 'Core',
    category: 'Integration',
    version: '1.0.0',
    description: 'Central event communication bus for all engines',
    owner: 'Core Team',
    status: 'active',
    capabilities: ['emit', 'listen', 'subscribe'],
    dependencies: []
  },
  {
    name: 'RuntimeKernel',
    domain: 'Core',
    category: 'Utility',
    version: '2.0.0',
    description: 'Core runtime kernel managing engine lifecycle',
    owner: 'Core Team',
    status: 'active',
    capabilities: ['boot', 'shutdown', 'health_check'],
    dependencies: ['EventBus']
  },
  {
    name: 'BootManager',
    domain: 'Core',
    category: 'Utility',
    version: '3.2.0',
    description: 'Manages system startup sequence and engine initialization',
    owner: 'Core Team',
    status: 'active',
    capabilities: ['start', 'mark_stage', 'get_status'],
    dependencies: ['RuntimeKernel', 'EventBus']
  },
  {
    name: 'UIRegistry',
    domain: 'Support',
    category: 'UI',
    version: '1.2.0',
    description: 'Registers and manages UI components and layouts',
    owner: 'UI Team',
    status: 'active',
    capabilities: ['register_component', 'get_component', 'list_components'],
    dependencies: []
  }
];

export function getEngineMetadata() {
  return JSON.parse(JSON.stringify(ENGINE_METADATA));
}

export function getEngineByName(name) {
  return ENGINE_METADATA.find(e => e.name === name) || null;
}

export function getEnginesByDomain(domain) {
  return ENGINE_METADATA.filter(e => e.domain === domain);
}

export function getEnginesByCategory(category) {
  return ENGINE_METADATA.filter(e => e.category === category);
}

export function getEnginesByCapability(capability) {
  return ENGINE_METADATA.filter(e => e.capabilities.includes(capability));
}

export function getAllDomains() {
  return [...new Set(ENGINE_METADATA.map(e => e.domain))];
}

export function getAllCategories() {
  return [...new Set(ENGINE_METADATA.map(e => e.category))];
}

export function getAllCapabilities() {
  const all = [];
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    for (let j = 0; j < ENGINE_METADATA[i].capabilities.length; j++) {
      all.push(ENGINE_METADATA[i].capabilities[j]);
    }
  }
  return [...new Set(all)];
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineDiscoveryManifest = {
    ENGINE_METADATA,
    getEngineMetadata,
    getEngineByName,
    getEnginesByDomain,
    getEnginesByCategory,
    getEnginesByCapability,
    getAllDomains,
    getAllCategories,
    getAllCapabilities,
    init: function() { console.log('✅ EngineDiscoveryManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineDiscoveryManifest = window.engineDiscoveryManifest;
  }
}
