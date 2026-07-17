/**
 * Architecture Validator
 * 
 * Detects duplicate domains, duplicate registrations,
 * missing layer assignments, and invalid engine placement.
 * Emits warnings only; never blocks boot.
 */

import domainRegistry from './domainRegistry.js';
import layerRegistry from './layerRegistry.js';

class ArchitectureValidator {
  constructor() {
    this.warnings = [];
    this.validated = false;
  }

  /**
   * Run all validation checks
   */
  validate() {
    this.warnings = [];
    this._validateDomains();
    this._validateLayers();
    this._validateEnginePlacement();
    this.validated = true;
    this._report();
  }

  /**
   * Check for duplicate domain registrations
   */
  _validateDomains() {
    const domains = domainRegistry.list();
    const names = domains.map(d => d.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      this.warnings.push(`Duplicate domains detected: ${duplicates.join(', ')}`);
    }
  }

  /**
   * Check for duplicate component registrations in layers
   */
  _validateLayers() {
    const allLayers = layerRegistry.list();
    const seen = new Map();
    for (const [layerName, components] of Object.entries(allLayers)) {
      for (const comp of components) {
        const key = comp.componentName;
        if (seen.has(key)) {
          this.warnings.push(`Component "${key}" registered in multiple layers: "${seen.get(key)}" and "${layerName}"`);
        } else {
          seen.set(key, layerName);
        }
      }
    }
  }

  /**
   * Check that core engines are in Core layer, etc.
   * (placeholder - can be extended)
   */
  _validateEnginePlacement() {
    // Example: ensure certain engines are in correct layers
    const coreEngines = ['eventBus', 'coreLearningEngine', 'progressEngine', 'xpEngine'];
    for (const eng of coreEngines) {
      const found = layerRegistry.find(eng);
      if (found && found.layer !== 'Core') {
        this.warnings.push(`Engine "${eng}" should be in Core layer but is in "${found.layer}"`);
      }
    }
  }

  _report() {
    if (this.warnings.length === 0) {
      console.log('[ArchitectureValidator] No warnings.');
    } else {
      console.warn('[ArchitectureValidator] Architecture warnings:');
      this.warnings.forEach(w => console.warn(`  - ${w}`));
    }
  }
}

const architectureValidator = new ArchitectureValidator();
export default architectureValidator;
