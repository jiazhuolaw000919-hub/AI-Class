// ================================================================
// ENGINE: SchoolEngine
// LAYER: Core Logic Layer
// DOMAIN: Multi-School Architecture Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Manages multiple Schools within LAW AI Academy.
//   Each School is a self-contained learning domain with its own
//   courses, professors, and learning paths.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   registerSchool(school)              -> void
//   getSchool(id)                       -> School object
//   getAllSchools()                     -> array
//   getActiveSchool()                   -> School object
//   setActiveSchool(id)                 -> void
//   getStatus()                         -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (optional) : For persistent storage
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_schools'
//   - Key: 'lawai_active_school'
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'SchoolRegistered'   : When a school is registered
//   - 'SchoolActivated'    : When a school is activated
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SchoolEngine = {
    _engineName: 'SchoolEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Multi-School Architecture Management',

    _initialized: false,
    _schools: [],
    _activeSchoolId: null,

    // ============================================================
    // DEFAULT SCHOOLS
    // ============================================================
    _defaultSchools: [
        {
            id: 'school-ai',
            name: 'School of AI',
            icon: '🤖',
            description: 'Master Artificial Intelligence from fundamentals to advanced applications.',
            color: '#4a9eff',
            courseCount: 365,
            professor: 'Prof. AI',
            status: 'active'
        },
        {
            id: 'school-software',
            name: 'School of Software Engineering',
            icon: '💻',
            description: 'Build robust software with modern engineering practices.',
            color: '#22c55e',
            courseCount: 0,
            professor: 'Prof. Code',
            status: 'coming_soon'
        },
        {
            id: 'school-cloud',
            name: 'School of Cloud Computing',
            icon: '☁️',
            description: 'Master cloud infrastructure, deployment, and DevOps.',
            color: '#f59e0b',
            courseCount: 0,
            professor: 'Prof. Cloud',
            status: 'coming_soon'
        },
        {
            id: 'school-data',
            name: 'School of Data & Analytics',
            icon: '📊',
            description: 'Turn data into insights with analytics and visualization.',
            color: '#8b5cf6',
            courseCount: 0,
            professor: 'Prof. Data',
            status: 'coming_soon'
        },
        {
            id: 'school-finance',
            name: 'School of Finance & Investing',
            icon: '💰',
            description: 'Understand financial markets, investing, and wealth management.',
            color: '#f97316',
            courseCount: 0,
            professor: 'Prof. Finance',
            status: 'coming_soon'
        }
    ],

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        // 加载或初始化学校
        var saved = this._safeGet('schools', null);
        if (saved && saved.length > 0) {
            this._schools = saved;
        } else {
            this._schools = this._defaultSchools;
            this._safeSet('schools', this._schools);
        }

        // 加载激活的学校
        this._activeSchoolId = this._safeGet('active_school', 'school-ai');

        console.log('🏫 SchoolEngine initialized with', this._schools.length, 'schools');
    },

    registerSchool: function(school) {
        if (!school || !school.id) {
            console.warn('⚠️ Invalid school registration');
            return;
        }

        // 检查是否已存在
        var existing = this._schools.find(function(s) { return s.id === school.id; });
        if (existing) {
            console.warn('⚠️ School already exists:', school.id);
            return;
        }

        this._schools.push(school);
        this._safeSet('schools', this._schools);
        LawAIApp.EventBus?.emit?.('SchoolRegistered', { school: school });

        console.log('🏫 School registered:', school.name);
    },

    getSchool: function(id) {
        return this._schools.find(function(s) { return s.id === id; }) || null;
    },

    getAllSchools: function() {
        return this._schools.slice();
    },

    getActiveSchool: function() {
        var active = this.getSchool(this._activeSchoolId);
        if (!active && this._schools.length > 0) {
            return this._schools[0];
        }
        return active || null;
    },

    setActiveSchool: function(id) {
        var school = this.getSchool(id);
        if (!school) {
            console.warn('⚠️ School not found:', id);
            return;
        }

        this._activeSchoolId = id;
        this._safeSet('active_school', id);
        LawAIApp.EventBus?.emit?.('SchoolActivated', { schoolId: id, school: school });

        console.log('🏫 School activated:', school.name);
    },

    getStatus: function() {
        var active = this.getActiveSchool();
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this._initialized,
            totalSchools: this._schools.length,
            activeSchool: active ? active.name : 'none',
            activeSchoolId: this._activeSchoolId,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    },

    // ============================================================
    // PRIVATE
    // ============================================================

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

setTimeout(function() { LawAIApp.SchoolEngine.init(); }, 300);
console.log('🏫 SchoolEngine loaded');
