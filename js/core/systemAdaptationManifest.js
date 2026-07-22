/**
 * System Adaptation Manifest
 * Maintains official System Adaptation definitions.
 * Read only – do not modify at runtime.
 */

export const ADAPTATION_TYPES = [
  {
    id: 'LEARNING_ADAPTATION',
    name: 'Learning Adaptation',
    category: 'Learning',
    source: 'SystemAwareness',
    description: 'Adaptations to learning experience based on patterns',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'RUNTIME_ADAPTATION',
    name: 'Runtime Adaptation',
    category: 'Runtime',
    source: 'SystemIntelligence',
    description: 'Adaptations to runtime behavior and configuration',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'EXPERIENCE_ADAPTATION',
    name: 'Experience Adaptation',
    category: 'Experience',
    source: 'SystemReflection',
    description: 'Adaptations to user experience and flow',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'PERFORMANCE_ADAPTATION',
    name: 'Performance Adaptation',
    category: 'Performance',
    source: 'SystemDecision',
    description: 'Adaptations to optimize performance',
    version: '1.0',
    status: 'active'
  },
  {
    id: 'INTERFACE_ADAPTATION',
    name: 'Interface Adaptation',
    category: 'Interface',
    source: 'SystemIntention',
    description: 'Adaptations to user interface and presentation',
    version: '1.0',
    status: 'active'
  }
];

export const ADAPTATION_SIGNALS = [
  { id: 'LEARNING_PATTERN', source: 'SystemAwareness', description: 'Learning behavior patterns detected' },
  { id: 'RUNTIME_CONDITION', source: 'SystemIntelligence', description: 'Runtime conditions observed' },
  { id: 'MEMORY_GROWTH', source: 'SystemMemory', description: 'Memory growth patterns detected' },
  { id: 'REFLECTION_INSIGHT', source: 'SystemReflection', description: 'Reflection insights generated' },
  { id: 'DECISION_TRIGGER', source: 'SystemDecision', description: 'Decision triggers activated' },
  { id: 'INTENTION_SHIFT', source: 'SystemIntention', description: 'Intention shifts detected' }
];

export const ADAPTATION_CATEGORIES = ['Learning', 'Runtime', 'Experience', 'Performance', 'Interface'];

export function getAdaptationTypes() {
  return JSON.parse(JSON.stringify(ADAPTATION_TYPES));
}

export function getAdaptationById(id) {
  return ADAPTATION_TYPES.find(a => a.id === id) || null;
}

export function getAdaptationsByCategory(category) {
  return ADAPTATION_TYPES.filter(a => a.category === category);
}

export function getAdaptationsBySource(source) {
  return ADAPTATION_TYPES.filter(a => a.source === source);
}

export function getActiveAdaptations() {
  return ADAPTATION_TYPES.filter(a => a.status === 'active');
}

export function getSignals() {
  return JSON.parse(JSON.stringify(ADAPTATION_SIGNALS));
}

export function getSignalById(id) {
  return ADAPTATION_SIGNALS.find(s => s.id === id) || null;
}

export function getAdaptationCount() {
  return ADAPTATION_TYPES.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAdaptationManifest = {
    ADAPTATION_TYPES,
    ADAPTATION_SIGNALS,
    ADAPTATION_CATEGORIES,
    getAdaptationTypes,
    getAdaptationById,
    getAdaptationsByCategory,
    getAdaptationsBySource,
    getActiveAdaptations,
    getSignals,
    getSignalById,
    getAdaptationCount,
    init: function() { console.log('✅ SystemAdaptationManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAdaptationManifest = window.systemAdaptationManifest;
  }
}
