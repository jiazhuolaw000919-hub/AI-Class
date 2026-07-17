/**
 * UI Validator
 * 
 * Detects duplicate components, invalid component IDs,
 * missing component metadata.
 * Warnings only - never stops application boot.
 */

import uiRegistry from './uiRegistry.js';

class UIValidator {
  constructor() {
    this.warnings = [];
    this.validated = false;
    this.validationTime = null;
  }

  /**
   * Run all validation checks
   */
  validate() {
    this.warnings = [];
    this.validationTime = Date.now();

    this._validateDuplicateComponents();
    this._validateCategories();
    this._validateStatus();
    this._validateVersions();
    this._validateDependencies();

    this.validated = true;
    this._report();
  }

  /**
   * Check for duplicate component IDs
   */
  _validateDuplicateComponents() {
    const components = uiRegistry.list();
    const ids = components.map(c => c.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      this.warnings.push({
        type: 'duplicate_component',
        message: `Duplicate component IDs: ${duplicates.join(', ')}`,
        severity: 'warning'
      });
    }
  }

  /**
   * Validate component categories
   */
  _validateCategories() {
    const validCategories = [
      'Button', 'Card', 'Modal', 'Dialog', 'Toast', 'ProgressBar',
      'Chart', 'Sidebar', 'Header', 'Footer', 'Widget', 'Panel',
      'Input', 'Dropdown', 'Tab', 'Table', 'List', 'Form',
      'Tooltip', 'Badge', 'Avatar', 'Icon', 'Alert', 'Loader',
      'Slider', 'Toggle', 'Switch', 'Radio', 'Checkbox', 'Select'
    ];
    
    const components = uiRegistry.list();
    
    for (const component of components) {
      if (component.category && !validCategories.includes(component.category)) {
        this.warnings.push({
          type: 'invalid_category',
          message: `Component "${component.id}" has invalid category: "${component.category}"`,
          severity: 'warning',
          component: component.id
        });
      }
    }
  }

  /**
   * Validate component status
   */
  _validateStatus() {
    const validStatuses = ['active', 'deprecated', 'experimental', 'archived'];
    const components = uiRegistry.list();
    
    for (const component of components) {
      if (component.status && !validStatuses.includes(component.status)) {
        this.warnings.push({
          type: 'invalid_status',
          message: `Component "${component.id}" has invalid status: "${component.status}"`,
          severity: 'warning',
          component: component.id
        });
      }
    }
  }

  /**
   * Validate component versions
   */
  _validateVersions() {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    const components = uiRegistry.list();
    
    for (const component of components) {
      if (component.version && !versionRegex.test(component.version)) {
        this.warnings.push({
          type: 'invalid_version',
          message: `Component "${component.id}" has invalid version format: "${component.version}" (expected: x.y.z)`,
          severity: 'warning',
          component: component.id
        });
      }
    }
  }

  /**
   * Validate component dependencies
   */
  _validateDependencies() {
    const components = uiRegistry.list();
    
    for (const component of components) {
      if (!component.dependencies || component.dependencies.length === 0) continue;
      
      for (const dep of component.dependencies) {
        // Check if dependency is a registered component
        if (!uiRegistry.validate(dep)) {
          this.warnings.push({
            type: 'missing_dependency',
            message: `Component "${component.id}" depends on missing component: "${dep}"`,
            severity: 'warning',
            component: component.id,
            dependency: dep
          });
        }
      }
    }
  }

  /**
   * Report validation results
   */
  _report() {
    const errorCount = this.warnings.filter(w => w.severity === 'warning').length;
    const infoCount = this.warnings.filter(w => w.severity === 'info').length;

    if (this.warnings.length === 0) {
      console.log('[UIValidator] All UI components validated successfully.');
    } else {
      console.warn(`[UIValidator] Found ${errorCount} warnings, ${infoCount} info messages:`);
      
      // Group by type
      const grouped = this.warnings.reduce((acc, w) => {
        if (!acc[w.type]) acc[w.type] = [];
        acc[w.type].push(w);
        return acc;
      }, {});

      for (const [type, items] of Object.entries(grouped)) {
        console.group(`  ${type.toUpperCase()} (${items.length})`);
        for (const item of items) {
          console.warn(`    ${item.message}`);
        }
        console.groupEnd();
      }
    }
  }

  /**
   * Get validation warnings
   * @param {string} type - Optional filter by type
   * @returns {Array} Warnings
   */
  getWarnings(type = null) {
    if (type) {
      return this.warnings.filter(w => w.type === type);
    }
    return [...this.warnings];
  }

  /**
   * Check if validation passed (no warnings)
   * @returns {boolean}
   */
  isValid() {
    return this.warnings.length === 0;
  }

  /**
   * Get validation summary
   * @returns {Object} Summary
   */
  getSummary() {
    return {
      validated: this.validated,
      validationTime: this.validationTime,
      warningCount: this.warnings.length,
      warningTypes: this.warnings.reduce((acc, w) => {
        acc[w.type] = (acc[w.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Singleton instance
const uiValidator = new UIValidator();
export default uiValidator;
