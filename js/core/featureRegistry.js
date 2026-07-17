/**
 * Feature Registry
 * 
 * Maintains every application feature.
 * Registry only - no business logic.
 */

class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[FeatureRegistry] Initialized.');
  }

  /**
   * Register a feature
   * @param {string} id - Feature ID (unique)
   * @param {Object} metadata - Feature metadata
   * @param {string} metadata.name - Display name
   * @param {string} metadata.domain - Domain (Academy, Lesson, etc.)
   * @param {string} metadata.owner - Feature owner
   * @param {string} metadata.status - active | beta | comingSoon | deprecated
   * @param {string} metadata.version - Semantic version
   * @param {Array} metadata.dependencies - Array of feature IDs
   * @param {Array} metadata.categories - Categories this feature belongs to
   */
  register(id, metadata = {}) {
    if (this.features.has(id)) {
      console.warn(`[FeatureRegistry] Feature "${id}" already registered.`);
      return;
    }

    // Validate required fields
    const required = ['name', 'domain', 'owner', 'status'];
    for (const field of required) {
      if (!metadata[field]) {
        console.warn(`[FeatureRegistry] Feature "${id}" missing required field: ${field}`);
        return;
      }
    }

    this.features.set(id, {
      id,
      registeredAt: Date.now(),
      healthy: true,
      healthMessage: null,
      ...metadata
    });

    console.log(`[FeatureRegistry] Registered: ${id} (${metadata.name})`);
  }

  /**
   * Find a feature by ID
   * @param {string} id - Feature ID
   * @returns {Object|null} Feature record or null
   */
  find(id) {
    return this.features.get(id) || null;
  }

  /**
   * Find features by domain
   * @param {string} domain - Domain name
   * @returns {Array} Array of feature records
   */
  findByDomain(domain) {
    const results = [];
    for (const [, feature] of this.features) {
      if (feature.domain === domain) {
        results.push(feature);
      }
    }
    return results;
  }

  /**
   * List all registered features
   * @param {Object} options - Filters
   * @param {string} options.status - Filter by status
   * @param {string} options.domain - Filter by domain
   * @param {boolean} options.healthy - Filter by health
   * @returns {Array} Array of feature records
   */
  list(options = {}) {
    let results = Array.from(this.features.values());

    if (options.status) {
      results = results.filter(f => f.status === options.status);
    }
    if (options.domain) {
      results = results.filter(f => f.domain === options.domain);
    }
    if (options.healthy !== undefined) {
      results = results.filter(f => f.healthy === options.healthy);
    }

    return results;
  }

  /**
   * Validate that a feature exists
   * @param {string} id - Feature ID
   * @returns {boolean}
   */
  validate(id) {
    return this.features.has(id);
  }

  /**
   * Get count of registered features
   * @param {Object} options - Filters
   * @returns {number}
   */
  count(options = {}) {
    return this.list(options).length;
  }

  /**
   * Mark a feature as healthy or unhealthy
   * @param {string} id - Feature ID
   * @param {boolean} healthy - Health status
   * @param {string} message - Optional health message
   */
  setHealth(id, healthy, message = null) {
    const feature = this.find(id);
    if (!feature) {
      console.warn(`[FeatureRegistry] Feature "${id}" not found.`);
      return;
    }
    feature.healthy = healthy;
    feature.healthMessage = message;
    feature.lastHealthCheck = Date.now();
  }

  /**
   * Get health status of a feature
   * @param {string} id - Feature ID
   * @returns {Object} Health info
   */
  getHealth(id) {
    const feature = this.find(id);
    if (!feature) return null;
    return {
      healthy: feature.healthy,
      message: feature.healthMessage,
      lastCheck: feature.lastHealthCheck
    };
  }

  /**
   * Get all domains
   * @returns {Array} Unique domains
   */
  getDomains() {
    const domains = new Set();
    for (const [, feature] of this.features) {
      domains.add(feature.domain);
    }
    return Array.from(domains);
  }

  /**
   * Get features by dependency
   * @param {string} dependencyId - Feature ID that others depend on
   * @returns {Array} Features that depend on dependencyId
   */
  getDependents(dependencyId) {
    const results = [];
    for (const [, feature] of this.features) {
      if (feature.dependencies && feature.dependencies.includes(dependencyId)) {
        results.push(feature);
      }
    }
    return results;
  }
}

// Singleton instance
const featureRegistry = new FeatureRegistry();
export default featureRegistry;
