// js/academy/courseModel.js
// Part 57.6 — Course Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define Course data structure
// USED BY: CourseRegistry, CourseSeed, ContentPipeline

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.CourseModel) {
    console.log('[CourseModel] Already exists, skipping...');
    return;
  }

  const CourseModel = {
    version: '1.0.0',

    /**
     * 创建 Course 对象
     * @param {Object} data
     * @returns {Object}
     */
    create: function(data) {
      return {
        id: data.id || 'course-' + Date.now(),
        programId: data.programId || '',
        schoolId: data.schoolId || '',
        title: data.title || 'Untitled Course',
        description: data.description || '',
        difficulty: data.difficulty || 'beginner',
        estimatedHours: data.estimatedHours || 0,
        modules: data.modules || [],
        status: data.status || 'draft',
        prerequisites: data.prerequisites || [],
        learningObjectives: data.learningObjectives || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      };
    },

    /**
     * 验证 Course 数据
     * @param {Object} data
     * @returns {Object} { valid, errors }
     */
    validate: function(data) {
      const errors = [];

      if (!data.id) errors.push('id is required');
      if (!data.title) errors.push('title is required');
      if (!data.programId) errors.push('programId is required');

      if (data.difficulty && !['beginner', 'intermediate', 'advanced'].includes(data.difficulty)) {
        errors.push('difficulty must be: beginner, intermediate, advanced');
      }

      if (data.status && !['active', 'inactive', 'draft', 'archived'].includes(data.status)) {
        errors.push('status must be: active, inactive, draft, archived');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    /**
     * 获取难度标签
     * @param {string} difficulty
     * @returns {string}
     */
    getDifficultyLabel: function(difficulty) {
      const labels = {
        beginner: '🟢 Beginner',
        intermediate: '🟡 Intermediate',
        advanced: '🔴 Advanced'
      };
      return labels[difficulty] || difficulty;
    },

    /**
     * 获取状态标签
     * @param {string} status
     * @returns {string}
     */
    getStatusLabel: function(status) {
      const labels = {
        active: '✅ Active',
        draft: '📝 Draft',
        archived: '📦 Archived'
      };
      return labels[status] || status;
    }
  };

  // ============================================================
  // Export
  // ============================================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.CourseModel = CourseModel;

  console.log('[CourseModel] Module loaded (Part 57.6)');

})();
