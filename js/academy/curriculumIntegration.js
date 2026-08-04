// js/academy/curriculumIntegration.js
// Part 57.5 — Academy UI Integration
// Law AI Academy Developer Bible
//
// PURPOSE: Connect SchoolRegistry + ProgramRegistry → AcademyView
// DATA FLOW: SchoolRegistry ↓ ProgramRegistry ↓ AcademyView

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumIntegration) {
        console.log('[CurriculumIntegration] Already exists, skipping...');
        return;
    }

    var CurriculumIntegration = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化 Curriculum Integration
         */
        init: function() {
            if (this.initialized) {
                console.log('[CurriculumIntegration] Already initialized');
                return this;
            }

            console.log('[CurriculumIntegration] 🔗 Initializing...');

            this._bindEvents();
            this._connectToAcademyView();

            this.initialized = true;
            console.log('[CurriculumIntegration] ✅ Ready');
            return this;
        },

        /**
         * 获取完整的 Curriculum 数据 (供 AcademyView 使用)
         */
        getCurriculumData: function() {
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
                }),
                summary: {
                    totalSchools: schools.length,
                    totalPrograms: programs.length
                }
            };
        },

        /**
         * 刷新 AcademyView 数据
         */
        refreshAcademyView: function() {
            console.log('[CurriculumIntegration] Refreshing AcademyView...');

            var data = this.getCurriculumData();

            // 如果 AcademyView 存在，更新
            if (window.LawAIApp?.AcademyView && typeof window.LawAIApp.AcademyView.render === 'function') {
                window.LawAIApp.AcademyView.render({
                    schools: data.schools,
                    progress: window.LawAIApp?.ContinueLearning?.getProgress?.() || null
                });
            }

            // 如果 AcademyExperienceManager 存在，刷新
            if (window.LawAIApp?.AcademyExperienceManager && typeof window.LawAIApp.AcademyExperienceManager.refresh === 'function') {
                window.LawAIApp.AcademyExperienceManager.refresh();
            }

            return this;
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            // 监听 School 注册
            document.addEventListener('SCHOOL_REGISTERED', function() {
                console.log('[CurriculumIntegration] School registered, refreshing...');
                this.refreshAcademyView();
            }.bind(this));

            // 监听 Program 注册
            document.addEventListener('PROGRAM_REGISTERED', function() {
                console.log('[CurriculumIntegration] Program registered, refreshing...');
                this.refreshAcademyView();
            }.bind(this));

            // 监听 Curriculum 就绪
            document.addEventListener('CURRICULUM_READY', function() {
                console.log('[CurriculumIntegration] Curriculum ready, refreshing...');
                this.refreshAcademyView();
            }.bind(this));

            // 监听 Academy 就绪
            document.addEventListener('ACADEMY_READY', function() {
                console.log('[CurriculumIntegration] Academy ready, refreshing...');
                setTimeout(function() {
                    this.refreshAcademyView();
                }.bind(this), 300);
            }.bind(this));

            console.log('[CurriculumIntegration] Events bound');
        },

        /**
         * 连接到 AcademyView
         */
        _connectToAcademyView: function() {
            // 等待 AcademyView 就绪
            var attempts = 0;
            var maxAttempts = 20;

            var checkInterval = setInterval(function() {
                attempts++;
                if (window.LawAIApp?.AcademyView) {
                    clearInterval(checkInterval);
                    console.log('[CurriculumIntegration] ✅ AcademyView found, connecting...');
                    this.refreshAcademyView();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('[CurriculumIntegration] AcademyView not found after timeout');
                }
            }.bind(this), 300);
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CurriculumIntegration = CurriculumIntegration;

    console.log('[CurriculumIntegration] Module loaded (Part 57.5)');

    // 自动初始化
    function autoInit() {
        CurriculumIntegration.init();
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

})();
