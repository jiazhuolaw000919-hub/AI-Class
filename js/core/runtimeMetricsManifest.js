/**
 * Runtime Metrics Manifest
 * Maintains official runtime metrics.
 * Read only – do not modify at runtime.
 */

export const METRICS = [
  { id: 'BOOT_TIME', category: 'boot', unit: 'ms', description: 'Total boot time' },
  { id: 'AVG_BOOT_TIME', category: 'boot', unit: 'ms', description: 'Average boot time' },
  { id: 'PIPELINE_DURATION', category: 'pipeline', unit: 'ms', description: 'Pipeline execution time' },
  { id: 'STAGE_DURATION', category: 'pipeline', unit: 'ms', description: 'Individual stage duration' },
  { id: 'ENGINE_COUNT', category: 'engine', unit: 'count', description: 'Number of registered engines' },
  { id: 'HEALTHY_ENGINES', category: 'engine', unit: 'count', description: 'Number of healthy engines' },
  { id: 'RUNTIME_HEALTH', category: 'health', unit: 'percent', description: 'Runtime health score' },
  { id: 'ERROR_COUNT', category: 'health', unit: 'count', description: 'Total error count' },
  { id: 'WARNING_COUNT', category: 'health', unit: 'count', description: 'Total warning count' },
  { id: 'OBSERVATION_COUNT', category: 'observation', unit: 'count', description: 'Total observations' },
  { id: 'COVERAGE', category: 'observation', unit: 'percent', description: 'Observation coverage' }
];

export const METRIC_CATEGORIES = ['boot', 'pipeline', 'engine', 'health', 'observation'];

export function getMetrics() {
  return JSON.parse(JSON.stringify(METRICS));
}

export function getMetricById(id) {
  return METRICS.find(m => m.id === id) || null;
}

export function getMetricsByCategory(category) {
  return METRICS.filter(m => m.category === category);
}

export function getMetricCount() {
  return METRICS.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeMetricsManifest = {
    METRICS,
    METRIC_CATEGORIES,
    getMetrics,
    getMetricById,
    getMetricsByCategory,
    getMetricCount,
    init: function() { console.log('✅ RuntimeMetricsManifest ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeMetricsManifest = window.runtimeMetricsManifest;
  }
}
