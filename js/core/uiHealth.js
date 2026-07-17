/**
 * UI Health
 * 
 * Tracks health status of all registered UI components.
 * Developer tool only.
 */

import uiRegistry from './uiRegistry.js';
import uiValidator from './uiValidator.js';

class UIHealth {
  constructor() {
    this.healthData = {
      lastCheck: null,
      totalComponents: 0,
      healthyComponents: 0,
      unhealthyComponents: 0,
      unusedComponents: 0,
      brokenComponents: [],
      healthScore: 100
    };
    this.initialized = false;
  }

  /**
   * Initialize health tracking
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[UIHealth] Initialized.');
    this.checkHealth();
  }

  /**
   * Check health of all components
   */
  checkHealth() {
    const components = uiRegistry.list();
    const warnings = uiValidator.getWarnings ? uiValidator.getWarnings() : [];

    this.healthData.lastCheck = Date.now();
    this.healthData.totalComponents = components.length;
    this.healthData.healthyComponents = 0;
    this.healthData.unhealthyComponents = 0;
    this.healthData.unusedComponents = 0;
    this.healthData.brokenComponents = [];

    for (const component of components) {
      // Check unused
      if (!component.used) {
        this.healthData.unusedComponents++;
      }

      // Check health
      const isHealthy = component.healthy !== false;
      
      // Check for dependency warnings
      const depWarnings = warnings.filter(w => 
        w.component === component.id && w.type === 'missing_dependency'
      );
      
      if (depWarnings.length > 0) {
        this.healthData.brokenComponents.push({
          id: component.id,
          name: component.name,
          issues: depWarnings.map(w => w.message)
        });
        this.healthData.unhealthyComponents++;
      } else if (!isHealthy) {
        this.healthData.brokenComponents.push({
          id: component.id,
          name: component.name,
          issues: [component.healthMessage || 'Unknown issue']
        });
        this.healthData.unhealthyComponents++;
      } else {
        this.healthData.healthyComponents++;
      }
    }

    // Calculate health score
    const total = this.healthData.totalComponents;
    if (total > 0) {
      this.healthData.healthScore = Math.round(
        (this.healthData.healthyComponents / total) * 100
      );
    } else {
      this.healthData.healthScore = 0;
    }

    this._displayHealth();
  }

  /**
   * Display health report in console
   */
  _displayHealth() {
    const h = this.healthData;
    console.log('═══════════════════════════════════════');
    console.log('   UI CONSTITUTION HEALTH REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`Total Components:   ${h.totalComponents}`);
    console.log(`✅ Healthy:         ${h.healthyComponents}`);
    console.log(`❌ Unhealthy:       ${h.unhealthyComponents}`);
    console.log(`📭 Unused:          ${h.unusedComponents}`);
    console.log(`📊 Health Score:    ${h.healthScore}%`);
    console.log('─────────────────────────────────────');

    if (h.brokenComponents.length > 0) {
      console.warn('Broken Components:');
      for (const broken of h.brokenComponents) {
        console.warn(`  ${broken.name} (${broken.id})`);
        for (const issue of broken.issues) {
          console.warn(`    - ${issue}`);
        }
      }
    } else {
      console.log('✅ All UI components are healthy.');
    }
    console.log('═══════════════════════════════════════');
  }

  /**
   * Get health data
   * @returns {Object} Health data
   */
  getHealth() {
    return {
      ...this.healthData,
      brokenComponents: [...this.healthData.brokenComponents]
    };
  }

  /**
   * Get health score
   * @returns {number} Health score 0-100
   */
  getScore() {
    return this.healthData.healthScore;
  }

  /**
   * Check if all components are healthy
   * @returns {boolean}
   */
  isHealthy() {
    return this.healthData.healthScore === 100 && this.healthData.unhealthyComponents === 0;
  }

  /**
   * Get broken components
   * @returns {Array} Broken components list
   */
  getBrokenComponents() {
    return [...this.healthData.brokenComponents];
  }

  /**
   * Get unused components
   * @returns {Array} Unused components list
   */
  getUnusedComponents() {
    return uiRegistry.getUnused ? uiRegistry.getUnused() : [];
  }

  /**
   * Generate health summary
   * @returns {Object} Summary
   */
  getSummary() {
    return {
      timestamp: this.healthData.lastCheck,
      totalComponents: this.healthData.totalComponents,
      healthScore: this.healthData.healthScore,
      healthy: this.healthData.healthyComponents,
      unhealthy: this.healthData.unhealthyComponents,
      unused: this.healthData.unusedComponents,
      brokenCount: this.healthData.brokenComponents.length
    };
  }
}

// Singleton instance
const uiHealth = new UIHealth();
export default uiHealth;
