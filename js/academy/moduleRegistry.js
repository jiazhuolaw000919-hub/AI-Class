// js/academy/moduleRegistry.js
// Part 57.6 — Module Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Manage course modules
// CONNECTS: Courses → Modules → Lessons

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.ModuleRegistry) {
    console.log('[ModuleRegistry] Already exists, skipping...');
    return;
  }

  class ModuleRegistry {
    constructor() {
      this.version = '1.0.0';
      this._modules = new Map();
      this._initialized = false;
    }

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    initialize() {
      if (this._initialized) {
        console.log('[ModuleRegistry] Already initialized');
        return this;
      }

      console.log('[ModuleRegistry] 📦 Initializing...');
      this._initialized = true;

      this._emit('MODULE_REGISTRY_READY', {
        count: this._modules.size
      });

      console.log('[ModuleRegistry] ✅ Initialized');
      return this;
    }

    /**
     * 注册 Module
     * @param {Object} moduleData
     * @returns {string} moduleId
     */
    registerModule(moduleData) {
      const validation = this.validate(moduleData);
      if (!validation.valid) {
        console.warn('[ModuleRegistry] Validation failed:', validation.errors);
        return null;
      }

      if (this._modules.has(moduleData.id)) {
        console.warn('[ModuleRegistry] Module already exists:', moduleData.id);
        return moduleData.id;
      }

      // 验证 Course 存在
      const courseRegistry = window.LawAIApp?.CourseRegistry;
      if (courseRegistry && moduleData.courseId) {
        const course = courseRegistry.getCourse(moduleData.courseId);
        if (!course) {
          console.warn('[ModuleRegistry] Course not found:', moduleData.courseId);
        } else {
          if (!course.modules) course.modules = [];
          if (!course.modules.includes(moduleData.id)) {
            course.modules.push(moduleData.id);
          }
        }
      }

      const module = {
        ...moduleData,
        createdAt: moduleData.createdAt || new Date().toISOString(),
        status: moduleData.status || 'active',
        lessons: moduleData.lessons || []
      };

      this._modules.set(moduleData.id, module);

      this._emit('MODULE_REGISTERED', {
        moduleId: module.id,
        title: module.title,
        courseId: module.courseId
      });

      console.log('[ModuleRegistry] ✅ Registered:', module.title);
      return module.id;
    }

    /**
     * 获取 Module
     * @param {string} moduleId
     * @returns {Object|null}
     */
    getModule(moduleId) {
      return this._modules.get(moduleId) || null;
    }

    /**
     * 获取 Course 的所有 Modules
     * @param {string} courseId
     * @returns {Array}
     */
    getModulesByCourse(courseId) {
      return this.getAllModules().filter(function(m) {
        return m.courseId === courseId;
      });
    }

    /**
     * 获取所有 Modules
     * @returns {Array}
     */
    getAllModules() {
      return Array.from(this._modules.values());
    }

    /**
     * 获取活跃 Modules
     * @returns {Array}
     */
    getActiveModules() {
      return this.getAllModules().filter(function(m) {
        return m.status === 'active';
      });
    }

    /**
     * 验证 Module 数据
     * @param {Object} data
     * @returns {Object} { valid, errors }
     */
    validate(data) {
      const errors = [];

      if (!data.id) errors.push('id is required');
      if (!data.title) errors.push('title is required');
      if (!data.courseId) errors.push('courseId is required');

      if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
        errors.push('status must be: active, inactive, draft');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    }

    /**
     * 更新 Module
     * @param {string} moduleId
     * @param {Object} updates
     * @returns {Object|null}
     */
    update(moduleId, updates) {
      const module = this._modules.get(moduleId);
      if (!module) {
        console.warn('[ModuleRegistry] Module not found:', moduleId);
        return null;
      }

      const updated = {
        ...module,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this._modules.set(moduleId, updated);
      return updated;
    }

    /**
     * 获取统计
     * @returns {Object}
     */
    getStats() {
      const modules = this.getAllModules();
      return {
        totalModules: modules.length,
        activeModules: this.getActiveModules().length
      };
    }

    /**
     * 获取状态
     * @returns {Object}
     */
    getStatus() {
      return {
        initialized: this._initialized,
        version: this.version,
        moduleCount: this._modules.size
      };
    }

    // ============================================================
    // 2. PRIVATE — Event Helpers
    // ============================================================

    _emit(eventName, data) {
      try {
        const event = new CustomEvent(eventName, { detail: data || {} });
        document.dispatchEvent(event);
        window.dispatchEvent(event);

        if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
          window.LawAIApp.EventBus.emit(eventName, data);
        }
      } catch (err) {
        // 忽略
      }
    }
  }

  // ============================================================
  // Export
  // ============================================================

  const moduleRegistry = new ModuleRegistry();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.ModuleRegistry = moduleRegistry;

  console.log('[ModuleRegistry] Module loaded (Part 57.6)');

  // 自动初始化
  function autoInit() {
    if (!moduleRegistry._initialized) {
      moduleRegistry.initialize();
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 200);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 200);
    });
  }

})();
