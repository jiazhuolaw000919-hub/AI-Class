/**
 * Runtime Trace Validator
 * Validates trace data and relationships.
 * Warnings only – never stops Boot.
 */

import { TRACE_TYPES, TRACE_STATUSES } from './runtimeTraceManifest.js';
import { getTraces, getTrace } from './runtimeTraceCollector.js';

export function validateTrace(trace) {
  var warnings = [];
  
  if (!trace) {
    warnings.push('Trace is null or undefined');
    return warnings;
  }
  
  // Check for duplicate trace ID
  var existing = getTrace(trace.traceId);
  if (existing && existing !== trace) {
    warnings.push('Duplicate trace ID: "' + trace.traceId + '"');
  }
  
  // Check for invalid trace ID
  if (!trace.traceId || trace.traceId.trim() === '') {
    warnings.push('Invalid trace ID: missing or empty');
  }
  
  // Check for missing parent
  if (trace.parentTraceId) {
    var parent = getTrace(trace.parentTraceId);
    if (!parent) {
      warnings.push('Missing parent trace: "' + trace.parentTraceId + '"');
    }
  }
  
  // Check for invalid status
  if (trace.status && TRACE_STATUSES.indexOf(trace.status) === -1) {
    warnings.push('Invalid status: "' + trace.status + '"');
  }
  
  // Check for invalid trace type
  if (trace.type) {
    var validType = TRACE_TYPES.some(function(t) { return t.id === trace.type; });
    if (!validType) {
      warnings.push('Invalid trace type: "' + trace.type + '"');
    }
  }
  
  return warnings;
}

export function validateAllTraces() {
  var traces = getTraces();
  var allWarnings = [];
  
  for (var i = 0; i < traces.length; i++) {
    var warnings = validateTrace(traces[i]);
    if (warnings.length > 0) {
      allWarnings.push({
        traceId: traces[i].traceId,
        warnings: warnings
      });
    }
  }
  
  return allWarnings;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeTraceValidator = {
    validateTrace: validateTrace,
    validateAllTraces: validateAllTraces,
    init: function() {
      console.log('✅ RuntimeTraceValidator ready');
      var warnings = validateAllTraces();
      if (warnings.length > 0) {
        console.warn('⚠️ Trace warnings:', warnings.length);
        warnings.forEach(function(w) {
          console.warn('  ' + w.traceId + ':', w.warnings.join('; '));
        });
      } else {
        console.log('✅ All traces valid.');
      }
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeTraceValidator = window.runtimeTraceValidator;
  }
}
