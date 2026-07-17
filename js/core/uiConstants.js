/**
 * UI Constants
 * 
 * Central store for UI-related constants.
 * Avoid magic strings.
 */

export const UI_COMPONENT_CATEGORIES = {
  BUTTON: 'Button',
  CARD: 'Card',
  MODAL: 'Modal',
  DIALOG: 'Dialog',
  TOAST: 'Toast',
  PROGRESS_BAR: 'ProgressBar',
  SIDEBAR: 'Sidebar',
  HEADER: 'Header',
  FOOTER: 'Footer',
  WIDGET: 'Widget',
  PANEL: 'Panel',
  TOOLTIP: 'Tooltip',
  BADGE: 'Badge',
  AVATAR: 'Avatar',
  ICON: 'Icon',
  ALERT: 'Alert',
  LOADER: 'Loader',
  TAB: 'Tab',
  INPUT: 'Input',
  DROPDOWN: 'Dropdown',
  SWITCH: 'Switch',
  CHART: 'Chart',
  TABLE: 'Table',
  LIST: 'List',
  FORM: 'Form',
  CHECKBOX: 'Checkbox',
  RADIO: 'Radio',
  SELECT: 'Select',
  SLIDER: 'Slider',
  TOGGLE: 'Toggle'
};

export const UI_COMPONENT_STATUS = {
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  EXPERIMENTAL: 'experimental',
  ARCHIVED: 'archived'
};

export const UI_LAYOUT_TYPES = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  FULLSCREEN: 'fullscreen',
  SPLIT: 'split',
  GRID: 'grid',
  FLEX: 'flex'
};

export const UI_WIDGET_TYPES = {
  STATS: 'stats',
  PROGRESS: 'progress',
  CHART: 'chart',
  CALENDAR: 'calendar',
  NOTES: 'notes',
  PROFILE: 'profile',
  ACTIVITY: 'activity',
  QUICK_ACCESS: 'quick_access'
};

export const UI_ANIMATION_TYPES = {
  FADE: 'fade',
  SLIDE: 'slide',
  SCALE: 'scale',
  BOUNCE: 'bounce',
  PULSE: 'pulse',
  SPIN: 'spin',
  FLIP: 'flip'
};

export const RESERVED_COMPONENT_IDS = [
  'ui_card',
  'ui_button',
  'ui_modal',
  'ui_dialog',
  'ui_toast',
  'ui_progress_bar',
  'ui_sidebar',
  'ui_header',
  'ui_footer',
  'ui_widget',
  'ui_panel',
  'ui_tooltip',
  'ui_badge',
  'ui_avatar',
  'ui_icon',
  'ui_alert',
  'ui_loader',
  'ui_tab',
  'ui_input',
  'ui_dropdown',
  'ui_switch',
  'ui_chart',
  'ui_table',
  'ui_list'
];

export const RESERVED_LAYOUT_NAMES = [
  'dashboard',
  'learning',
  'academy',
  'calendar',
  'notes',
  'settings',
  'workspace',
  'profile'
];

/**
 * Check if a component ID is reserved
 * @param {string} id - Component ID
 * @returns {boolean}
 */
export function isReservedComponent(id) {
  return RESERVED_COMPONENT_IDS.includes(id);
}

/**
 * Check if a status is valid
 * @param {string} status - Status value
 * @returns {boolean}
 */
export function isValidComponentStatus(status) {
  return Object.values(UI_COMPONENT_STATUS).includes(status);
}

/**
 * Check if a category is valid
 * @param {string} category - Category value
 * @returns {boolean}
 */
export function isValidComponentCategory(category) {
  return Object.values(UI_COMPONENT_CATEGORIES).includes(category);
}

/**
 * Get all component categories as array
 * @returns {Array} Array of category names
 */
export function getAllCategories() {
  return Object.values(UI_COMPONENT_CATEGORIES);
}

/**
 * Get all statuses as array
 * @returns {Array} Array of status names
 */
export function getAllStatuses() {
  return Object.values(UI_COMPONENT_STATUS);
}
