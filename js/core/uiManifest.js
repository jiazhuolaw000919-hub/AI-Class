/**
 * UI Manifest
 * 
 * Central catalogue for every reusable UI component.
 * Contains definitions for all core and optional components.
 */

import uiRegistry from './uiRegistry.js';

class UIManifest {
  constructor() {
    this.manifest = {
      version: '1.0.0',
      generatedAt: null,
      components: []
    };
    this.initialized = false;
  }

  /**
   * Initialize the manifest with default components
   */
  init() {
    if (this.initialized) return;
    
    // Define core components
    const coreComponents = this._getCoreComponents();
    
    // Define additional components
    const additionalComponents = this._getAdditionalComponents();
    
    // Combine
    const allComponents = [...coreComponents, ...additionalComponents];
    
    // Register all components
    for (const component of allComponents) {
      uiRegistry.register(component.id, component);
    }
    
    this.manifest.generatedAt = Date.now();
    this.manifest.components = allComponents;
    this.initialized = true;
    
    console.log(`[UIManifest] Initialized with ${allComponents.length} components.`);
  }

  /**
   * Get core component definitions
   * @returns {Array} Core components
   */
  _getCoreComponents() {
    return [
      {
        id: 'ui_card',
        name: 'Card',
        category: 'Card',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_card_css'],
        variants: ['default', 'elevated', 'glass', 'outlined']
      },
      {
        id: 'ui_button',
        name: 'Button',
        category: 'Button',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_button_css'],
        variants: ['primary', 'secondary', 'success', 'danger', 'warning', 'ghost']
      },
      {
        id: 'ui_modal',
        name: 'Modal',
        category: 'Modal',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_modal_css', 'ui_modal_js'],
        variants: ['default', 'fullscreen', 'small', 'large']
      },
      {
        id: 'ui_dialog',
        name: 'Dialog',
        category: 'Dialog',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_dialog_css'],
        variants: ['confirm', 'alert', 'prompt']
      },
      {
        id: 'ui_toast',
        name: 'Toast',
        category: 'Toast',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_toast_css', 'ui_toast_js'],
        variants: ['success', 'error', 'warning', 'info']
      },
      {
        id: 'ui_progress_bar',
        name: 'Progress Bar',
        category: 'ProgressBar',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_progress_css'],
        variants: ['default', 'animated', 'striped', 'circular']
      },
      {
        id: 'ui_sidebar',
        name: 'Sidebar',
        category: 'Sidebar',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_sidebar_css'],
        variants: ['default', 'collapsed', 'mini', 'floating']
      },
      {
        id: 'ui_header',
        name: 'Header',
        category: 'Header',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_header_css'],
        variants: ['default', 'sticky', 'transparent']
      },
      {
        id: 'ui_footer',
        name: 'Footer',
        category: 'Footer',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_footer_css'],
        variants: ['default', 'compact']
      },
      {
        id: 'ui_widget',
        name: 'Widget',
        category: 'Widget',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_widget_css'],
        variants: ['stats', 'progress', 'chart', 'calendar', 'notes']
      },
      {
        id: 'ui_panel',
        name: 'Panel',
        category: 'Panel',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_panel_css'],
        variants: ['default', 'elevated', 'glass']
      },
      {
        id: 'ui_tooltip',
        name: 'Tooltip',
        category: 'Tooltip',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_tooltip_css', 'ui_tooltip_js'],
        variants: ['top', 'bottom', 'left', 'right']
      }
    ];
  }

  /**
   * Get additional component definitions
   * @returns {Array} Additional components
   */
  _getAdditionalComponents() {
    return [
      {
        id: 'ui_badge',
        name: 'Badge',
        category: 'Badge',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_badge_css'],
        variants: ['primary', 'success', 'danger', 'warning', 'info']
      },
      {
        id: 'ui_avatar',
        name: 'Avatar',
        category: 'Avatar',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_avatar_css'],
        variants: ['circle', 'square', 'rounded', 'gradient']
      },
      {
        id: 'ui_icon',
        name: 'Icon',
        category: 'Icon',
        version: '1.0.0',
        status: 'active',
        dependencies: [],
        variants: ['small', 'medium', 'large', 'xl']
      },
      {
        id: 'ui_alert',
        name: 'Alert',
        category: 'Alert',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_alert_css'],
        variants: ['success', 'error', 'warning', 'info']
      },
      {
        id: 'ui_loader',
        name: 'Loader',
        category: 'Loader',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_loader_css'],
        variants: ['spinner', 'dots', 'bar', 'pulse']
      },
      {
        id: 'ui_tab',
        name: 'Tab',
        category: 'Tab',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_tab_css', 'ui_tab_js'],
        variants: ['default', 'underlined', 'pill']
      },
      {
        id: 'ui_input',
        name: 'Input',
        category: 'Input',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_input_css'],
        variants: ['text', 'number', 'email', 'password', 'search', 'textarea']
      },
      {
        id: 'ui_dropdown',
        name: 'Dropdown',
        category: 'Dropdown',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_dropdown_css', 'ui_dropdown_js'],
        variants: ['default', 'multi-select', 'searchable']
      },
      {
        id: 'ui_switch',
        name: 'Switch',
        category: 'Switch',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_switch_css'],
        variants: ['default', 'small', 'large']
      },
      {
        id: 'ui_chart',
        name: 'Chart',
        category: 'Chart',
        version: '1.0.0',
        status: 'experimental',
        dependencies: ['ui_chart_css', 'ui_chart_js'],
        variants: ['bar', 'line', 'pie', 'radar']
      },
      {
        id: 'ui_table',
        name: 'Table',
        category: 'Table',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_table_css'],
        variants: ['default', 'striped', 'hoverable', 'compact']
      },
      {
        id: 'ui_list',
        name: 'List',
        category: 'List',
        version: '1.0.0',
        status: 'active',
        dependencies: ['ui_list_css'],
        variants: ['default', 'bordered', 'hoverable', 'compact']
      }
    ];
  }

  /**
   * Load the manifest
   * @returns {Object} Manifest data
   */
  load() {
    if (!this.initialized) {
      this.init();
    }
    return {
      version: this.manifest.version,
      generatedAt: this.manifest.generatedAt,
      components: [...this.manifest.components]
    };
  }

  /**
   * Save the manifest (placeholder)
   * @param {Object} data - Manifest data
   */
  save(data) {
    console.log('[UIManifest] Save called (placeholder)');
  }

  /**
   * Export the manifest as JSON
   * @returns {string} JSON string
   */
  export() {
    return JSON.stringify(this.manifest, null, 2);
  }

  /**
   * Get component definition by ID
   * @param {string} id - Component ID
   * @returns {Object|null} Component definition
   */
  getComponent(id) {
    return this.manifest.components.find(c => c.id === id) || null;
  }

  /**
   * Get components by category
   * @param {string} category - Category name
   * @returns {Array} Components in category
   */
  getComponentsByCategory(category) {
    return this.manifest.components.filter(c => 
      c.category === category
    );
  }

  /**
   * Get components by status
   * @param {string} status - Status filter
   * @returns {Array} Components with status
   */
  getComponentsByStatus(status) {
    return this.manifest.components.filter(c => c.status === status);
  }
}

// Singleton instance
const uiManifest = new UIManifest();
export default uiManifest;
