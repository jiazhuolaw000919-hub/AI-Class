// ================================================================
// ENGINE: ExperienceEngine
// LAYER: UI Layer
// DOMAIN: User Experience & Engagement
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Owns the user experience layer of the platform.
//   Manages micro-interactions, celebrations, themes, and focus mode.
//   Creates emotional engagement and makes learning feel rewarding.
//   Tracks experience points (XP) and milestones.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   getExperienceLevel()                -> number
//   getExperienceProgress()             -> { level, nextMilestone, progress }
//   addXP(amount)                       -> number
//   getXP()                             -> number
//   renderCelebration(message)          -> void
//   getStatus()                         -> Status object
//
//   INTERNAL (private):
//   _addExperience(amount)              -> void
//   _checkMilestones()                  -> void
//   _safeSet(key, value)                -> boolean
//   _safeGet(key, defaultValue)         -> any
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (optional) : For persistent storage
//   - EventBus (optional)     : For listening to events and emitting milestones
//   - Router (optional)       : For navigation in celebration
//
// STORAGE
// ================================================================
//   - Key: 'lawai_experience_level'
//   - Format: JSON number
//   - Description: Cumulative experience points
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'ExperienceMilestone' : When a milestone is reached
//     Payload: { level, milestone }
//
//   CONSUMED:
//   - 'LessonCompleted'     : From ProgressEngine, adds +5 XP
//   - 'PracticeCompleted'   : From PracticeEngine, adds +3 XP (correct) or +1 XP
//   - 'ProjectFinished'     : Adds +15 XP
//   - 'LevelUp'             : Adds +10 XP
//
// FUTURE COMPATIBILITY
// ================================================================
//   - Milestone levels can be expanded
//   - XP sources can be extended
//   - Celebration UI can be themed
//   - Can integrate with achievement system
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'ExperienceEngine',
    _engineVersion: '2.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'UI Layer',
    _domain: 'User Experience & Engagement',

    _initialized: false,
    _experienceLevel: 0,

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        // 加载已保存的 XP
        this._experienceLevel = this._safeGet('experience_level', 0);

        // 监听关键事件，累积体验分数
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            this._addExperience(5);
        }.bind(this));

        LawAIApp.EventBus?.on?.('PracticeCompleted', function(data) {
            this._addExperience(data?.correct ? 3 : 1);
        }.bind(this));

        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            this._addExperience(15);
        }.bind(this));

        LawAIApp.EventBus?.on?.('LevelUp', function() {
            this._addExperience(10);
        }.bind(this));

        console.log('✨ ExperienceEngine initialized, XP:', this._experienceLevel);
    },

    /**
     * getExperienceLevel()
     * 
     * @returns {number} Current experience level (XP)
     */
    getExperienceLevel: function() {
        if (!this._experienceLevel) {
            this._experienceLevel = this._safeGet('experience_level', 0);
        }
        return this._experienceLevel || 0;
    },

    /**
     * getExperienceProgress()
     * 
     * @returns {Object} { level, nextMilestone, progress }
     */
    getExperienceProgress: function() {
        var level = this.getExperienceLevel();
        var milestones = [100, 250, 500, 750, 1000];
        var nextMilestone = milestones.find(function(m) { return m > level; }) || 1000;
        var prevMilestone = [0, 100, 250, 500, 750].slice().reverse().find(function(m) { return m <= level; }) || 0;
        var progress = nextMilestone > prevMilestone ? Math.round(((level - prevMilestone) / (nextMilestone - prevMilestone)) * 100) : 100;
        return { level: level, nextMilestone: nextMilestone, progress: Math.min(100, progress) };
    },

    /**
     * addXP(amount)
     * 
     * Adds XP and returns the new total.
     * 
     * @param {number} amount - XP to add
     * @returns {number} New XP total
     */
    addXP: function(amount) {
        this._addExperience(amount || 0);
        return this.getExperienceLevel();
    },

    /**
     * getXP()
     * 
     * @returns {number} Current XP total
     */
    getXP: function() {
        return this.getExperienceLevel();
    },

    /**
     * renderCelebration(message)
     * 
     * Renders a full-page celebration view.
     * 
     * @param {string} message - Celebration message
     */
    renderCelebration: function(message) {
        var app = document.getElementById('app');
        if (!app) return;

        var html = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 60vh;
                padding: 20px;
                text-align: center;
                color: #e2e8f0;
                animation: celebrateIn 0.6s ease;
            ">
                <div style="font-size: 72px; margin-bottom: 16px;">🎉</div>
                <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">${message || 'Amazing Progress!'}</h2>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 20px;">You're building real AI expertise!</p>
                <div style="
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                ">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('dashboard') : location.reload()" style="
                        padding: 12px 32px;
                        background: #4a9eff;
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">🏠 Go to Dashboard</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: 'day-1'}) : location.reload()" style="
                        padding: 12px 32px;
                        background: rgba(255,255,255,0.06);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 10px;
                        color: #e2e8f0;
                        font-size: 15px;
                        cursor: pointer;
                    ">📖 Continue Learning</button>
                </div>
                <style>
                    @keyframes celebrateIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                </style>
            </div>
        `;

        app.innerHTML = html;
    },

    // ============================================================
    // ENGINE STATUS
    // ============================================================
    getStatus: function() {
        var progress = this.getExperienceProgress();
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this._initialized,
            experienceLevel: progress.level,
            nextMilestone: progress.nextMilestone,
            progressToNext: progress.progress,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function'),
            eventBusAvailable: !!(LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function')
        };
    },

    // ============================================================
    // PRIVATE IMPLEMENTATION
    // ============================================================

    _addExperience: function(amount) {
        var oldLevel = this._experienceLevel || 0;
        this._experienceLevel = (this._experienceLevel || 0) + amount;
        if (this._experienceLevel > 1000) this._experienceLevel = 1000;
        this._safeSet('experience_level', this._experienceLevel);

        // 检查里程碑
        this._checkMilestones(oldLevel, this._experienceLevel);
    },

    _checkMilestones: function(oldLevel, newLevel) {
        var milestones = [100, 250, 500, 750, 1000];
        for (var i = 0; i < milestones.length; i++) {
            var m = milestones[i];
            if (newLevel >= m && oldLevel < m) {
                // 刚达到里程碑
                LawAIApp.EventBus?.emit?.('ExperienceMilestone', { 
                    level: newLevel, 
                    milestone: m,
                    oldLevel: oldLevel
                });
                console.log('🏆 Experience milestone reached:', m);
            }
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
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
setTimeout(function() {
    LawAIApp.ExperienceEngine.init();
}, 300);

console.log('✨ ExperienceEngine V2.0 ready');
