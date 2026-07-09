// ===========================================
// universityOSCore.js
// 大学操作系统核心：处理注册、选课、成绩单、认证（Phase 74 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.UniversityOSCore = {
    _initialized: false,
    _students: [],

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('[UniversityOS] University OS initializing...');

        // 初始化学院（基于工厂轨道）
        var tracks = LawAIApp.CurriculumFactoryEngine?.productionTracks || [];
        if (tracks.length > 0 && LawAIApp.AIFacultyManager && typeof LawAIApp.AIFacultyManager.createFaculty === 'function') {
            for (var i = 0; i < tracks.length; i++) {
                LawAIApp.AIFacultyManager.createFaculty(tracks[i]);
            }
        }

        // 招募教授
        if (LawAIApp.AIProfessorEngine && typeof LawAIApp.AIProfessorEngine.recruitAllAgents === 'function') {
            LawAIApp.AIProfessorEngine.recruitAllAgents();
        }

        // 注册当前用户为学生
        var faculties = LawAIApp.AIFacultyManager?.getFaculties?.() || [];
        if (faculties.length > 0 && LawAIApp.StudentTrackingSystem && typeof LawAIApp.StudentTrackingSystem.enrollStudent === 'function') {
            LawAIApp.StudentTrackingSystem.enrollStudent(faculties[0].id);
        }

        console.log('[UniversityOS] University OS is now operational.');
        return this;
    },

    enrollStudent: function(studentId, facultyId) {
        var student = {
            id: studentId || 'student_' + Date.now(),
            facultyId: facultyId || null,
            enrolledAt: new Date().toISOString(),
            status: 'active',
            courses: [],
            grades: {}
        };
        this._students.push(student);
        console.log('[UniversityOS] Student enrolled:', student.id);
        return student;
    },

    getUniversityCatalog: function() {
        var catalog = {
            faculties: [],
            professors: [],
            student: null,
            curriculum: null
        };

        try {
            if (LawAIApp.AIFacultyManager && typeof LawAIApp.AIFacultyManager.getFaculties === 'function') {
                catalog.faculties = LawAIApp.AIFacultyManager.getFaculties() || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.AIProfessorEngine && typeof LawAIApp.AIProfessorEngine.getProfessors === 'function') {
                catalog.professors = LawAIApp.AIProfessorEngine.getProfessors() || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.StudentTrackingSystem && typeof LawAIApp.StudentTrackingSystem.getCurrentStudent === 'function') {
                catalog.student = LawAIApp.StudentTrackingSystem.getCurrentStudent() || null;
            }
        } catch (e) {}

        try {
            if (LawAIApp.InstitutionalCurriculumEngine && typeof LawAIApp.InstitutionalCurriculumEngine.getStudentSchedule === 'function') {
                catalog.curriculum = LawAIApp.InstitutionalCurriculumEngine.getStudentSchedule() || null;
            }
        } catch (e) {}

        return catalog;
    },

    getStudents: function() {
        return this._students;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            students: this._students.length,
            catalog: this.getUniversityCatalog()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.UniversityOSCore && typeof LawAIApp.UniversityOSCore.init === 'function') {
        LawAIApp.UniversityOSCore.init();
    }
}, 600);

console.log('[UniversityOS] UniversityOSCore V2.0 ready');
