/**
 * System Intention Manifest
 * Maintains official intention types.
 * Read only – do not modify at runtime.
 */

export const INTENTION_TYPES = [
  {
    id: 'SYSTEM_BOOT',
    name: 'System Boot',
    category: 'System',
    description: 'System is booting up and initializing',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SYSTEM_LEARNING',
    name: 'System Learning',
    category: 'System',
    description: 'System is in learning mode, processing knowledge',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SYSTEM_ANALYSIS',
    name: 'System Analysis',
    category: 'System',
    description: 'System is analyzing data and generating insights',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SYSTEM_OPTIMIZATION',
    name: 'System Optimization',
    category: 'System',
    description: 'System is optimizing performance and efficiency',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SYSTEM_RECOVERY',
    name: 'System Recovery',
    category: 'System',
    description: 'System is in recovery mode, restoring state',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'SYSTEM_EVOLUTION',
    name: 'System Evolution',
    category: 'System',
    description: 'System is evolving architecture and governance',
    version: '1.0',
    status: 'active'
  }
];

export function getIntentionTypes() {
  return JSON.parse(JSON.stringify(INTENTION_TYPES));
}

export function getIntentionById(id) {
  return INTENTION_TYPES.find(i => i.id === id) || null;
}

export function getIntentionsByCategory(category) {
  return INTENTION_TYPES.filter(i => i.category === category);
}

export function getActiveIntentions() {
  return INTENTION_TYPES.filter(i => i.status === 'active');
}

export function getIntentionCount() {
  return INTENTION_TYPES.length;
}

export function getCategories() {
  return [...new Set(INTENTION_TYPES.map(i => i.category))];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntentionManifest = {
    INTENTION_TYPES,
    getIntentionTypes,
    getIntentionById,
    getIntentionsByCategory,
    getActiveIntentions,
    getIntentionCount,
    getCategories,
    init: function() { console.log('✅ SystemIntentionManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntentionManifest = window.systemIntentionManifest;
  }
}
