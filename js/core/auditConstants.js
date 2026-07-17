/**
 * Audit Constants
 * 
 * Central store for audit-related constants.
 * Avoid magic strings.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AuditConstants = {
  // Audit Levels
  LEVELS: {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info',
    PASS: 'pass'
  },

  // Severity
  SEVERITY: {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },

  // Warning Types
  WARNING_TYPES: {
    DUPLICATE: 'duplicate',
    MISSING: 'missing',
    CIRCULAR: 'circular',
    UNUSED: 'unused',
    DEPRECATED: 'deprecated',
    BROKEN: 'broken',
    VERSION_MISMATCH: 'version_mismatch',
    INVALID: 'invalid'
  },

  // Score Rules
  SCORE_RULES: {
    PASS_THRESHOLD: 70,
    GOOD_THRESHOLD: 80,
    DEGRADED_THRESHOLD: 50,
    MAX_SCORE: 100,
    MIN_SCORE: 0
  },

  // Score Penalties
  PENALTIES: {
    MISSING_DEPENDENCY: 5,
    CIRCULAR_DEPENDENCY: 10,
    DUPLICATE_MODULE: 10,
    UNUSED_MODULE: 5,
    DEPRECATED_MODULE: 3,
    BROKEN_MODULE: 10,
    MISSING_REGISTRY: 20,
    MISSING_LAYER: 10
  },

  // Reserved Audit IDs
  RESERVED_AUDIT_IDS: [
    'audit_architecture',
    'audit_runtime',
    'audit_features',
    'audit_ui',
    'audit_domains',
    'audit_layers',
    'audit_dependencies',
    'audit_modules'
  ],

  // Status Display
  STATUS_ICONS: {
    excellent: '🌟',
    good: '✅',
    degraded: '⚠️',
    critical: '❌',
    unknown: '❓'
  },

  STATUS_COLORS: {
    excellent: '#22c55e',
    good: '#4a9eff',
    degraded: '#f59e0b',
    critical: '#ef4444',
    unknown: '#64748b'
  },

  /**
   * Get icon for status
   */
  getStatusIcon: function(status) {
    return this.STATUS_ICONS[status] || this.STATUS_ICONS.unknown;
  },

  /**
   * Get color for status
   */
  getStatusColor: function(status) {
    return this.STATUS_COLORS[status] || this.STATUS_COLORS.unknown;
  },

  /**
   * Check if score passes
   */
  isPass: function(score) {
    return score >= this.SCORE_RULES.PASS_THRESHOLD;
  },

  /**
   * Get status from score
   */
  getStatusFromScore: function(score) {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'degraded';
    return 'critical';
  },

  /**
   * Get all warning types
   */
  getAllWarningTypes: function() {
    return Object.values(this.WARNING_TYPES);
  },

  /**
   * Get all severity levels
   */
  getAllSeverities: function() {
    return Object.values(this.SEVERITY);
  }
};

// 暴露到全局
window.auditConstants = LawAIApp.AuditConstants;

console.log('📋 AuditConstants ready');
