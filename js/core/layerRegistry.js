/**
 * Layer Registry
 * 
 * Maintains architectural layer mapping for all engines and features.
 * Provides registration, lookup, listing, and validation.
 * No business logic.
 */

class LayerRegistry {
  constructor() {
    this.layers = {
      App: new Map(),
      Core: new Map(),
      Feature: new Map(),
      Content: new Map(),
      UI: new Map(),
      AI: new Map()
    };
    this.initialized = false;
  }

  /**
   * Initialize with default layer assignments (optional)
   */
  init() {
    if (this.initialized) return;
    // Pre-populate known engines (optional)
    this.initialized = true;
    console.log('[LayerRegistry] Initialized with layers:', Object.keys(this.layers));
  }

  /**
   * Register an engine/component to a layer
   * @param {string} layerName - One of 'App','Core','Feature','Content','UI','AI'
   * @param {string} componentName - Engine or component name
   * @param {Object} metadata - Additional info (optional)
   */
  register(layerName, componentName, metadata = {}) {
    const layer = this.layers[layerName];
    if (!layer) {
      console.warn(`[LayerRegistry] Unknown layer "${layerName}". Available: ${Object.keys(this.layers).join(', ')}`);
      return;
    }
    if (layer.has(componentName)) {
      console.warn(`[LayerRegistry] Component "${componentName}" already registered in layer "${layerName}"`);
      return;
    }
    layer.set(componentName, {
      componentName,
      layer: layerName,
      registeredAt: Date.now(),
      ...metadata
    });
  }

  /**
   * Find a component's layer
   * @param {string} componentName 
   * @returns {Object|null} { layer, record } or null
   */
  find(componentName) {
    for (const [layerName, layerMap] of Object.entries(this.layers)) {
      if (layerMap.has(componentName)) {
        return {
          layer: layerName,
          record: layerMap.get(componentName)
        };
      }
    }
    return null;
  }

  /**
   * List all components in a layer, or all layers
   * @param {string} [layerName] - Optional layer name
   * @returns {Object} Map of layer to array of component records
   */
  list(layerName) {
    if (layerName) {
      const layer = this.layers[layerName];
      if (!layer) return {};
      return { [layerName]: Array.from(layer.values()) };
    }
    const result = {};
    for (const [name, layerMap] of Object.entries(this.layers)) {
      result[name] = Array.from(layerMap.values());
    }
    return result;
  }

  /**
   * Validate that a component exists in a given layer
   * @param {string} componentName 
   * @param {string} expectedLayer 
   * @returns {boolean}
   */
  validate(componentName, expectedLayer) {
    const found = this.find(componentName);
    if (!found) return false;
    if (expectedLayer && found.layer !== expectedLayer) return false;
    return true;
  }
}

const layerRegistry = new LayerRegistry();
export default layerRegistry;
