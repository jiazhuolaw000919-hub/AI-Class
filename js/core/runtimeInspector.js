/**
 * Runtime Inspector
 * 
 * Developer tool for inspecting runtime status.
 * Read-only - no editing capabilities.
 */

import runtimeKernel from './runtimeKernel.js';
import runtimeRegistry from './runtimeRegistry.js';
import runtimeStatus from './runtimeStatus.js';
import runtimeHealth from './runtimeHealth.js';
import featureRegistry from './featureRegistry.js';
import featureHealth from './featureHealth.js';
import featureValidator from './featureValidator.js';
import uiRegistry from './uiRegistry.js';
import uiHealth from './uiHealth.js';
import uiValidator from './uiValidator.js';

class RuntimeInspector {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize inspector
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[RuntimeInspector] Initialized.');
  }

  /**
   * Get complete runtime report
   * @returns {Object} Runtime report
   */
  getReport() {
    const health = runtimeHealth.getHealth ? runtimeHealth.getHealth() : {};

    return {
      status: runtimeStatus.getStatus(),
      isReady: runtimeStatus.isReady(),
      health: health,
      modules: runtimeRegistry.list(),
      kernel: runtimeKernel.health ? runtimeKernel.health() : {}
    };
  }

  /**
   * Display runtime report in console
   */
  display() {
    const report = this.getReport();
    console.log('═══════════════════════════════════════');
    console.log('     RUNTIME INSPECTOR');
    console.log('═══════════════════════════════════════');
    console.log(`Status: ${report.status}`);
    console.log(`Ready: ${report.isReady ? '✅' : '❌'}`);
    console.log(`Kernel: ${report.kernel.name || 'N/A'} v${report.kernel.version || 'N/A'}`);
    console.log(`Modules: ${report.modules.length}`);
    console.log('─────────────────────────────────────');
    console.table(report.modules.map(m => ({
      Name: m.name,
      Core: m.core ? '✓' : '',
      Loaded: m.loaded ? '✓' : '',
      Dependencies: (m.dependencies || []).join(', ')
    })));
    console.log('═══════════════════════════════════════');
  }

  /**
   * Get module details
   * @param {string} moduleName 
   * @returns {Object|null} Module details
   */
  getModule(moduleName) {
    return runtimeRegistry.find(moduleName);
  }

  // ============================================================
  // 🔥 PART 3: FEATURE GOVERNANCE METHODS
  // ============================================================

  /**
   * Get feature report
   * @returns {Object} Feature report
   */
  getFeatureReport() {
    const health = featureHealth.getHealth ? featureHealth.getHealth() : {};
    const summary = featureHealth.getSummary ? featureHealth.getSummary() : {};
    const warnings = featureValidator.getWarnings ? featureValidator.getWarnings() : [];
    
    return {
      totalFeatures: featureRegistry.count ? featureRegistry.count() : 0,
      healthScore: health.healthScore || 0,
      healthy: health.healthyFeatures || 0,
      unhealthy: health.unhealthyFeatures || 0,
      disabled: health.disabledFeatures || 0,
      brokenFeatures: health.brokenFeatures || [],
      warnings: warnings.length || 0,
      summary: summary,
      domains: featureRegistry.getDomains ? featureRegistry.getDomains() : []
    };
  }

  /**
   * Display feature report in console
   */
  displayFeatureReport() {
    const report = this.getFeatureReport();
    
    console.log('═══════════════════════════════════════');
    console.log('   FEATURE GOVERNANCE');
    console.log('═══════════════════════════════════════');
    console.log(`Total Features:    ${report.totalFeatures}`);
    console.log(`Health Score:      ${report.healthScore}%`);
    console.log(`✅ Healthy:        ${report.healthy}`);
    console.log(`❌ Unhealthy:      ${report.unhealthy}`);
    console.log(`⛔ Disabled:       ${report.disabled}`);
    console.log(`⚠️  Warnings:       ${report.warnings}`);
    console.log(`📁 Domains:        ${report.domains.length}`);
    
    if (report.brokenFeatures.length > 0) {
      console.warn('Broken Features:');
      for (const broken of report.brokenFeatures) {
        console.warn(`  ${broken.name} (${broken.id})`);
        if (broken.issues) {
          for (const issue of broken.issues) {
            console.warn(`    - ${issue}`);
          }
        }
      }
    } else {
      console.log('✅ All features are healthy.');
    }
    console.log('═══════════════════════════════════════');
  }

  // ============================================================
  // 🔥 PART 4: UI CONSTITUTION METHODS
  // ============================================================

  /**
   * Get UI report
   * @returns {Object} UI report
   */
  getUIReport() {
    const health = uiHealth.getHealth ? uiHealth.getHealth() : {};
    const summary = uiHealth.getSummary ? uiHealth.getSummary() : {};
    const warnings = uiValidator.getWarnings ? uiValidator.getWarnings() : [];
    
    return {
      totalComponents: uiRegistry.count ? uiRegistry.count() : 0,
      healthScore: health.healthScore || 0,
      healthy: health.healthyComponents || 0,
      unhealthy: health.unhealthyComponents || 0,
      unused: health.unusedComponents || 0,
      brokenComponents: health.brokenComponents || [],
      warnings: warnings.length || 0,
      summary: summary,
      categories: uiRegistry.getCategories ? uiRegistry.getCategories() : []
    };
  }

  /**
   * Display UI report in console
   */
  displayUIReport() {
    const report = this.getUIReport();
    
    console.log('═══════════════════════════════════════');
    console.log('   UI CONSTITUTION');
    console.log('═══════════════════════════════════════');
    console.log(`Total Components:  ${report.totalComponents}`);
    console.log(`Health Score:      ${report.healthScore}%`);
    console.log(`✅ Healthy:        ${report.healthy}`);
    console.log(`❌ Unhealthy:      ${report.unhealthy}`);
    console.log(`📭 Unused:         ${report.unused}`);
    console.log(`⚠️  Warnings:       ${report.warnings}`);
    console.log(`📁 Categories:     ${report.categories.length}`);
    
    if (report.brokenComponents.length > 0) {
      console.warn('Broken Components:');
      for (const broken of report.brokenComponents) {
        console.warn(`  ${broken.name} (${broken.id})`);
        if (broken.issues) {
          for (const issue of broken.issues) {
            console.warn(`    - ${issue}`);
          }
        }
      }
    } else {
      console.log('✅ All UI components are healthy.');
    }
    console.log('═══════════════════════════════════════');
  }

  /**
   * Display complete report (runtime + features + UI)
   */
  displayFull() {
    this.display();
    console.log('');
    this.displayFeatureReport();
    console.log('');
    this.displayUIReport();
  }

  /**
   * Get feature details by ID
   * @param {string} featureId 
   * @returns {Object|null} Feature details
   */
  getFeature(featureId) {
    return featureRegistry.find(featureId);
  }

  /**
   * Get features by domain
   * @param {string} domain 
   * @returns {Array} Features in domain
   */
  getFeaturesByDomain(domain) {
    return featureRegistry.findByDomain ? featureRegistry.findByDomain(domain) : [];
  }

  /**
   * Get UI component details by ID
   * @param {string} componentId 
   * @returns {Object|null} Component details
   */
  getUIComponent(componentId) {
    return uiRegistry.find ? uiRegistry.find(componentId) : null;
  }

  /**
   * Get UI components by category
   * @param {string} category 
   * @returns {Array} Components in category
   */
  getUIComponentsByCategory(category) {
    return uiRegistry.findByCategory ? uiRegistry.findByCategory(category) : [];
  }
}

// Singleton instance
const runtimeInspector = new RuntimeInspector();

// 暴露到全局供 DevPanel 使用
if (typeof window !== 'undefined') {
  window.RuntimeInspector = runtimeInspector;
}

export default runtimeInspector;
