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
}

// Singleton instance
const runtimeInspector = new RuntimeInspector();
export default runtimeInspector;
