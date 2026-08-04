// js/academy/schoolExplorer.js
// Part 57.4 — School Explorer
// Law AI Academy Developer Bible
//
// PURPOSE: Explore and display Academy Schools
// CONSUMES: SchoolRegistry (does NOT duplicate)

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.SchoolExplorer) {
        console.warn('[SchoolExplorer] Already exists, skipping...');
        return;
    }

    const SchoolExplorer = {
        version: '1.0.0',
        initialized: false,
        _schools: [],

        // ============================================================
        // PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[SchoolExplorer] Already initialized');
                return this;
            }

            console.log('[SchoolExplorer] Initializing...');
            this._loadSchools();
            this.initialized = true;
            return this;
        },

        /**
         * 获取所有 Schools
         */
        getSchools: function() {
            if (this._schools.length === 0) {
                this._loadSchools();
            }
            return this._schools;
        },

        /**
         * 获取 School 详情
         */
        getSchool: function(schoolId) {
            return this._schools.find(function(s) { return s.id === schoolId; }) || null;
        },

        /**
         * 获取 School 的 Programs
         */
        getPrograms: function(schoolId) {
            const academyReg = window.LawAIApp?.AcademyRegistry;
            if (academyReg && typeof academyReg.getProgramsBySchool === 'function') {
                return academyReg.getProgramsBySchool(schoolId);
            }
            return [];
        },

        /**
         * 刷新 Schools
         */
        refresh: function() {
            console.log('[SchoolExplorer] Refreshing...');
            this._loadSchools();
            return this;
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _loadSchools: function() {
            const registry = window.LawAIApp?.SchoolRegistry;
            if (registry) {
                if (typeof registry.getAll === 'function') {
                    this._schools = registry.getAll();
                } else if (typeof registry.getActive === 'function') {
                    this._schools = registry.getActive();
                } else if (typeof registry.getSchools === 'function') {
                    this._schools = registry.getSchools();
                } else {
                    this._schools = [];
                }
                console.log('[SchoolExplorer] Loaded', this._schools.length, 'schools');
                return;
            }

            // Fallback: 从 AcademyRegistry 获取
            const academyReg = window.LawAIApp?.AcademyRegistry;
            if (academyReg && typeof academyReg.getAllSchools === 'function') {
                this._schools = academyReg.getAllSchools();
                console.log('[SchoolExplorer] Loaded from AcademyRegistry:', this._schools.length);
            } else {
                console.warn('[SchoolExplorer] No registry available, using default');
                this._schools = this._getDefaultSchools();
            }
        },

        _getDefaultSchools: function() {
            return [
                { id: 'school-ai', name: 'School of Artificial Intelligence', icon: '🤖', description: 'Master AI technologies', programs: [] },
                { id: 'school-business', name: 'School of Business', icon: '💼', description: 'Lead with business strategy', programs: [] },
                { id: 'school-technology', name: 'School of Technology', icon: '⚡', description: 'Build the future with tech', programs: [] }
            ];
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.SchoolExplorer = SchoolExplorer;

    console.log('[SchoolExplorer] Module loaded (Part 57.4)');

})();
