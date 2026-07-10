// ================================================================
// ENGINE: AcademicRecordEngine
// LAYER: Core Logic Layer
// DOMAIN: Lifelong Academic Record Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Manages the learner's lifelong Academic Record.
//   Tracks courses, projects, skills, certificates, achievements,
//   and career milestones across all Schools.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   addRecord(entry)                    -> void
//   getRecords(type)                    -> array
//   getAllRecords()                     -> array
//   getRecord(id)                       -> object
//   getTimeline()                       -> array
//   getSummary()                        -> object
//   getStatus()                         -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_academic_records'
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'RecordAdded' : When a record is added
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AcademicRecordEngine = {
    _engineName: 'AcademicRecordEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Lifelong Academic Record Management',

    _initialized: false,
    _records: [],

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        this._records = this._safeGet('academic_records', []);
        console.log('📜 AcademicRecordEngine initialized with', this._records.length, 'records');
    },

    addRecord: function(entry) {
        if (!entry || !entry.type) {
            console.warn('⚠️ Invalid record entry');
            return;
        }

        var record = {
            id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: entry.type, // 'lesson' | 'project' | 'certificate' | 'skill' | 'achievement' | 'career'
            schoolId: entry.schoolId || 'school-ai',
            title: entry.title || 'Untitled',
            description: entry.description || '',
            date: entry.date || new Date().toISOString(),
            metadata: entry.metadata || {},
            createdAt: new Date().toISOString()
        };

        this._records.push(record);
        this._save();

        LawAIApp.EventBus?.emit?.('RecordAdded', { record: record });
        console.log('📜 Record added:', record.type, record.title);

        return record;
    },

    getRecords: function(type) {
        if (type) {
            return this._records.filter(function(r) { return r.type === type; });
        }
        return this._records.slice();
    },

    getAllRecords: function() {
        return this._records.slice();
    },

    getRecord: function(id) {
        return this._records.find(function(r) { return r.id === id; }) || null;
    },

    getTimeline: function() {
        return this._records.slice().sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    },

    getSummary: function() {
        var totalLessons = this.getRecords('lesson').length;
        var totalProjects = this.getRecords('project').length;
        var totalCertificates = this.getRecords('certificate').length;
        var totalAchievements = this.getRecords('achievement').length;
        var totalSkills = this.getRecords('skill').length;
        var totalCareer = this.getRecords('career').length;

        return {
            totalRecords: this._records.length,
            lessons: totalLessons,
            projects: totalProjects,
            certificates: totalCertificates,
            achievements: totalAchievements,
            skills: totalSkills,
            careerMilestones: totalCareer,
            schools: this._getUniqueSchools()
        };
    },

    getStatus: function() {
        var summary = this.getSummary();
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this._initialized,
            totalRecords: summary.totalRecords,
            summary: summary,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    },

    // ============================================================
    // PRIVATE
    // ============================================================

    _getUniqueSchools: function() {
        var schools = {};
        this._records.forEach(function(r) {
            if (r.schoolId) schools[r.schoolId] = true;
        });
        return Object.keys(schools);
    },

    _save: function() {
        this._safeSet('academic_records', this._records);
    },

    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
};

setTimeout(function() { LawAIApp.AcademicRecordEngine.init(); }, 300);
console.log('📜 AcademicRecordEngine loaded');
