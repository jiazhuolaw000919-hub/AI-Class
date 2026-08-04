// js/academy/schoolRegistry.js
// Part 57.3 — School Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Manage Academy Schools.
//          Initial 8 Schools as defined in Part 57.2.

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.SchoolRegistry) {
    console.warn('[SchoolRegistry] Already exists, skipping...');
    return;
  }

  /**
   * SchoolRegistry
   * 
   * 管理 Academy 的 Schools：
   * - 8 个初始 Schools
   * - School CRUD
   * - School 状态管理
   * - 与 AcademyRegistry 集成
   */
  class SchoolRegistry {
    constructor() {
      this.version = '1.0.0';
      this.initialized = false;
      this._schools = new Map();
      
      // 默认 8 个 Schools
      this.DEFAULT_SCHOOLS = [
        {
          id: 'school-ai',
          name: 'School of Artificial Intelligence',
          description: 'Master AI technologies, from foundations to advanced applications',
          icon: '🤖',
          coverImage: '/images/schools/ai.jpg',
          difficulty: 'beginner',
          status: 'active',
          programs: []
        },
        {
          id: 'school-tech',
          name: 'School of Technology',
          description: 'Build the future with cutting-edge tech skills',
          icon: '⚡',
          coverImage: '/images/schools/tech.jpg',
          difficulty: 'beginner',
          status: 'active',
          programs: []
        },
        {
          id: 'school-automation',
          name: 'School of Automation',
          description: 'Automate workflows and build intelligent systems',
          icon: '🔧',
          coverImage: '/images/schools/automation.jpg',
          difficulty: 'intermediate',
          status: 'active',
          programs: []
        },
        {
          id: 'school-data',
          name: 'School of Data & Analytics',
          description: 'Turn data into decisions with analytics and insights',
          icon: '📊',
          coverImage: '/images/schools/data.jpg',
          difficulty: 'beginner',
          status: 'active',
          programs: []
        },
        {
          id: 'school-business',
          name: 'School of Business',
          description: 'Lead with business strategy and innovation',
          icon: '💼',
          coverImage: '/images/schools/business.jpg',
          difficulty: 'intermediate',
          status: 'active',
          programs: []
        },
        {
          id: 'school-creative',
          name: 'School of Creative Media',
          description: 'Create compelling content with media and design',
          icon: '🎨',
          coverImage: '/images/schools/creative.jpg',
          difficulty: 'beginner',
          status: 'active',
          programs: []
        },
        {
          id: 'school-growth',
          name: 'School of Personal Growth',
          description: 'Develop yourself and grow your potential',
          icon: '🌱',
          coverImage: '/images/schools/growth.jpg',
          difficulty: 'beginner',
          status: 'active',
          programs: []
        },
        {
          id: 'school-ai-engineering',
          name: 'School of AI Engineering',
          description: 'Build production-ready AI systems at scale',
          icon: '🏗️',
          coverImage: '/images/schools/ai-engineering.jpg',
          difficulty: 'advanced',
          status: 'active',
          programs: []
        }
      ];
    }

    // ============================================
    // Lifecycle
    // ============================================

    /**
     * 初始化 School Registry
     * 注册默认 8 个 Schools
     */
    initialize() {
      if (this.initialized) {
        console.warn('[SchoolRegistry] Already initialized');
        return this;
      }

      console.log('[SchoolRegistry] Initializing...');

      try {
        // 注册默认 Schools
        this.DEFAULT_SCHOOLS.forEach(school => {
          this.register(school);
        });

        this.initialized = true;
        console.log('[SchoolRegistry] ✅ Initialized with', this._schools.size, 'schools');
        
        // 同步到 AcademyRegistry
        this._syncToAcademyRegistry();

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
      if (!schoolData.id) {
        throw new Error('[SchoolRegistry] School: id is required');
      }
      if (!schoolData.name) {
        throw new Error('[SchoolRegistry] School: name is required');
      }

      if (this._schools.has(schoolData.id)) {
        console.warn('[SchoolRegistry] School already exists:', schoolData.id);
        return schoolData.id;
      }

      const school = {
        ...schoolData,
        registeredAt: new Date().toISOString(),
        status: schoolData.status || 'active',
        programs: schoolData.programs || []
      };

      this._schools.set(schoolData.id, school);
      console.log('[SchoolRegistry] School registered:', school.name);

      return school.id;
    }

    /**
     * 获取 School
     * @param {string} schoolId
     * @returns {Object|null}
     */
    get(schoolId) {
      return this._schools.get(schoolId) || null;
    }

    /**
     * 获取所有 Schools
     * @returns {Array}
     */
    getAll() {
      return Array.from(this._schools.values());
    }

    /**
     * 获取活跃 Schools
     * @returns {Array}
     */
    getActive() {
      return this.getAll().filter(s => s.status === 'active');
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
        timestamp: new Date().toISOString()
      };
    }

    /**
     * 获取统计信息
     * @returns {Object}
     */
    getStats() {
      return {
        totalSchools: this._schools.size,
        activeSchools: this.getActive().length,
        inactiveSchools: this.getAll().filter(s => s.status === 'inactive').length,
        schoolsByDifficulty: {
          beginner: this.filterByDifficulty('beginner').length,
          intermediate: this.filterByDifficulty('intermediate').length,
          advanced: this.filterByDifficulty('advanced').length
        }
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
  }

  // ============================================
  // Export
  // ============================================

  const schoolRegistry = new SchoolRegistry();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.SchoolRegistry = schoolRegistry;

  console.log('[SchoolRegistry] Module loaded (Part 57.3)');

})();
