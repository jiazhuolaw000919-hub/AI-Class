// js/academy/curriculumModel.js
// Part 57.5 — Curriculum Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define academic structure — School → Program → Module → Lesson
// CONSUMES: SchoolRegistry, ProgramRegistry, AcademyRegistry

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumModel) {
        console.log('[CurriculumModel] Already exists, skipping...');
        return;
    }

    var CurriculumModel = {
        version: '1.0.0',

        // ============================================================
        // 1. HIERARCHY DEFINITIONS
        // ============================================================

        School: {
            required: ['id', 'name', 'description'],
            optional: ['icon', 'color', 'shortName', 'programs', 'status'],
            validate: function(data) {
                var errors = [];
                this.required.forEach(function(field) {
                    if (!data[field]) errors.push('School: ' + field + ' is required');
                });
                return { valid: errors.length === 0, errors: errors };
            }
        },

        Program: {
            required: ['id', 'schoolId', 'name', 'description'],
            optional: ['level', 'modules', 'status', 'duration'],
            validate: function(data) {
                var errors = [];
                this.required.forEach(function(field) {
                    if (!data[field]) errors.push('Program: ' + field + ' is required');
                });
                if (data.level && !['beginner', 'intermediate', 'advanced'].includes(data.level)) {
                    errors.push('Program: level must be beginner, intermediate, or advanced');
                }
                return { valid: errors.length === 0, errors: errors };
            }
        },

        Module: {
            required: ['id', 'programId', 'name'],
            optional: ['description', 'lessons', 'status', 'order'],
            validate: function(data) {
                var errors = [];
                this.required.forEach(function(field) {
                    if (!data[field]) errors.push('Module: ' + field + ' is required');
                });
                return { valid: errors.length === 0, errors: errors };
            }
        },

        Lesson: {
            required: ['id', 'moduleId', 'title'],
            optional: ['status', 'duration', 'content', 'resources'],
            validate: function(data) {
                var errors = [];
                this.required.forEach(function(field) {
                    if (!data[field]) errors.push('Lesson: ' + field + ' is required');
                });
                return { valid: errors.length === 0, errors: errors };
            }
        },

        // ============================================================
        // 2. HELPERS
        // ============================================================

        /**
         * 构建完整路径
         */
        buildPath: function(schoolId, programId, moduleId, lessonId) {
            var school = this.getSchool(schoolId);
            if (!school) return null;

            var program = null;
            var module = null;
            var lesson = null;

            if (programId) {
                program = this.getProgram(programId);
                if (programId && moduleId) {
                    module = this.getModule(moduleId);
                    if (moduleId && lessonId) {
                        lesson = this.getLesson(lessonId);
                    }
                }
            }

            return {
                school: school,
                program: program,
                module: module,
                lesson: lesson
            };
        },

        getSchool: function(schoolId) {
            var registry = window.LawAIApp?.SchoolRegistry;
            if (registry && typeof registry.getSchool === 'function') {
                return registry.getSchool(schoolId);
            }
            return null;
        },

        getProgram: function(programId) {
            var registry = window.LawAIApp?.ProgramRegistry;
            if (registry && typeof registry.getProgram === 'function') {
                return registry.getProgram(programId);
            }
            return null;
        },

        getModule: function(moduleId) {
            var registry = window.LawAIApp?.AcademyRegistry;
            if (registry && typeof registry.getModule === 'function') {
                return registry.getModule(moduleId);
            }
            return null;
        },

        getLesson: function(lessonId) {
            var registry = window.LawAIApp?.AcademyRegistry;
            if (registry && typeof registry.getLesson === 'function') {
                return registry.getLesson(lessonId);
            }
            return null;
        },

        /**
         * 获取完整的 Curriculum 树
         */
        getCurriculumTree: function() {
            var schools = window.LawAIApp?.SchoolRegistry?.getAllSchools?.() || [];
            var programs = window.LawAIApp?.ProgramRegistry?.getAllPrograms?.() || [];

            return {
                schools: schools.map(function(school) {
                    var schoolPrograms = programs.filter(function(p) {
                        return p.schoolId === school.id;
                    });
                    return {
                        ...school,
                        programs: schoolPrograms
                    };
                })
            };
        },

        /**
         * 获取 Curriculum 摘要
         */
        getSummary: function() {
            var schools = window.LawAIApp?.SchoolRegistry?.getAllSchools?.() || [];
            var programs = window.LawAIApp?.ProgramRegistry?.getAllPrograms?.() || [];

            return {
                totalSchools: schools.length,
                totalPrograms: programs.length,
                schools: schools.map(function(s) {
                    return {
                        id: s.id,
                        name: s.name,
                        programCount: programs.filter(function(p) { return p.schoolId === s.id; }).length
                    };
                })
            };
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CurriculumModel = CurriculumModel;

    console.log('[CurriculumModel] Module loaded (Part 57.5)');

})();
