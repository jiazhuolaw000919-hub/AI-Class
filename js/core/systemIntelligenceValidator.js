/**
 * System Intelligence Validator
 * Validates intelligence sources and domains.
 * Warnings only – never stops Boot.
 */

import { INTELLIGENCE_DOMAINS } from './systemIntelligenceManifest.js';

export function validateIntelligence() {
  var warnings = [];
  var seen = new Set();

  for (var i = 0; i < INTELLIGENCE_DOMAINS.length; i++) {
    var domain = INTELLIGENCE_DOMAINS[i];

    // Duplicate intelligence source
    if (seen.has(domain.id)) {
      warnings.push('Duplicate intelligence source: "' + domain.id + '"');
    }
    seen.add(domain.id);

    // Missing description
    if (!domain.description || domain.description.trim() === '') {
      warnings.push('Missing description for domain: "' + domain.id + '"');
    }

    // Missing source
    if (!domain.source || domain.source.trim() === '') {
      warnings.push('Missing source for domain: "' + domain.id + '"');
    }

    // Missing name
    if (!domain.name || domain.name.trim() === '') {
      warnings.push('Missing name for domain: "' + domain.id + '"');
    }

    // Missing version
    if (!domain.version || domain.version.trim() === '') {
      warnings.push('Missing version for domain: "' + domain.id + '"');
    }

    // Unknown status
    if (domain.status && !['active', 'deprecated', 'experimental'].includes(domain.status)) {
      warnings.push('Invalid status "' + domain.status + '" for domain: "' + domain.id + '"');
    }

    // Check if source actually exists at runtime
    var sourceExists = false;
    try {
      if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        if (LawAIApp[domain.source]) sourceExists = true;
      }
      if (!sourceExists && typeof window !== 'undefined') {
        if (window[domain.source]) sourceExists = true;
      }
    } catch (e) { /* ignore */ }

    if (!sourceExists) {
      warnings.push('Missing intelligence source: "' + domain.source + '" for domain: "' + domain.id + '"');
    }
  }

  return warnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntelligenceValidator = {
    validateIntelligence: validateIntelligence,
    init: function() {
      console.log('✅ SystemIntelligenceValidator ready');
      var warnings = validateIntelligence();
      if (warnings.length > 0) {
        console.warn('⚠️ Intelligence warnings:', warnings.length);
        warnings.forEach(function(w) { console.warn('  ' + w); });
      } else {
        console.log('✅ All intelligence sources valid.');
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntelligenceValidator = window.systemIntelligenceValidator;
  }
}
