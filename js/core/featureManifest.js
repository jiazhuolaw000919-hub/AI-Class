/**
 * Feature Manifest
 * 
 * Central catalogue for every feature.
 * Contains definitions for all core and optional features.
 */

import featureRegistry from './featureRegistry.js';

class FeatureManifest {
  constructor() {
    this.manifest = {
      version: '1.0.0',
      generatedAt: null,
      features: []
    };
    this.initialized = false;
  }

  /**
   * Initialize the manifest with default features
   */
  init() {
    if (this.initialized) return;
    
    // Define core features
    const coreFeatures = this._getCoreFeatures();
    
    // Define optional features
    const optionalFeatures = this._getOptionalFeatures();
    
    // Combine
    const allFeatures = [...coreFeatures, ...optionalFeatures];
    
    // Register all features
    for (const feature of allFeatures) {
      featureRegistry.register(feature.id, feature);
    }
    
    this.manifest.generatedAt = Date.now();
    this.manifest.features = allFeatures;
    this.initialized = true;
    
    console.log(`[FeatureManifest] Initialized with ${allFeatures.length} features.`);
  }

  /**
   * Get core feature definitions
   * @returns {Array} Core features
   */
  _getCoreFeatures() {
    return [
      {
        id: 'core_app',
        name: 'Application Core',
        domain: 'App',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: [],
        categories: ['system']
      },
      {
        id: 'feature_dashboard',
        name: 'Dashboard',
        domain: 'Dashboard',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['core_app'],
        categories: ['ui']
      },
      {
        id: 'feature_learning',
        name: 'Learning Engine',
        domain: 'Lesson',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['core_app', 'feature_dashboard'],
        categories: ['learning']
      },
      {
        id: 'feature_lesson',
        name: 'Lesson Viewer',
        domain: 'Lesson',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_learning'],
        categories: ['learning', 'ui']
      },
      {
        id: 'feature_progress',
        name: 'Progress Engine',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['core_app'],
        categories: ['system']
      },
      {
        id: 'feature_xp',
        name: 'XP Engine',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_progress'],
        categories: ['system']
      },
      {
        id: 'feature_calendar',
        name: 'Learning Calendar',
        domain: 'Knowledge',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_learning'],
        categories: ['ui', 'learning']
      },
      {
        id: 'feature_notes',
        name: 'Notes & Notebook',
        domain: 'Knowledge',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_lesson'],
        categories: ['ui', 'learning']
      },
      {
        id: 'feature_settings',
        name: 'Settings',
        domain: 'Settings',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['core_app'],
        categories: ['ui']
      },
      {
        id: 'feature_academy',
        name: 'Academy Home',
        domain: 'Academy',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_learning'],
        categories: ['ui', 'learning']
      },
      {
        id: 'feature_course',
        name: 'Course Engine',
        domain: 'Course',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_academy'],
        categories: ['learning']
      },
      {
        id: 'feature_module',
        name: 'Module Engine',
        domain: 'Module',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: true,
        dependencies: ['feature_course'],
        categories: ['learning']
      }
    ];
  }

  /**
   * Get optional feature definitions
   * @returns {Array} Optional features
   */
  _getOptionalFeatures() {
    return [
      {
        id: 'feature_mentor',
        name: 'AI Mentor',
        domain: 'Mentor',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_learning', 'feature_progress'],
        categories: ['ai', 'learning']
      },
      {
        id: 'feature_memory',
        name: 'Memory Engine',
        domain: 'Memory',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_learning', 'feature_progress'],
        categories: ['learning']
      },
      {
        id: 'feature_practice',
        name: 'Practice Engine',
        domain: 'Practice',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_lesson'],
        categories: ['learning', 'skill']
      },
      {
        id: 'feature_quiz',
        name: 'Quiz Engine',
        domain: 'Quiz',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_lesson'],
        categories: ['learning', 'assessment']
      },
      {
        id: 'feature_habit',
        name: 'Habit Engine',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_progress', 'feature_xp'],
        categories: ['system']
      },
      {
        id: 'feature_goals',
        name: 'Learning Goals',
        domain: 'Goal',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_progress', 'feature_learning'],
        categories: ['learning']
      },
      {
        id: 'feature_second_brain',
        name: 'Second Brain',
        domain: 'Knowledge',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_lesson', 'feature_memory'],
        categories: ['knowledge']
      },
      {
        id: 'feature_knowledge_graph',
        name: 'Knowledge Graph',
        domain: 'Knowledge',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_second_brain'],
        categories: ['knowledge', 'ai']
      },
      {
        id: 'feature_workspace',
        name: 'Knowledge Workspace',
        domain: 'Workspace',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_lesson', 'feature_second_brain'],
        categories: ['ui', 'knowledge']
      },
      {
        id: 'feature_skills',
        name: 'Skill Engine',
        domain: 'Skill',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_progress', 'feature_practice'],
        categories: ['skill']
      },
      {
        id: 'feature_career',
        name: 'Career Intelligence',
        domain: 'Career',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_skills', 'feature_goals'],
        categories: ['career']
      },
      {
        id: 'feature_projects',
        name: 'Project Engine',
        domain: 'Project',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_learning', 'feature_skills'],
        categories: ['learning', 'skill']
      },
      {
        id: 'feature_recommendations',
        name: 'Recommendation Engine',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_progress', 'feature_learning'],
        categories: ['ai']
      },
      {
        id: 'feature_analytics',
        name: 'Learning Analytics',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_progress', 'feature_xp'],
        categories: ['system']
      },
      {
        id: 'feature_statistics',
        name: 'Statistics Engine',
        domain: 'Core',
        owner: 'Law AI Academy',
        status: 'active',
        version: '1.0.0',
        core: false,
        dependencies: ['feature_analytics'],
        categories: ['system', 'ui']
      }
    ];
  }

  /**
   * Load the manifest
   * @returns {Object} Manifest data
   */
  load() {
    if (!this.initialized) {
      this.init();
    }
    return {
      version: this.manifest.version,
      generatedAt: this.manifest.generatedAt,
      features: [...this.manifest.features]
    };
  }

  /**
   * Save the manifest (placeholder - future implementation)
   * @param {Object} data - Manifest data
   */
  save(data) {
    // Placeholder for future cloud sync
    console.log('[FeatureManifest] Save called (placeholder)');
  }

  /**
   * Export the manifest as JSON
   * @returns {string} JSON string
   */
  export() {
    return JSON.stringify(this.manifest, null, 2);
  }

  /**
   * Get feature definition by ID
   * @param {string} id - Feature ID
   * @returns {Object|null} Feature definition
   */
  getFeature(id) {
    return this.manifest.features.find(f => f.id === id) || null;
  }

  /**
   * Get features by category
   * @param {string} category - Category name
   * @returns {Array} Features in category
   */
  getFeaturesByCategory(category) {
    return this.manifest.features.filter(f => 
      f.categories && f.categories.includes(category)
    );
  }

  /**
   * Get features by status
   * @param {string} status - Status filter
   * @returns {Array} Features with status
   */
  getFeaturesByStatus(status) {
    return this.manifest.features.filter(f => f.status === status);
  }
}

// Singleton instance
const featureManifest = new FeatureManifest();
export default featureManifest;
