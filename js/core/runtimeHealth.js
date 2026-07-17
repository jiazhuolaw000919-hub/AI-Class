/**
 * Runtime Health
 * 
 * Collects and displays information about loaded engines,
 * domains, features, boot time, and missing dependencies.
 * Developer tool only.
 */

import domainRegistry from './domainRegistry.js';
import layerRegistry from './layerRegistry.js';

class RuntimeHealth {
  constructor() {
    this.bootTime = Date.now();
    this.loadedEngines = new Set();
    this.loadedDomains = new Set();
    this.loadedFeatures = new Set();
    this.missingDependencies = [];
    this.initialized = false;
  }

  /**
   * Initialize health monitor
   */
  init() {
    if (this.initialized) return;
    this._collectLoadedItems();
    this._checkDependencies();
    this.initialized = true;
    this.display();
    console.log('[RuntimeHealth] Initialized.');
  }

  /**
   * Scan global scope for known engines and features
   */
  _collectLoadedItems() {
    // Detect loaded engines from window (or module scope)
    const globals = typeof window !== 'undefined' ? window : global;
    const knownEngineNames = [
      'eventBus', 'coreLearningEngine', 'progressEngine', 'xpEngine',
      'analyticsEngine', 'statisticsEngine', 'recommendationEngine',
      'mentorEngine', 'habitEngine', 'practiceEngine', 'memoryEngine',
      'learningPathEngine', 'resourceEngine', 'workspaceEngine',
      'knowledgeGraph', 'secondBrainEngine', 'goalEngine', 'projectEngine',
      'skillEngine', 'careerEngine'
    ];
    for (const name of knownEngineNames) {
      if (globals[name] || (typeof module !== 'undefined' && module.exports && module.exports[name])) {
        this.loadedEngines.add(name);
      }
    }
    // Domains from registry
    const domains = domainRegistry.list();
    domains.forEach(d => this.loadedDomains.add(d.name));
    // Features (could be detected from feature modules)
  }

  _checkDependencies() {
    // Placeholder - could check if required engines are loaded
    const required = ['coreLearningEngine', 'progressEngine'];
    for (const req of required) {
      if (!this.loadedEngines.has(req)) {
        this.missingDependencies.push(req);
      }
    }
  }

  /**
   * Display health report in console
   */
  display() {
    const elapsed = Date.now() - this.bootTime;
    const report = {
      'Boot Time (ms)': elapsed,
      'Loaded Engines': this.loadedEngines.size,
      'Loaded Domains': this.loadedDomains.size,
      'Missing Dependencies': this.missingDependencies.length > 0 ? this.missingDependencies : 'None',
      'Engines': Array.from(this.loadedEngines),
      'Domains': Array.from(this.loadedDomains)
    };
    console.table(report);
    if (this.missingDependencies.length > 0) {
      console.warn('[RuntimeHealth] Missing dependencies:', this.missingDependencies);
    } else {
      console.log('[RuntimeHealth] All dependencies satisfied.');
    }
  }

  /**
   * Get health data as object
   */
  getHealth() {
    return {
      bootTime: this.bootTime,
      elapsed: Date.now() - this.bootTime,
      loadedEngines: Array.from(this.loadedEngines),
      loadedDomains: Array.from(this.loadedDomains),
      missingDependencies: this.missingDependencies
    };
  }
}

const runtimeHealth = new RuntimeHealth();
export default runtimeHealth;
