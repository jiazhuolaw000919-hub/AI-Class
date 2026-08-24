// js/academy/schoolRegistry.js
// Part 57.5 — School Registry (Upgrade)
// Law AI Academy Developer Bible
//
// PURPOSE: Manage Academy Schools with university-style structure
//          Initial 3 Schools as defined in Part 57.5 Chapter 5
//          REUSES: existing SchoolRegistry, extends if needed

(function() {
  'use strict';

  // 如果已经存在并且已经升级，跳过
  if (window.LawAIApp && window.LawAIApp.SchoolRegistry && window.LawAIApp.SchoolRegistry._upgraded) {
    console.log('[SchoolRegistry] Already upgraded, skipping...');
    return;
  }

  /**
   * SchoolRegistry
   * 
   * 管理 Academy 的 Schools：
   * - 3 个初始 Schools (Part 57.5)
   * - School CRUD
   * - School 状态管理
   * - 与 AcademyRegistry 集成
   */
  class SchoolRegistry {
    constructor() {
      this.version = '2.0.0';
      this._upgraded = true;
      this.initialized = false;
      this._schools = new Map();
      
      // Part 57.5 Chapter 5 — 3 个 Schools
      this.DEFAULT_SCHOOLS = [
        {
            id: 'school-science',
            name: 'Science',
            displayName: 'Science',
            description: 'AI, Programming, Data Science, Mathematics, Technology, and Engineering.',
            icon: '🔬',
            color: '#3b82f6'
        },
        {
            id: 'school-business',
            name: 'Business',
            displayName: 'Business',
            description: 'Business, Finance, Marketing, Entrepreneurship, Management, and Career.',
            icon: '📊',
            color: '#10b981'
        },
        {
            id: 'school-art',
            name: 'Art',
            displayName: 'Art',
            description: 'Design, UI/UX, Photography, Video, Creative Writing, and Digital Art.',
            icon: '🎨',
            color: '#8b5cf6'
        }
      ];
    }

    // ============================================
    // Lifecycle
    // ============================================

    /**
     * 初始化 School Registry
     * 注册默认 3 个 Schools (Part 57.5)
     */
    initialize() {
      if (this.initialized) {
        console.log('[SchoolRegistry] Already initialized');
        return this;
      }

      console.log('[SchoolRegistry] 🏛️ Initializing...');

      try {
        // 注册默认 Schools
        this.DEFAULT_SCHOOLS.forEach(school => {
          this.register(school);
        });

        this.initialized = true;
        console.log('[SchoolRegistry] ✅ Initialized with', this._schools.size, 'schools');
        
        // 同步到 AcademyRegistry
        this._syncToAcademyRegistry();

        // 广播事件
        this._emit('SCHOOL_REGISTRY_READY', {
          schools: this.getAll(),
          count: this._schools.size
        });

      } catch (error) {
        console.error('[SchoolRegistry] Initialization failed:', error);
      }

      return this;
    }

    // ============================================
    // School CRUD
    // ============================================

    /**
     * 注册 School
     * @param {Object} schoolData
     * @returns {string} schoolId
     */
    register(schoolData) {
      // 验证
      const validation = this.validate(schoolData);
      if (!validation.valid) {
        console.warn('[SchoolRegistry] Validation failed:', validation.errors);
        return null;
      }

      if (this._schools.has(schoolData.id)) {
        console.warn('[SchoolRegistry] School already exists:', schoolData.id);
        return schoolData.id;
      }

      const school = {
        ...schoolData,
        registeredAt: new Date().toISOString(),
        createdAt: schoolData.createdAt || new Date().toISOString(),
        status: schoolData.status || 'active',
        programs: schoolData.programs || []
      };

      this._schools.set(schoolData.id, school);
      
      this._emit('SCHOOL_REGISTERED', {
        schoolId: school.id,
        name: school.name
      });

      console.log('[SchoolRegistry] ✅ Registered:', school.name);
      return school.id;
    }

    /**
     * 获取 School (别名: get)
     * @param {string} schoolId
     * @returns {Object|null}
     */
    getSchool(schoolId) {
      return this._schools.get(schoolId) || null;
    }

    /**
     * 获取 School (别名)
     * @param {string} schoolId
     * @returns {Object|null}
     */
    get(schoolId) {
      return this.getSchool(schoolId);
    }

    /**
     * 获取所有 Schools (别名: getAll)
     * @returns {Array}
     */
    getAllSchools() {
      return Array.from(this._schools.values());
    }

    /**
     * 获取所有 Schools (别名)
     * @returns {Array}
     */
    getAll() {
      return this.getAllSchools();
    }

    /**
     * 获取活跃 Schools
     * @returns {Array}
     */
    getActiveSchools() {
      return this.getAllSchools().filter(s => s.status === 'active');
    }

    /**
     * 获取活跃 Schools (别名)
     * @returns {Array}
     */
    getActive() {
      return this.getActiveSchools();
    }

    /**
     * 验证学校数据
     * @param {Object} data
     * @returns {Object} { valid, errors }
     */
    validate(data) {
      const errors = [];

      if (!data.id) errors.push('id is required');
      if (!data.name) errors.push('name is required');
      if (data.status && !['active', 'inactive', 'archived'].includes(data.status)) {
        errors.push('status must be: active, inactive, archived');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    }

    /**
     * 更新 School
     * @param {string} schoolId
     * @param {Object} updates
     * @returns {Object|null}
     */
    update(schoolId, updates) {
      const school = this._schools.get(schoolId);
      if (!school) {
        console.warn('[SchoolRegistry] School not found:', schoolId);
        return null;
      }

      const updated = {
        ...school,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this._schools.set(schoolId, updated);
      return updated;
    }

    /**
     * 删除 School
     * @param {string} schoolId
     * @returns {boolean}
     */
    delete(schoolId) {
      if (!this._schools.has(schoolId)) {
        console.warn('[SchoolRegistry] School not found:', schoolId);
        return false;
      }

      this._schools.delete(schoolId);
      console.log('[SchoolRegistry] School deleted:', schoolId);
      return true;
    }

    /**
     * 获取 School 的 Programs
     * @param {string} schoolId
     * @returns {Array}
     */
    getPrograms(schoolId) {
      const school = this._schools.get(schoolId);
      if (!school) return [];

      return school.programs || [];
    }

    /**
     * 添加 Program 到 School
     * @param {string} schoolId
     * @param {string} programId
     * @returns {boolean}
     */
    addProgram(schoolId, programId) {
      const school = this._schools.get(schoolId);
      if (!school) {
        console.warn('[SchoolRegistry] School not found:', schoolId);
        return false;
      }

      if (!school.programs) {
        school.programs = [];
      }

      if (!school.programs.includes(programId)) {
        school.programs.push(programId);
        return true;
      }

      return false;
    }

    // ============================================
    // Search & Discovery
    // ============================================

    /**
     * 搜索 Schools
     * @param {string} keyword
     * @returns {Array}
     */
    search(keyword) {
      if (!keyword) return this.getAll();
      
      const lower = keyword.toLowerCase();
      return this.getAll().filter(school =>
        school.name.toLowerCase().includes(lower) ||
        school.description.toLowerCase().includes(lower)
      );
    }

    /**
     * 按难度筛选
     * @param {string} difficulty
     * @returns {Array}
     */
    filterByDifficulty(difficulty) {
      return this.getAll().filter(s => s.difficulty === difficulty);
    }

    // ============================================
    // Integration
    // ============================================

    /**
     * 同步到 AcademyRegistry
     * @private
     */
    _syncToAcademyRegistry() {
      const academyRegistry = window.LawAIApp?.AcademyRegistry;
      if (!academyRegistry) {
        console.warn('[SchoolRegistry] AcademyRegistry not available, sync deferred');
        return;
      }

      // 确保 AcademyRegistry 已初始化
      if (!academyRegistry.initialized) {
        academyRegistry.initialize();
      }

      // 同步 Schools
      this.getAll().forEach(school => {
        try {
          academyRegistry.registerSchool(school);
        } catch (error) {
          console.warn('[SchoolRegistry] Sync failed for:', school.id, error);
        }
      });

      console.log('[SchoolRegistry] ✅ Synced', this._schools.size, 'schools to AcademyRegistry');
    }

    /**
     * 从 AcademyRegistry 加载 Schools
     */
    loadFromAcademyRegistry() {
      const academyRegistry = window.LawAIApp?.AcademyRegistry;
      if (!academyRegistry) {
        console.warn('[SchoolRegistry] AcademyRegistry not available');
        return;
      }

      const schools = academyRegistry.getAllSchools();
      schools.forEach(school => {
        this.register(school);
      });

      console.log('[SchoolRegistry] Loaded', this._schools.size, 'schools from AcademyRegistry');
    }

    // ============================================
    // Health & Status
    // ============================================

    /**
     * 健康检查
     * @returns {Object}
     */
    healthCheck() {
      return {
        status: this.initialized ? 'healthy' : 'pending',
        version: this.version,
        initialized: this.initialized,
        totalSchools: this._schools.size,
        activeSchools: this.getActive().length,
        defaultSchools: this.DEFAULT_SCHOOLS.length,
        upgraded: this._upgraded,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * 获取统计信息
     * @returns {Object}
     */
    getStats() {
      const schools = this.getAll();
      return {
        totalSchools: schools.length,
        activeSchools: this.getActive().length,
        inactiveSchools: schools.filter(s => s.status === 'inactive').length,
        schools: schools.map(s => ({
          id: s.id,
          name: s.name,
          programCount: s.programs?.length || 0,
          status: s.status
        }))
      };
    }

    /**
     * 获取状态
     * @returns {Object}
     */
    getStatus() {
      return {
        initialized: this.initialized,
        version: this.version,
        upgraded: this._upgraded,
        schoolCount: this._schools.size
      };
    }

    /**
     * 重置 Registry
     */
    reset() {
      this._schools.clear();
      this.initialized = false;
      console.log('[SchoolRegistry] Reset');
      return this;
    }

    // ============================================
    // Private — Event Helpers
    // ============================================

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

  // ============================================
  // Export
  // ============================================

  const schoolRegistry = new SchoolRegistry();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  // 如果已存在，合并升级而不是覆盖
  if (window.LawAIApp.SchoolRegistry) {
    console.log('[SchoolRegistry] Merging with existing...');
    const existing = window.LawAIApp.SchoolRegistry;
    
    // 复制新方法
    Object.keys(schoolRegistry).forEach(function(key) {
      if (typeof schoolRegistry[key] === 'function' && !existing[key]) {
        existing[key] = schoolRegistry[key].bind(schoolRegistry);
      }
    });
    
    // 标记升级
    existing._upgraded = true;
    existing.version = '2.0.0';
    
    // 添加默认学校（如果不存在）
    schoolRegistry.DEFAULT_SCHOOLS.forEach(function(s) {
      if (!existing._schools || !existing._schools.has(s.id)) {
        if (!existing._schools) existing._schools = new Map();
        existing._schools.set(s.id, { ...s });
      }
    });
    
    // 确保 initialized
    if (!existing.initialized) {
      existing.initialized = true;
    }
    
    console.log('[SchoolRegistry] ✅ Merged with existing');
  } else {
    window.LawAIApp.SchoolRegistry = schoolRegistry;
    console.log('[SchoolRegistry] ✅ New instance created');
  }

  console.log('[SchoolRegistry] Module loaded (Part 57.5)');

  // ============================================
  // Auto-Initialize
  // ============================================

  function autoInit() {
    const reg = window.LawAIApp.SchoolRegistry;
    if (!reg.initialized) {
      reg.initialize();
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 100);
    });
  }

})();
