/**
 * UI Registry
 * 
 * Maintains every reusable UI component.
 * Registry only - no rendering logic.
 * 
 * NOTE: This is DIFFERENT from runtimeRegistry.js
 * - runtimeRegistry: manages Engines (eventBus, progressEngine, etc.)
 * - uiRegistry: manages UI Components (Card, Button, Modal, etc.)
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.UIRegistry = {
  components: [],
  initialized: false,

  /**
   * Initialize the registry
   */
  init: function() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[UIRegistry] Initialized.');
  },

  /**
   * Register a UI component
   * @param {string} id - Component ID (unique)
   * @param {Object} metadata - Component metadata
   * @param {string} metadata.name - Display name
   * @param {string} metadata.category - Category (Button, Card, Modal, etc.)
   * @param {string} metadata.version - Semantic version
   * @param {string} metadata.status - active | deprecated | experimental
   * @param {Array} metadata.dependencies - CSS classes or JS dependencies
   * @param {Array} metadata.variants - Component variants
   */
  register: function(id, metadata) {
    if (!id || !metadata) {
      console.warn('[UIRegistry] register() requires id and metadata.');
      return;
    }

    // Check if already registered
    const exists = this.components.find(c => c.id === id);
    if (exists) {
      console.warn(`[UIRegistry] Component "${id}" already registered.`);
      return;
    }

    // Validate required fields
    const required = ['name', 'category', 'version'];
    for (var i = 0; i < required.length; i++) {
      if (!metadata[required[i]]) {
        console.warn(`[UIRegistry] Component "${id}" missing required field: ${required[i]}`);
        return;
      }
    }

    this.components.push({
      id: id,
      name: metadata.name,
      category: metadata.category,
      version: metadata.version,
      status: metadata.status || 'active',
      dependencies: metadata.dependencies || [],
      variants: metadata.variants || [],
      registeredAt: Date.now(),
      healthy: true,
      used: false,
      usageCount: 0,
      healthMessage: null,
      lastUsed: null,
      lastHealthCheck: null
    });

    console.log(`[UIRegistry] Registered: ${id} (${metadata.name})`);
  },

  /**
   * Find a component by ID
   * @param {string} id - Component ID
   * @returns {Object|null} Component record or null
   */
  find: function(id) {
    return this.components.find(c => c.id === id) || null;
  },

  /**
   * Find components by category
   * @param {string} category - Category name
   * @returns {Array} Array of component records
   */
  findByCategory: function(category) {
    return this.components.filter(c => c.category === category);
  },

  /**
   * List all registered components
   * @param {Object} options - Filters
   * @param {string} options.category - Filter by category
   * @param {string} options.status - Filter by status
   * @param {boolean} options.used - Filter by usage
   * @param {boolean} options.healthy - Filter by health
   * @returns {Array} Array of component records
   */
  list: function(options) {
    options = options || {};
    var results = this.components.slice();

    if (options.category) {
      results = results.filter(function(c) { return c.category === options.category; });
    }
    if (options.status) {
      results = results.filter(function(c) { return c.status === options.status; });
    }
    if (options.used !== undefined) {
      results = results.filter(function(c) { return c.used === options.used; });
    }
    if (options.healthy !== undefined) {
      results = results.filter(function(c) { return c.healthy === options.healthy; });
    }

    return results;
  },

  /**
   * Validate that a component exists
   * @param {string} id - Component ID
   * @returns {boolean}
   */
  validate: function(id) {
    return this.find(id) !== null;
  },

  /**
   * Get count of registered components
   * @param {Object} options - Filters
   * @returns {number}
   */
  count: function(options) {
    return this.list(options).length;
  },

  /**
   * Mark a component as used
   * @param {string} id - Component ID
   */
  markUsed: function(id) {
    var component = this.find(id);
    if (!component) {
      console.warn(`[UIRegistry] Component "${id}" not found.`);
      return;
    }
    component.used = true;
    component.usageCount = (component.usageCount || 0) + 1;
    component.lastUsed = Date.now();
  },

  /**
   * Mark a component as healthy or unhealthy
   * @param {string} id - Component ID
   * @param {boolean} healthy - Health status
   * @param {string} message - Optional health message
   */
  setHealth: function(id, healthy, message) {
    var component = this.find(id);
    if (!component) {
      console.warn(`[UIRegistry] Component "${id}" not found.`);
      return;
    }
    component.healthy = healthy;
    component.healthMessage = message || null;
    component.lastHealthCheck = Date.now();
  },

  /**
   * Get health status of a component
   * @param {string} id - Component ID
   * @returns {Object|null} Health info
   */
  getHealth: function(id) {
    var component = this.find(id);
    if (!component) return null;
    return {
      healthy: component.healthy,
      message: component.healthMessage,
      lastCheck: component.lastHealthCheck
    };
  },

  /**
   * Get all categories
   * @returns {Array} Unique categories
   */
  getCategories: function() {
    var categories = [];
    for (var i = 0; i < this.components.length; i++) {
      var cat = this.components[i].category;
      if (categories.indexOf(cat) === -1) {
        categories.push(cat);
      }
    }
    return categories;
  },

  /**
   * Get unused components
   * @returns {Array} Unused components
   */
  getUnused: function() {
    return this.components.filter(function(c) { return !c.used; });
  },

  /**
   * Get broken components
   * @returns {Array} Broken components
   */
  getBroken: function() {
    return this.components.filter(function(c) { return !c.healthy; });
  },

  /**
   * Get all components as plain array
   * @returns {Array} All components
   */
  getAll: function() {
    return this.components.slice();
  },

  /**
   * Discover all registered components (alias for getAll)
   * @returns {Array} All components
   */
  discover: function() {
    return this.getAll();
  }
};

// 暴露到全局
window.uiRegistry = LawAIApp.UIRegistry;

console.log('📦 UIRegistry ready (UI Constitution Part 4)');
