/**
 * Architecture Constants
 * 
 * Central store for layer names, domain names,
 * reserved events, engine names, and recovery flags.
 * Avoid magic strings.
 */

export const LAYERS = {
  APP: 'App',
  CORE: 'Core',
  FEATURE: 'Feature',
  CONTENT: 'Content',
  UI: 'UI',
  AI: 'AI'
};

export const DOMAINS = {
  ACADEMY: 'Academy',
  DASHBOARD: 'Dashboard',
  LESSON: 'Lesson',
  COURSE: 'Course',
  MODULE: 'Module',
  QUIZ: 'Quiz',
  PRACTICE: 'Practice',
  MENTOR: 'Mentor',
  MEMORY: 'Memory',
  GOAL: 'Goal',
  PROJECT: 'Project',
  CAREER: 'Career',
  SKILL: 'Skill',
  KNOWLEDGE: 'Knowledge',
  WORKSPACE: 'Workspace',
  SETTINGS: 'Settings'
};

export const RESERVED_EVENTS = [
  'BOOT_STARTED',
  'BOOT_COMPLETED',
  'ARCHITECTURE_INITIALIZED',
  'DOMAIN_REGISTERED',
  'LAYER_REGISTERED',
  'VALIDATION_WARNING',
  'HEALTH_REPORTED'
];

export const RESERVED_ENGINE_NAMES = [
  'eventBus',
  'coreLearningEngine',
  'progressEngine',
  'xpEngine',
  'levelSystem',
  'analyticsEngine',
  'statisticsEngine',
  'recommendationEngine',
  'mentorEngine',
  'habitEngine',
  'practiceEngine',
  'memoryEngine',
  'learningPathEngine',
  'resourceEngine',
  'workspaceEngine',
  'knowledgeGraph',
  'secondBrainEngine',
  'goalEngine',
  'projectEngine',
  'skillEngine',
  'careerEngine'
];

export const RECOVERY_FLAGS = {
  ARCHITECTURE_VALIDATED: false,
  DOMAIN_REGISTRY_READY: false,
  LAYER_REGISTRY_READY: false,
  RUNTIME_HEALTH_READY: false,
  SYSTEM_COMPOSER_READY: false,
  BOOT_COMPLETE: false
};

/**
 * Update a recovery flag
 * @param {string} flagName 
 * @param {boolean} value 
 */
export function setRecoveryFlag(flagName, value) {
  if (RECOVERY_FLAGS.hasOwnProperty(flagName)) {
    RECOVERY_FLAGS[flagName] = value;
  } else {
    console.warn(`[RecoveryFlags] Unknown flag: ${flagName}`);
  }
}
