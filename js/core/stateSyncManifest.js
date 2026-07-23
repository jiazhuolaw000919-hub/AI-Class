/**
 * State Sync Manifest
 * State Synchronization Framework Configuration
 * Part 45.1 - State Synchronization Foundation
 */

// ============================================================
// STATE SYNC MANIFEST DEFINITION
// ============================================================

export const STATE_SYNC_MANIFEST = {
  name: 'Runtime State Synchronization Framework',
  version: '1.0.0',
  status: 'active',
  enabled: true,

  // Configuration
  config: {
    maxHistory: 100,
    debugMode: false,
    autoSync: true,
    conflictResolution: 'last_write_wins'
  },

  // Default State Owners
  defaultOwners: {
    learning: 'LearningEngine',
    module: 'Runtime',
    session: 'SessionManager',
    user: 'UserManager',
    engine: 'EngineRegistry'
  },

  // Metadata
  metadata: {
    created: '2026-07-23',
    part: '45.1',
    description: 'Runtime State Synchronization Framework Configuration'
  }
};

// ============================================================
// MANIFEST API
// ============================================================

export function getManifest() {
  return JSON.parse(JSON.stringify(STATE_SYNC_MANIFEST));
}

export function getManifestVersion() {
  return STATE_SYNC_MANIFEST.version;
}

export function isEnabled() {
  return STATE_SYNC_MANIFEST.enabled && STATE_SYNC_MANIFEST.status === 'active';
}

export function getConfig() {
  return JSON.parse(JSON.stringify(STATE_SYNC_MANIFEST.config));
}

export function getDefaultOwners() {
  return JSON.parse(JSON.stringify(STATE_SYNC_MANIFEST.defaultOwners));
}

export function isDebugMode() {
  return STATE_SYNC_MANIFEST.config.debugMode;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initStateSyncManifest() {
  if (isDebugMode()) {
    console.log('[State Sync] Manifest Loaded');
    console.log('[State Sync] Version:', STATE_SYNC_MANIFEST.version);
    console.log('[State Sync] Owners:', Object.keys(STATE_SYNC_MANIFEST.defaultOwners).join(', '));
  }
  return STATE_SYNC_MANIFEST;
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.stateSyncManifest = {
    getManifest: getManifest,
    getManifestVersion: getManifestVersion,
    isEnabled: isEnabled,
    getConfig: getConfig,
    getDefaultOwners: getDefaultOwners,
    isDebugMode: isDebugMode,
    init: function() {
      initStateSyncManifest();
      console.log('✅ StateSyncManifest ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.StateSyncManifest = window.stateSyncManifest;
  }
}
