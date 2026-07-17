/**
 * Feature Constants
 * 
 * Central store for feature-related constants.
 * Avoid magic strings.
 */

export const FEATURE_STATUS = {
  ACTIVE: 'active',
  BETA: 'beta',
  COMING_SOON: 'comingSoon',
  DEPRECATED: 'deprecated',
  DISABLED: 'disabled'
};

export const FEATURE_DOMAINS = {
  APP: 'App',
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
  SETTINGS: 'Settings',
  CORE: 'Core'
};

export const FEATURE_CATEGORIES = {
  SYSTEM: 'system',
  UI: 'ui',
  LEARNING: 'learning',
  KNOWLEDGE: 'knowledge',
  AI: 'ai',
  SKILL: 'skill',
  CAREER: 'career',
  ASSESSMENT: 'assessment'
};

export const RESERVED_FEATURE_IDS = [
  'core_app',
  'feature_dashboard',
  'feature_learning',
  'feature_lesson',
  'feature_progress',
  'feature_xp',
  'feature_calendar',
  'feature_notes',
  'feature_settings',
  'feature_academy',
  'feature_course',
  'feature_module',
  'feature_mentor',
  'feature_memory',
  'feature_practice',
  'feature_quiz',
  'feature_habit',
  'feature_goals',
  'feature_second_brain',
  'feature_knowledge_graph',
  'feature_workspace',
  'feature_skills',
  'feature_career',
  'feature_projects',
  'feature_recommendations',
  'feature_analytics',
  'feature_statistics'
];

export const FEATURE_OWNERS = {
  CORE: 'Law AI Academy',
  AI: 'Law AI Academy AI Team',
  UI: 'Law AI Academy UI Team',
  CONTENT: 'Law AI Academy Content Team'
};

/**
 * Check if a feature ID is reserved
 * @param {string} id - Feature ID
 * @returns {boolean}
 */
export function isReservedFeature(id) {
  return RESERVED_FEATURE_IDS.includes(id);
}

/**
 * Check if a status is valid
 * @param {string} status - Status value
 * @returns {boolean}
 */
export function isValidFeatureStatus(status) {
  return Object.values(FEATURE_STATUS).includes(status);
}

/**
 * Check if a domain is valid
 * @param {string} domain - Domain value
 * @returns {boolean}
 */
export function isValidFeatureDomain(domain) {
  return Object.values(FEATURE_DOMAINS).includes(domain);
}
