/**
 * Runtime Health
 * 
 * Collects and displays information about loaded engines,
 * domains, features, boot time, and missing dependencies.
 * Developer tool only.
 * 
 * 🔥 PART 2: Added boot performance reporting
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
    this._bootSteps = [];
    this._moduleTimes = [];
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
   * Record a boot step for performance tracking
   * @param {string} stepName - Name of the step
   */
  recordStep(stepName) {
    this._bootSteps.push({
      step: stepName,
      timestamp: Date.now(),
      elapsed: Date.now() - this.bootTime
    });
  }

  /**
   * Record a module initialization time
   * @param {string} moduleName - Module name
   * @param {number} duration - Duration in ms
   */
  recordModule(moduleName, duration) {
    this._moduleTimes.push({
      module: moduleName,
      duration: duration
    });
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

    // Display performance report if available
    this.displayPerformance();
  }

  /**
   * 🔥 PART 2: Display boot performance report
   */
  displayPerformance() {
    const stepCount = this._bootSteps.length;
    const moduleCount = this._moduleTimes.length;
    
    if (stepCount === 0 && moduleCount === 0) {
      return; // No performance data
    }

    // Find slowest step
    let slowestStep = null;
    let maxDuration = 0;
    for (let i = 1; i < this._bootSteps.length; i++) {
      const prev = this._bootSteps[i - 1];
      const curr = this._bootSteps[i];
      const duration = curr.timestamp - prev.timestamp;
      if (duration > maxDuration) {
        maxDuration = duration;
        slowestStep = curr.step;
      }
    }

    // Find slowest module
    let slowestModule = null;
    let maxModuleDuration = 0;
    for (const mod of this._moduleTimes) {
      if (mod.duration > maxModuleDuration) {
        maxModuleDuration = mod.duration;
        slowestModule = mod.module;
      }
    }

    const avgModuleDuration = moduleCount > 0 
      ? this._moduleTimes.reduce((sum, m) => sum + m.duration, 0) / moduleCount 
      : 0;

    console.log('═══════════════════════════════════════');
    console.log('   BOOT PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════');
    console.table({
      'Total Boot Time': `${Date.now() - this.bootTime}ms`,
      'Steps': stepCount,
      'Modules Initialized': moduleCount,
      'Slowest Step': slowestStep ? `${slowestStep} (${maxDuration}ms)` : 'N/A',
      'Slowest Module': slowestModule ? `${slowestModule} (${maxModuleDuration}ms)` : 'N/A',
      'Average Module Init': `${Math.round(avgModuleDuration)}ms`
    });

    // Detailed step list
    if (stepCount > 0) {
      console.log('\n┌─ Boot Steps ──────────────────────┐');
      for (const step of this._bootSteps) {
        console.log(`│ ${step.step.padEnd(30)} ${String(step.elapsed).padStart(5)}ms │`);
      }
      console.log('└────────────────────────────────────┘');
    }

    // Detailed module list
    if (moduleCount > 0) {
      console.log('\n┌─ Module Init Times ──────────────┐');
      const sorted = [...this._moduleTimes].sort((a, b) => b.duration - a.duration);
      for (const mod of sorted) {
        console.log(`│ ${mod.module.padEnd(30)} ${String(mod.duration).padStart(5)}ms │`);
      }
      console.log('└────────────────────────────────────┘');
    }

    console.log('═══════════════════════════════════════');
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
      missingDependencies: this.missingDependencies,
      bootSteps: this._bootSteps,
      moduleTimes: this._moduleTimes
    };
  }

  /**
   * Get boot performance report
   */
  getBootPerformance() {
    return {
      totalTime: Date.now() - this.bootTime,
      steps: this._bootSteps,
      modules: this._moduleTimes
    };
  }
}

const runtimeHealth = new RuntimeHealth();
export default runtimeHealth;
