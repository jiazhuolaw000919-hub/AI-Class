/**
 * Engine Signal Registry
 * Registers and queries signal definitions.
 * Metadata only – never executes signals.
 */

import { OFFICIAL_SIGNALS } from './engineSignalManifest.js';

// Runtime storage for dynamic signal registrations
let _runtimeSignals = [];

export function register(name, type, severity, source, description, version) {
  // Check if signal already exists in manifest
  const exists = OFFICIAL_SIGNALS.some(s => s.name === name);
  if (exists) {
    console.warn('⚠️ Signal already exists in manifest:', name);
    return false;
  }
  
  // Check if already registered at runtime
  const existsRuntime = _runtimeSignals.some(s => s.name === name);
  if (existsRuntime) {
    console.warn('⚠️ Signal already registered at runtime:', name);
    return false;
  }
  
  _runtimeSignals.push({
    name: name,
    type: type || 'EVENT',
    severity: severity || 'INFO',
    source: source || 'Unknown',
    description: description || '',
    version: version || '1.0',
    registered: new Date().toISOString(),
    runtime: true
  });
  
  return true;
}

export function list() {
  const all = [
    ...OFFICIAL_SIGNALS.map(s => ({ ...s, runtime: false })),
    ..._runtimeSignals
  ];
  return all;
}

export function find(name) {
  const manifest = OFFICIAL_SIGNALS.find(s => s.name === name);
  if (manifest) {
    return { ...manifest, runtime: false };
  }
  
  const runtime = _runtimeSignals.find(s => s.name === name);
  return runtime ? { ...runtime } : null;
}

export function findByType(type) {
  const manifest = OFFICIAL_SIGNALS
    .filter(s => s.type === type)
    .map(s => ({ ...s, runtime: false }));
  
  const runtime = _runtimeSignals.filter(s => s.type === type);
  
  return [...manifest, ...runtime];
}

export function findBySeverity(severity) {
  const manifest = OFFICIAL_SIGNALS
    .filter(s => s.severity === severity)
    .map(s => ({ ...s, runtime: false }));
  
  const runtime = _runtimeSignals.filter(s => s.severity === severity);
  
  return [...manifest, ...runtime];
}

export function findBySource(source) {
  const manifest = OFFICIAL_SIGNALS
    .filter(s => s.source === source)
    .map(s => ({ ...s, runtime: false }));
  
  const runtime = _runtimeSignals.filter(s => s.source === source);
  
  return [...manifest, ...runtime];
}

export function count() {
  return OFFICIAL_SIGNALS.length + _runtimeSignals.length;
}

export function countByType() {
  const result = {};
  const all = list();
  for (let i = 0; i < all.length; i++) {
    const type = all[i].type;
    result[type] = (result[type] || 0) + 1;
  }
  return result;
}

export function countBySeverity() {
  const result = {};
  const all = list();
  for (let i = 0; i < all.length; i++) {
    const severity = all[i].severity;
    result[severity] = (result[severity] || 0) + 1;
  }
  return result;
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineSignalRegistry = {
    register,
    list,
    find,
    findByType,
    findBySeverity,
    findBySource,
    count,
    countByType,
    countBySeverity,
    init: function() { console.log('✅ EngineSignalRegistry ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineSignalRegistry = window.engineSignalRegistry;
  }
}
