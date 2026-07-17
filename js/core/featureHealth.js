/**
 * Feature Health
 * 
 * Tracks health status of all registered features.
 * Developer tool only.
 */

import featureRegistry from './featureRegistry.js';
import featureValidator from './featureValidator.js';

class FeatureHealth {
  constructor() {
    this.healthData = {
      lastCheck: null,
      totalFeatures: 0,
      healthyFeatures: 0,
      unhealthyFeatures: 0,
      missingDependencies: 0,
      disabledFeatures: 0,
      brokenFeatures: [],
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
    console.log('[FeatureHealth] Initialized.');
    this.checkHealth();
  }

  /**
   * Check health of all features
   */
  checkHealth() {
    const features = featureRegistry.list();
    const warnings = featureValidator.getWarnings ? featureValidator.getWarnings() : [];

    this.healthData.lastCheck = Date.now();
    this.healthData.totalFeatures = features.length;
    this.healthData.healthyFeatures = 0;
    this.healthData.unhealthyFeatures = 0;
    this.healthData.missingDependencies = 0;
    this.healthData.disabledFeatures = 0;
    this.healthData.brokenFeatures = [];

    for (const feature of features) {
      // Check status
      if (feature.status === 'disabled') {
        this.healthData.disabledFeatures++;
        continue;
      }

      // Check health
      const isHealthy = feature.healthy !== false;
      
      // Check for dependency warnings
      const depWarnings = warnings.filter(w => 
        w.feature === feature.id && w.type === 'missing_dependency'
      );
      
      if (depWarnings.length > 0) {
        this.healthData.missingDependencies += depWarnings.length;
        this.healthData.brokenFeatures.push({
          id: feature.id,
          name: feature.name,
          issues: depWarnings.map(w => w.message)
        });
        this.healthData.unhealthyFeatures++;
      } else if (!isHealthy) {
        this.healthData.brokenFeatures.push({
          id: feature.id,
          name: feature.name,
          issues: [feature.healthMessage || 'Unknown issue']
        });
        this.healthData.unhealthyFeatures++;
      } else {
        this.healthData.healthyFeatures++;
      }
    }

    // Calculate health score
    const total = this.healthData.totalFeatures - this.healthData.disabledFeatures;
    if (total > 0) {
      this.healthData.healthScore = Math.round(
        (this.healthData.healthyFeatures / total) * 100
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
    console.log('   FEATURE HEALTH REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`Total Features:     ${h.totalFeatures}`);
    console.log(`✅ Healthy:         ${h.healthyFeatures}`);
    console.log(`❌ Unhealthy:       ${h.unhealthyFeatures}`);
    console.log(`⛔ Disabled:        ${h.disabledFeatures}`);
    console.log(`🔗 Missing Deps:    ${h.missingDependencies}`);
    console.log(`📊 Health Score:    ${h.healthScore}%`);
    console.log('─────────────────────────────────────');

    if (h.brokenFeatures.length > 0) {
      console.warn('Broken Features:');
      for (const broken of h.brokenFeatures) {
        console.warn(`  ${broken.name} (${broken.id})`);
        for (const issue of broken.issues) {
          console.warn(`    - ${issue}`);
        }
      }
    } else {
      console.log('✅ All features are healthy.');
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
      brokenFeatures: [...this.healthData.brokenFeatures]
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
   * Check if all features are healthy
   * @returns {boolean}
   */
  isHealthy() {
    return this.healthData.healthScore === 100 && this.healthData.unhealthyFeatures === 0;
  }

  /**
   * Get broken features
   * @returns {Array} Broken features list
   */
  getBrokenFeatures() {
    return [...this.healthData.brokenFeatures];
  }

  /**
   * Generate health summary
   * @returns {Object} Summary
   */
  getSummary() {
    return {
      timestamp: this.healthData.lastCheck,
      totalFeatures: this.healthData.totalFeatures,
      healthScore: this.healthData.healthScore,
      healthy: this.healthData.healthyFeatures,
      unhealthy: this.healthData.unhealthyFeatures,
      disabled: this.healthData.disabledFeatures,
      brokenCount: this.healthData.brokenFeatures.length
    };
  }
}

// Singleton instance
const featureHealth = new FeatureHealth();
export default featureHealth;
