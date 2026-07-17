/**
 * Feature Validator
 * 
 * Detects duplicate features, invalid domains,
 * missing dependencies, and orphan features.
 * Warnings only - never stops application boot.
 */

import featureRegistry from './featureRegistry.js';
import domainRegistry from './domainRegistry.js';

class FeatureValidator {
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

    this._validateDuplicateFeatures();
    this._validateDomains();
    this._validateDependencies();
    this._validateOrphanFeatures();
    this._validateStatus();

    this.validated = true;
    this._report();
  }

  /**
   * Check for duplicate feature IDs
   */
  _validateDuplicateFeatures() {
    const features = featureRegistry.list();
    const ids = features.map(f => f.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      this.warnings.push({
        type: 'duplicate_feature',
        message: `Duplicate feature IDs: ${duplicates.join(', ')}`,
        severity: 'warning'
      });
    }
  }

  /**
   * Validate that feature domains exist in domain registry
   */
  _validateDomains() {
    const features = featureRegistry.list();
    const registeredDomains = domainRegistry.list().map(d => d.name);
    
    for (const feature of features) {
      if (feature.domain && !registeredDomains.includes(feature.domain)) {
        this.warnings.push({
          type: 'invalid_domain',
          message: `Feature "${feature.id}" uses invalid domain: "${feature.domain}"`,
          severity: 'warning',
          feature: feature.id
        });
      }
    }
  }

  /**
   * Validate that all dependencies exist
   */
  _validateDependencies() {
    const features = featureRegistry.list();
    
    for (const feature of features) {
      if (!feature.dependencies || feature.dependencies.length === 0) continue;
      
      for (const dep of feature.dependencies) {
        if (!featureRegistry.validate(dep)) {
          this.warnings.push({
            type: 'missing_dependency',
            message: `Feature "${feature.id}" depends on missing feature: "${dep}"`,
            severity: 'warning',
            feature: feature.id,
            dependency: dep
          });
        }
      }
    }
  }

  /**
   * Detect orphan features (no dependencies, no dependents)
   */
  _validateOrphanFeatures() {
    const features = featureRegistry.list();
    
    for (const feature of features) {
      // Skip core features
      if (feature.core) continue;
      
      const hasDependencies = feature.dependencies && feature.dependencies.length > 0;
      const hasDependents = featureRegistry.getDependents(feature.id).length > 0;
      
      if (!hasDependencies && !hasDependents) {
        this.warnings.push({
          type: 'orphan_feature',
          message: `Feature "${feature.id}" is orphan (no dependencies, no dependents)`,
          severity: 'info',
          feature: feature.id
        });
      }
    }
  }

  /**
   * Validate feature status values
   */
  _validateStatus() {
    const validStatuses = ['active', 'beta', 'comingSoon', 'deprecated', 'disabled'];
    const features = featureRegistry.list();
    
    for (const feature of features) {
      if (feature.status && !validStatuses.includes(feature.status)) {
        this.warnings.push({
          type: 'invalid_status',
          message: `Feature "${feature.id}" has invalid status: "${feature.status}"`,
          severity: 'warning',
          feature: feature.id
        });
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
      console.log('[FeatureValidator] All features validated successfully.');
    } else {
      console.warn(`[FeatureValidator] Found ${errorCount} warnings, ${infoCount} info messages:`);
      
      // Group by type for better readability
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
const featureValidator = new FeatureValidator();
export default featureValidator;
