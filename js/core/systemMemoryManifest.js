/**
 * System Memory Manifest
 * Maintains official memory categories.
 * Read only – do not modify at runtime.
 */

export const MEMORY_CATEGORIES = [
  {
    id: 'boot',
    name: 'Boot History',
    description: 'Boot sequence and phase completion history',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'runtime',
    name: 'Runtime History',
    description: 'Runtime state and health over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'architecture',
    name: 'Architecture History',
    description: 'Architecture governance history',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'governance',
    name: 'Governance History',
    description: 'Governance changes and events',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'registry',
    name: 'Registry History',
    description: 'Registry changes and state history',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'engine',
    name: 'Engine History',
    description: 'Engine lifecycle history',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'health',
    name: 'Health History',
    description: 'Health score history over time',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'recovery',
    name: 'Recovery History',
    description: 'Recovery actions and results',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'version',
    name: 'Version History',
    description: 'Version history and upgrades',
    version: '1.0',
    status: 'active'
  }
];

export function getMemoryCategories() {
  return JSON.parse(JSON.stringify(MEMORY_CATEGORIES));
}

export function getCategoryById(id) {
  return MEMORY_CATEGORIES.find(c => c.id === id) || null;
}

export function getActiveCategories() {
  return MEMORY_CATEGORIES.filter(c => c.status === 'active');
}

export function getCategoryCount() {
  return MEMORY_CATEGORIES.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemMemoryManifest = {
    MEMORY_CATEGORIES,
    getMemoryCategories,
    getCategoryById,
    getActiveCategories,
    getCategoryCount,
    init: function() { console.log('✅ SystemMemoryManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemMemoryManifest = window.systemMemoryManifest;
  }
}
