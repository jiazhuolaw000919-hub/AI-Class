/**
 * Domain Registry
 * 
 * Central registry for all Academy domains.
 * Provides registration, lookup, listing, and validation.
 * No business logic.
 */

class DomainRegistry {
  constructor() {
    this.domains = new Map();
    this.initialized = false;
  }

  /**
   * Initialize registry with core domains
   */
  init() {
    if (this.initialized) return;
    const coreDomains = [
      'Academy',
      'Dashboard',
      'Lesson',
      'Course',
      'Module',
      'Quiz',
      'Practice',
      'Mentor',
      'Memory',
      'Goal',
      'Project',
      'Career',
      'Skill',
      'Knowledge',
      'Workspace',
      'Settings'
    ];
    coreDomains.forEach(name => this.register(name, { core: true }));
    this.initialized = true;
    console.log('[DomainRegistry] Initialized with', coreDomains.length, 'domains');
  }

  /**
   * Register a domain
   * @param {string} name - Domain name
   * @param {Object} metadata - Additional info (optional)
   */
  register(name, metadata = {}) {
    if (this.domains.has(name)) {
      console.warn(`[DomainRegistry] Domain "${name}" already registered.`);
      return;
    }
    this.domains.set(name, {
      name,
      registeredAt: Date.now(),
      ...metadata
    });
  }

  /**
   * Find a domain by name (case-insensitive)
   * @param {string} name 
   * @returns {Object|null} Domain record or null
   */
  find(name) {
    const normalized = name.toLowerCase();
    for (const [key, value] of this.domains.entries()) {
      if (key.toLowerCase() === normalized) {
        return value;
      }
    }
    return null;
  }

  /**
   * List all registered domains
   * @param {Object} options - { core: boolean, excludeCore: boolean }
   * @returns {Array} Array of domain records
   */
  list(options = {}) {
    let results = Array.from(this.domains.values());
    if (options.core !== undefined) {
      results = results.filter(d => !!d.core === options.core);
    }
    if (options.excludeCore) {
      results = results.filter(d => !d.core);
    }
    return results;
  }

  /**
   * Validate that a domain exists
   * @param {string} name 
   * @returns {boolean} True if registered
   */
  validate(name) {
    return this.find(name) !== null;
  }
}

// Singleton instance
const domainRegistry = new DomainRegistry();
export default domainRegistry;
