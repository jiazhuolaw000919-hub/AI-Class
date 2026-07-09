// ===========================================
// civilizationMotivationCore.js
// 文明动机核心：定义并维护文明的进化驱动力（Phase 79 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CivilizationMotivationCore = {
    _initialized: false,

    drives: {
        humanPotentialAmplification: 100,
        knowledgeEvolution: 100,
        intelligenceExpansion: 100,
        efficiencyOptimization: 100,
        fairnessEnhancement: 100
    },

    motivationState: {
        overallMotivation: 100,
        lastReinforced: null,
        decayRate: 5
    },

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        if (!this.motivationState.lastReinforced) {
            this.motivationState.lastReinforced = new Date().toISOString();
        }

        console.log('🔥 CivilizationMotivationCore initialized');

        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            this.reinforceMotivation(5);
        }.bind(this));

        LawAIApp.EventBus?.on?.('SkillCertified', function() {
            this.reinforceMotivation(10);
        }.bind(this));

        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            this.reinforceMotivation(15);
        }.bind(this));
    },

    reinforceMotivation: function(amount) {
        amount = amount || 10;
        this.motivationState.overallMotivation = Math.min(100, this.motivationState.overallMotivation + amount);
        this.motivationState.lastReinforced = new Date().toISOString();
        LawAIApp.EventBus?.emit?.('MotivationReinforced', {
            level: this.motivationState.overallMotivation
        });
    },

    checkMotivation: function() {
        var hoursSince = 0;
        try {
            if (this.motivationState.lastReinforced) {
                hoursSince = (Date.now() - new Date(this.motivationState.lastReinforced).getTime()) / 3600000;
            }
        } catch (e) {}

        var decay = Math.floor(hoursSince / 24) * this.motivationState.decayRate;
        this.motivationState.overallMotivation = Math.max(30, 100 - decay);
        return this.motivationState.overallMotivation;
    },

    getReport: function() {
        return {
            drives: { ...this.drives },
            motivation: {
                overallMotivation: this.checkMotivation(),
                lastReinforced: this.motivationState.lastReinforced,
                decayRate: this.motivationState.decayRate
            }
        };
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            motivation: this.checkMotivation()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CivilizationMotivationCore && typeof LawAIApp.CivilizationMotivationCore.init === 'function') {
        LawAIApp.CivilizationMotivationCore.init();
    }
}, 400);

console.log('🔥 CivilizationMotivationCore V2.0 ready');
