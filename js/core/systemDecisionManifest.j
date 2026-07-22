/**
 * System Decision Manifest
 * Maintains official decision categories and rules.
 * Read only – do not modify at runtime.
 */

export const DECISION_CATEGORIES = [
  {
    id: 'runtime',
    name: 'Runtime Decisions',
    description: 'Decisions about runtime state',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'architecture',
    name: 'Architecture Decisions',
    description: 'Decisions about architecture',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'governance',
    name: 'Governance Decisions',
    description: 'Decisions about governance',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'recovery',
    name: 'Recovery Decisions',
    description: 'Recovery recommendations',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health',
    name: 'Health Decisions',
    description: 'Health-related decisions',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'memory',
    name: 'Memory Decisions',
    description: 'Memory management decisions',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'reflection',
    name: 'Reflection Decisions',
    description: 'Reflection-based decisions',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'version',
    name: 'Version Decisions',
    description: 'Version-related decisions',
    version: '1.0',
    status: 'active'
  }
];

export const DECISION_RULES = [
  {
    id: 'HEALTH_LOW',
    name: 'Health Low',
    condition: 'healthScore < 60',
    decision: 'RECOMMEND_HEALTH_SCAN',
    category: 'health',
    severity: 'warning',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'RECOVERY_NEEDED',
    name: 'Recovery Needed',
    condition: 'recoveryScore < 50',
    decision: 'RECOMMEND_RECOVERY',
    category: 'recovery',
    severity: 'error',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'MEMORY_HIGH',
    name: 'Memory High',
    condition: 'memoryEntries > 800',
    decision: 'RECOMMEND_CLEANUP',
    category: 'memory',
    severity: 'warning',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'REGISTRY_DEPRECATED',
    name: 'Registry Deprecated',
    condition: 'deprecatedEngines > 10%',
    decision: 'RECOMMEND_REGISTRY_REVIEW',
    category: 'runtime',
    severity: 'warning',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'DEPENDENCY_CIRCULAR',
    name: 'Dependency Circular',
    condition: 'circularDependencies > 3',
    decision: 'RECOMMEND_DEPENDENCY_REVIEW',
    category: 'governance',
    severity: 'error',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'RUNTIME_ERROR',
    name: 'Runtime Error',
    condition: 'runtimeErrors > 5',
    decision: 'RECOMMEND_RUNTIME_REFRESH',
    category: 'runtime',
    severity: 'error',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'ARCHITECTURE_VIOLATION',
    name: 'Architecture Violation',
    condition: 'architectureViolations > 5',
    decision: 'RECOMMEND_ARCHITECTURE_REVIEW',
    category: 'architecture',
    severity: 'error',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'GOVERNANCE_WARNING',
    name: 'Governance Warning',
    condition: 'governanceWarnings > 10',
    decision: 'RECOMMEND_GOVERNANCE_REVIEW',
    category: 'governance',
    severity: 'warning',
    version: '1.0',
    status: 'active'
  }
];

export const DECISION_TYPES = [
  'RECOMMEND_RECOVERY',
  'RECOMMEND_CLEANUP',
  'RECOMMEND_HEALTH_SCAN',
  'RECOMMEND_REGISTRY_REVIEW',
  'RECOMMEND_DEPENDENCY_REVIEW',
  'RECOMMEND_RUNTIME_REFRESH',
  'RECOMMEND_ARCHITECTURE_REVIEW',
  'RECOMMEND_GOVERNANCE_REVIEW'
];

export function getDecisionCategories() {
  return JSON.parse(JSON.stringify(DECISION_CATEGORIES));
}

export function getCategoryById(id) {
  return DECISION_CATEGORIES.find(c => c.id === id) || null;
}

export function getDecisionRules() {
  return JSON.parse(JSON.stringify(DECISION_RULES));
}

export function getRuleById(id) {
  return DECISION_RULES.find(r => r.id === id) || null;
}

export function getActiveRules() {
  return DECISION_RULES.filter(r => r.status === 'active');
}

export function getRulesByCategory(category) {
  return DECISION_RULES.filter(r => r.category === category);
}

export function getDecisionTypes() {
  return [...DECISION_TYPES];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemDecisionManifest = {
    DECISION_CATEGORIES,
    DECISION_RULES,
    DECISION_TYPES,
    getDecisionCategories,
    getCategoryById,
    getDecisionRules,
    getRuleById,
    getActiveRules,
    getRulesByCategory,
    getDecisionTypes,
    init: function() { console.log('✅ SystemDecisionManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemDecisionManifest = window.systemDecisionManifest;
  }
}
