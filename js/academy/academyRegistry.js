// js/academy/academyRegistry.js
// Part 57.3 — Academy Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Central registry for Schools, Programs, Modules, Lessons.
//          Connects existing engines through a unified registry.

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyRegistry) {
    console.warn('[AcademyRegistry] Already exists, skipping...');
    return;
  }

  /**
   * AcademyRegistry
   * 
   * 中央注册表，管理：
   * - Schools
   * - Programs
   * - Modules
   * - Lessons
   * 
   * 连接现有 Engine，不重写它们。
   */
  class AcademyRegistry {
    constructor() {
      this.version = '1.0.0';
      this.initialized = false;
      this.health = 'pending';
      
      // 注册表存储
      this._schools = new Map();
      this._programs = new Map();
      this._modules = new Map();
      this._lessons = new Map();
      this._missions = new Map();
      
      // 连接状态
      this._connections = {
        academyEngine: false,
        schoolEngine: false,
        curriculumEngine: false,
        lessonEngine: false,
        learningEngine: false,
        progressEngine: false
      };
      
      // 事件监听器
      this._listeners = new Map();
    }

    // ============================================
    // Lifecycle
    // ============================================

    /**
     * 初始化 Academy Registry
     * 连接现有 Engines
     */
    initialize() {
      if (this.initialized) {
        console.warn('[AcademyRegistry] Already initialized');
        return this;
      }

      console.log('[AcademyRegistry] Initializing...');

      try {
        // 1. 连接 Academy Engine
        if (window.LawAIApp && window.LawAIApp.Academy) {
          this._connections.academyEngine = true;
          console.log('[AcademyRegistry] ✅ Academy Engine connected');
        }

        // 2. 连接 School Engine
        if (window.LawAIApp && window.LawAIApp.SchoolEngine) {
          this._connections.schoolEngine = true;
          console.log('[AcademyRegistry] ✅ School Engine connected');
        }

        // 3. 连接 Curriculum Engine
        if (window.LawAIApp && window.LawAIApp.CurriculumFactory) {
          this._connections.curriculumEngine = true;
          console.log('[AcademyRegistry] ✅ Curriculum Engine connected');
        }

        // 4. 连接 Lesson Engine
        if (window.LawAIApp && window.LawAIApp.LessonEngine) {
          this._connections.lessonEngine = true;
          console.log('[AcademyRegistry] ✅ Lesson Engine connected');
        }

        // 5. 连接 Learning Engine
        if (window.LawAIApp && window.LawAIApp.LearningJourney) {
          this._connections.learningEngine = true;
          console.log('[AcademyRegistry] ✅ Learning Engine connected');
        }

        // 6. 连接 Progress Engine
        if (window.LawAIApp && window.LawAIApp.ProgressEngine) {
          this._connections.progressEngine = true;
          console.log('[AcademyRegistry] ✅ Progress Engine connected');
        }

        this.initialized = true;
        this.health = 'healthy';
        
        this._emit('initialized', {
          connections: this._connections,
          timestamp: new Date().toISOString()
        });

        console.log('[AcademyRegistry] ✅ Initialized successfully');
        this._logStatus();

      } catch (error) {
        this.health = 'unhealthy';
        console.error('[AcademyRegistry] Initialization failed:', error);
        this._emit('error', { error: error.message });
      }

      return this;
    }

    // ============================================
    // School Registry
    // ============================================

    /**
     * 注册 School
     * @param {Object} schoolData
     * @returns {string} schoolId
     */
    registerSchool(schoolData) {
      if (!schoolData.id) {
        throw new Error('[AcademyRegistry] School: id is required');
      }
      if (!schoolData.name) {
        throw new Error('[AcademyRegistry] School: name is required');
      }

      if (this._schools.has(schoolData.id)) {
        console.warn('[AcademyRegistry] School already exists:', schoolData.id);
        return schoolData.id;
      }

      const school = {
        ...schoolData,
        registeredAt: new Date().toISOString(),
        status: schoolData.status || 'active'
      };

      this._schools.set(schoolData.id, school);
      
      this._emit('schoolRegistered', { 
        schoolId: school.id, 
        name: school.name 
      });

      console.log('[AcademyRegistry] School registered:', school.name);
      return school.id;
    }

    /**
     * 获取 School
     * @param {string} schoolId
     * @returns {Object|null}
     */
    getSchool(schoolId) {
      return this._schools.get(schoolId) || null;
    }

    /**
     * 获取所有 Schools
     * @returns {Array}
     */
    getAllSchools() {
      return Array.from(this._schools.values());
    }

    /**
     * 获取活跃 Schools
     * @returns {Array}
     */
    getActiveSchools() {
      return this.getAllSchools().filter(s => s.status === 'active');
    }

    // ============================================
    // Program Registry
    // ============================================

    /**
     * 注册 Program
     * @param {Object} programData
     * @returns {string} programId
     */
    registerProgram(programData) {
      if (!programData.id) {
        throw new Error('[AcademyRegistry] Program: id is required');
      }
      if (!programData.name) {
        throw new Error('[AcademyRegistry] Program: name is required');
      }
      if (!programData.schoolId) {
        throw new Error('[AcademyRegistry] Program: schoolId is required');
      }

      // 验证 School 存在
      if (!this._schools.has(programData.schoolId)) {
        throw new Error(`[AcademyRegistry] School not found: ${programData.schoolId}`);
      }

      if (this._programs.has(programData.id)) {
        console.warn('[AcademyRegistry] Program already exists:', programData.id);
        return programData.id;
      }

      const program = {
        ...programData,
        registeredAt: new Date().toISOString(),
        status: programData.status || 'active'
      };

      this._programs.set(programData.id, program);

      // 关联到 School
      const school = this._schools.get(programData.schoolId);
      if (!school.programs) {
        school.programs = [];
      }
      if (!school.programs.includes(programData.id)) {
        school.programs.push(programData.id);
      }

      this._emit('programRegistered', {
        programId: program.id,
        name: program.name,
        schoolId: program.schoolId
      });

      console.log('[AcademyRegistry] Program registered:', program.name);
      return program.id;
    }

    /**
     * 获取 Program
     * @param {string} programId
     * @returns {Object|null}
     */
    getProgram(programId) {
      return this._programs.get(programId) || null;
    }

    /**
     * 获取 School 的所有 Programs
     * @param {string} schoolId
     * @returns {Array}
     */
    getProgramsBySchool(schoolId) {
      return this.getAllPrograms().filter(p => p.schoolId === schoolId);
    }

    /**
     * 获取所有 Programs
     * @returns {Array}
     */
    getAllPrograms() {
      return Array.from(this._programs.values());
    }

    /**
     * 从 Legacy Course 迁移到 Program
     * @param {Object} courseData — 来自 course.js
     * @param {string} schoolId — 目标 School
     * @returns {string} programId
     */
    migrateCourseToProgram(courseData, schoolId) {
      const programData = {
        id: courseData.id || `program-${Date.now()}`,
        name: courseData.name || courseData.title || 'Migrated Program',
        description: courseData.description || '',
        schoolId: schoolId || courseData.schoolId || 'school-ai',
        difficulty: courseData.difficulty || 'beginner',
        duration: courseData.duration || 0,
        requiredSkills: courseData.requiredSkills || [],
        learningObjectives: courseData.learningObjectives || [],
        modules: courseData.modules || [],
        status: 'active',
        migratedFrom: 'course',
        originalId: courseData.id
      };

      return this.registerProgram(programData);
    }

    // ============================================
    // Module Registry
    // ============================================

    /**
     * 注册 Module
     * @param {Object} moduleData
     * @returns {string} moduleId
     */
    registerModule(moduleData) {
      if (!moduleData.id) {
        throw new Error('[AcademyRegistry] Module: id is required');
      }
      if (!moduleData.name) {
        throw new Error('[AcademyRegistry] Module: name is required');
      }
      if (!moduleData.programId) {
        throw new Error('[AcademyRegistry] Module: programId is required');
      }

      if (!this._programs.has(moduleData.programId)) {
        throw new Error(`[AcademyRegistry] Program not found: ${moduleData.programId}`);
      }

      if (this._modules.has(moduleData.id)) {
        console.warn('[AcademyRegistry] Module already exists:', moduleData.id);
        return moduleData.id;
      }

      const module = {
        ...moduleData,
        registeredAt: new Date().toISOString(),
        status: moduleData.status || 'active'
      };

      this._modules.set(moduleData.id, module);

      // 关联到 Program
      const program = this._programs.get(moduleData.programId);
      if (!program.modules) {
        program.modules = [];
      }
      if (!program.modules.includes(moduleData.id)) {
        program.modules.push(moduleData.id);
      }

      this._emit('moduleRegistered', {
        moduleId: module.id,
        name: module.name,
        programId: module.programId
      });

      console.log('[AcademyRegistry] Module registered:', module.name);
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
     * 获取 Program 的所有 Modules
     * @param {string} programId
     * @returns {Array}
     */
    getModulesByProgram(programId) {
      return this.getAllModules().filter(m => m.programId === programId);
    }

    /**
     * 获取所有 Modules
     * @returns {Array}
     */
    getAllModules() {
      return Array.from(this._modules.values());
    }

    // ============================================
    // Lesson Registry
    // ============================================

    /**
     * 注册 Lesson
     * @param {Object} lessonData
     * @returns {string} lessonId
     */
    registerLesson(lessonData) {
      if (!lessonData.id) {
        throw new Error('[AcademyRegistry] Lesson: id is required');
      }
      if (!lessonData.title) {
        throw new Error('[AcademyRegistry] Lesson: title is required');
      }
      if (!lessonData.moduleId) {
        throw new Error('[AcademyRegistry] Lesson: moduleId is required');
      }

      if (!this._modules.has(lessonData.moduleId)) {
        throw new Error(`[AcademyRegistry] Module not found: ${lessonData.moduleId}`);
      }

      if (this._lessons.has(lessonData.id)) {
        console.warn('[AcademyRegistry] Lesson already exists:', lessonData.id);
        return lessonData.id;
      }

      const lesson = {
        ...lessonData,
        registeredAt: new Date().toISOString(),
        status: lessonData.status || 'active'
      };

      this._lessons.set(lessonData.id, lesson);

      // 关联到 Module
      const module = this._modules.get(lessonData.moduleId);
      if (!module.lessons) {
        module.lessons = [];
      }
      if (!module.lessons.includes(lessonData.id)) {
        module.lessons.push(lessonData.id);
      }

      this._emit('lessonRegistered', {
        lessonId: lesson.id,
        title: lesson.title,
        moduleId: lesson.moduleId
      });

      console.log('[AcademyRegistry] Lesson registered:', lesson.title);
      return lesson.id;
    }

    /**
     * 获取 Lesson
     * @param {string} lessonId
     * @returns {Object|null}
     */
    getLesson(lessonId) {
      return this._lessons.get(lessonId) || null;
    }

    /**
     * 获取 Module 的所有 Lessons
     * @param {string} moduleId
     * @returns {Array}
     */
    getLessonsByModule(moduleId) {
      return this.getAllLessons().filter(l => l.moduleId === moduleId);
    }

    /**
     * 获取所有 Lessons
     * @returns {Array}
     */
    getAllLessons() {
      return Array.from(this._lessons.values());
    }

    // ============================================
    // Mission Registry (Lightweight)
    // ============================================

    /**
     * 注册 Mission
     * @param {Object} missionData
     * @returns {string} missionId
     */
    registerMission(missionData) {
      if (!missionData.id) {
        throw new Error('[AcademyRegistry] Mission: id is required');
      }
      if (!missionData.type) {
        throw new Error('[AcademyRegistry] Mission: type is required');
      }

      if (this._missions.has(missionData.id)) {
        console.warn('[AcademyRegistry] Mission already exists:', missionData.id);
        return missionData.id;
      }

      const mission = {
        ...missionData,
        registeredAt: new Date().toISOString(),
        status: missionData.status || 'active'
      };

      this._missions.set(missionData.id, mission);

      // 关联到 Lesson（如果有）
      if (missionData.lessonId) {
        const lesson = this._lessons.get(missionData.lessonId);
        if (lesson) {
          if (!lesson.missions) {
            lesson.missions = [];
          }
          if (!lesson.missions.includes(missionData.id)) {
            lesson.missions.push(missionData.id);
          }
        }
      }

      console.log('[AcademyRegistry] Mission registered:', missionData.type, '→', missionData.id);
      return mission.id;
    }

    /**
     * 获取 Mission
     * @param {string} missionId
     * @returns {Object|null}
     */
    getMission(missionId) {
      return this._missions.get(missionId) || null;
    }

    /**
     * 获取 Lesson 的所有 Missions
     * @param {string} lessonId
     * @returns {Array}
     */
    getMissionsByLesson(lessonId) {
      return this.getAllMissions().filter(m => m.lessonId === lessonId);
    }

    /**
     * 获取所有 Missions
     * @returns {Array}
     */
    getAllMissions() {
      return Array.from(this._missions.values());
    }

    // ============================================
    // Discovery & Query
    // ============================================

    /**
     * 发现 Curriculum
     * @param {Object} filters
     * @returns {Array}
     */
    discoverCurriculum(filters = {}) {
      let results = this.getAllPrograms();

      if (filters.schoolId) {
        results = results.filter(p => p.schoolId === filters.schoolId);
      }

      if (filters.difficulty) {
        results = results.filter(p => p.difficulty === filters.difficulty);
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword)
        );
      }

      if (filters.status) {
        results = results.filter(p => p.status === filters.status);
      }

      return results;
    }

    /**
     * 获取完整学习路径
     * @param {string} programId
     * @returns {Object|null}
     */
    getLearningPath(programId) {
      const program = this.getProgram(programId);
      if (!program) return null;

      const modules = this.getModulesByProgram(programId);
      const enrichedModules = modules.map(module => {
        const lessons = this.getLessonsByModule(module.id);
        const enrichedLessons = lessons.map(lesson => {
          const missions = this.getMissionsByLesson(lesson.id);
          return { ...lesson, missions };
        });
        return { ...module, lessons: enrichedLessons };
      });

      return {
        ...program,
        modules: enrichedModules
      };
    }

    // ============================================
    // Runtime OS Integration
    // ============================================

    /**
     * 获取学习进度（从 Runtime OS）
     * @param {string} userId
     * @param {string} programId
     * @returns {Object}
     */
    getLearningProgress(userId, programId) {
      if (window.LawAIApp && window.LawAIApp.StateRegistry) {
        const stateKey = `academy.progress.${userId}.${programId}`;
        const state = window.LawAIApp.StateRegistry.get(stateKey);
        if (state) {
          return state.value;
        }
      }

      // 尝试从 Legacy ProgressEngine 获取
      if (window.LawAIApp && window.LawAIApp.ProgressEngine) {
        try {
          const legacyProgress = window.LawAIApp.ProgressEngine.getProgress(userId, programId);
          if (legacyProgress) {
            return legacyProgress;
          }
        } catch (e) {
          // 忽略
        }
      }

      return {
        userId,
        programId,
        completedModules: [],
        completedLessons: [],
        completedMissions: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    /**
     * 更新学习进度（同步到 Runtime OS）
     * @param {string} userId
     * @param {string} programId
     * @param {Object} progressData
     * @returns {Object}
     */
    updateLearningProgress(userId, programId, progressData) {
      const stateKey = `academy.progress.${userId}.${programId}`;
      
      if (window.LawAIApp && window.LawAIApp.StateRegistry) {
        const existing = window.LawAIApp.StateRegistry.get(stateKey);
        const updated = {
          ...existing?.value,
          ...progressData,
          lastUpdated: new Date().toISOString()
        };

        // 计算整体进度
        const program = this.getProgram(programId);
        if (program && program.modules) {
          const totalModules = program.modules.length;
          const completed = updated.completedModules?.length || 0;
          updated.overallProgress = totalModules > 0 
            ? Math.round((completed / totalModules) * 100) 
            : 0;
        }

        window.LawAIApp.StateRegistry.set(stateKey, updated);
        this._emit('learningStateUpdated', {
          userId,
          programId,
          progress: updated
        });

        return updated;
      }

      return progressData;
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
        status: this.health,
        version: this.version,
        initialized: this.initialized,
        connections: this._connections,
        stats: this.getStats(),
        timestamp: new Date().toISOString()
      };
    }

    /**
     * 获取统计信息
     * @returns {Object}
     */
    getStats() {
      return {
        schools: this._schools.size,
        programs: this._programs.size,
        modules: this._modules.size,
        lessons: this._lessons.size,
        missions: this._missions.size,
        activeSchools: this.getActiveSchools().length,
        connections: this._connections
      };
    }

    /**
     * 检查是否就绪
     * @returns {boolean}
     */
    isReady() {
      return this.initialized && this.health === 'healthy';
    }

    // ============================================
    // Event System
    // ============================================

    on(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, []);
      }
      this._listeners.get(event).push(callback);
      return this;
    }

    off(event, callback) {
      if (this._listeners.has(event)) {
        const listeners = this._listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
      return this;
    }

    _emit(event, data) {
      if (this._listeners.has(event)) {
        this._listeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('[AcademyRegistry] Event callback error:', error);
          }
        });
      }

      // 也通过全局 EventBus 发送
      if (window.LawAIApp && window.LawAIApp.EventBus) {
        window.LawAIApp.EventBus.emit(`academy:${event.toLowerCase()}`, data);
      }
    }

    // ============================================
    // Private Helpers
    // ============================================

    _logStatus() {
      console.log('[AcademyRegistry] ─── Status ───');
      console.log('[AcademyRegistry] Connections:', this._connections);
      console.log('[AcademyRegistry] Stats:', this.getStats());
      console.log('[AcademyRegistry] Health:', this.health);
    }
  }

  // ============================================
  // Export
  // ============================================

  const academyRegistry = new AcademyRegistry();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.AcademyRegistry = academyRegistry;

  console.log('[AcademyRegistry] Module loaded (Part 57.3)');

})();
