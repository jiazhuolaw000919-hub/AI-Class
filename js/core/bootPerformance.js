/**
 * Boot Performance Report
 * 
 * Collects and displays boot performance metrics.
 * Developer tool only.
 */

class BootPerformance {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      steps: [],
      modules: []
    };
    this.initialized = false;
  }

  /**
   * Initialize performance collector
   */
  init() {
    if (this.initialized) return;
    this.metrics.startTime = Date.now();
    this.initialized = true;
    console.log('[BootPerformance] Initialized.');
  }

  /**
   * Record a boot step
   * @param {string} stepName - Step name
   * @param {Object} data - Additional data
   */
  recordStep(stepName, data = {}) {
    this.metrics.steps.push({
      step: stepName,
      timestamp: Date.now(),
      elapsed: Date.now() - this.metrics.startTime,
      ...data
    });
  }

  /**
   * Record a module initialization
   * @param {string} moduleName - Module name
   * @param {number} duration - Initialization duration in ms
   */
  recordModule(moduleName, duration) {
    this.metrics.modules.push({
      module: moduleName,
      duration: duration
    });
  }

  /**
   * Complete boot and generate report
   */
  complete() {
    this.metrics.endTime = Date.now();
    this._generateReport();
  }

  /**
   * Generate and display performance report
   */
  _generateReport() {
    const totalTime = this.metrics.endTime - this.metrics.startTime;
    const stepCount = this.metrics.steps.length;
    const moduleCount = this.metrics.modules.length;
    
    // Find slowest step
    let slowestStep = null;
    let maxDuration = 0;
    for (let i = 1; i < this.metrics.steps.length; i++) {
      const prev = this.metrics.steps[i - 1];
      const curr = this.metrics.steps[i];
      const duration = curr.timestamp - prev.timestamp;
      if (duration > maxDuration) {
        maxDuration = duration;
        slowestStep = curr.step;
      }
    }

    // Find slowest module
    let slowestModule = null;
    let maxModuleDuration = 0;
    for (const mod of this.metrics.modules) {
      if (mod.duration > maxModuleDuration) {
        maxModuleDuration = mod.duration;
        slowestModule = mod.module;
      }
    }

    const avgModuleDuration = moduleCount > 0 
      ? this.metrics.modules.reduce((sum, m) => sum + m.duration, 0) / moduleCount 
      : 0;

    // Display report
    console.log('═══════════════════════════════════════');
    console.log('   BOOT PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════');
    console.table({
      'Total Boot Time': `${totalTime}ms`,
      'Steps': stepCount,
      'Modules Initialized': moduleCount,
      'Slowest Step': slowestStep ? `${slowestStep} (${maxDuration}ms)` : 'N/A',
      'Slowest Module': slowestModule ? `${slowestModule} (${maxModuleDuration}ms)` : 'N/A',
      'Average Module Init': `${Math.round(avgModuleDuration)}ms`
    });

    // Detailed module list
    if (moduleCount > 0) {
      console.log('\n┌─ Module Init Times ──────────────┐');
      const sorted = [...this.metrics.modules].sort((a, b) => b.duration - a.duration);
      for (const mod of sorted) {
        console.log(`│ ${mod.module.padEnd(30)} ${String(mod.duration).padStart(5)}ms │`);
      }
      console.log('└────────────────────────────────────┘');
    }

    // Detailed step list
    if (stepCount > 0) {
      console.log('\n┌─ Boot Steps ──────────────────────┐');
      for (const step of this.metrics.steps) {
        console.log(`│ ${step.step.padEnd(30)} ${String(step.elapsed).padStart(5)}ms │`);
      }
      console.log('└────────────────────────────────────┘');
    }

    console.log('═══════════════════════════════════════');
  }

  /**
   * Get raw metrics data
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      startTime: this.metrics.startTime,
      endTime: this.metrics.endTime,
      totalTime: this.metrics.endTime - this.metrics.startTime,
      steps: [...this.metrics.steps],
      modules: [...this.metrics.modules]
    };
  }
}

// Singleton instance
const bootPerformance = new BootPerformance();
export default bootPerformance;
