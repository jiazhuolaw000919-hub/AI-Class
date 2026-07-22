/**
 * System Reflection Manifest
 * Maintains official reflection categories.
 * Read only – do not modify at runtime.
 */

export const REFLECTION_CATEGORIES = [
  {
    id: 'boot',
    name: 'Boot Trends',
    description: 'Boot time trends and patterns',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'runtime',
    name: 'Runtime Trends',
    description: 'Runtime state trends over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'architecture',
    name: 'Architecture Trends',
    description: 'Architecture changes over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'governance',
    name: 'Governance Trends',
    description: 'Governance score trends',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'memory',
    name: 'Memory Trends',
    description: 'Memory entry growth trends',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health',
    name: 'Health Trends',
    description: 'Health score trends over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'recovery',
    name: 'Recovery Trends',
    description: 'Recovery improvements over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'version',
    name: 'Version Trends',
    description: 'Version evolution history',
    version: '1.0',
    status: 'active'
  }
];

export function getReflectionCategories() {
  return JSON.parse(JSON.stringify(REFLECTION_CATEGORIES));
}

export function getCategoryById(id) {
  return REFLECTION_CATEGORIES.find(c => c.id === id) || null;
}

export function getActiveCategories() {
  return REFLECTION_CATEGORIES.filter(c => c.status === 'active');
}

export function getCategoryCount() {
  return REFLECTION_CATEGORIES.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemReflectionManifest = {
    REFLECTION_CATEGORIES,
    getReflectionCategories,
    getCategoryById,
    getActiveCategories,
    getCategoryCount,
    init: function() { console.log('✅ SystemReflectionManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemReflectionManifest = window.systemReflectionManifest;
  }
}
